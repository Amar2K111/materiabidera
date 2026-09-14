import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bestSimilarities } from "@/lib/engine/semantic";

/**
 * Vecteurs de recherche par le sens (Gemini embeddings).
 *
 * Utilises pour choisir les preuves a transmettre au moteur de redaction. Ils
 * ne sont qu'une aide au classement : si la cle Gemini manque ou si l'appel
 * echoue, la selection retombe sur la recherche par mots-cles, sans erreur.
 * Aucun texte n'est vectorise deux fois : cache en base (migration 0009), et a
 * defaut cache en memoire du serveur.
 */

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;
/** ~2 000 jetons maximum par texte pour ce modele. */
const MAX_CHARS = 7000;
const BATCH = 100;
const MEMORY_LIMIT = 5000;

type TaskType = "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT";

const memory = new Map<string, Float32Array>();
let tableReady: { ready: boolean; at: number } | null = null;

function apiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

export function isSemanticSearchAvailable(): boolean {
  return Boolean(apiKey());
}

function hashOf(text: string, task: TaskType) {
  return createHash("sha256").update(`${MODEL}|${DIMENSIONS}|${task}|${text}`).digest("hex");
}

function encode(vector: Float32Array): string {
  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength).toString("base64");
}

function decode(value: string): Float32Array {
  const bytes = Buffer.from(value, "base64");
  return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
}

async function hasTable(admin: SupabaseClient): Promise<boolean> {
  if (tableReady && Date.now() - tableReady.at < 5 * 60 * 1000) return tableReady.ready;
  const { error } = await admin.from("embeddings").select("id").limit(1);
  tableReady = { ready: !error, at: Date.now() };
  return tableReady.ready;
}

async function callApi(texts: string[], task: TaskType): Promise<Float32Array[]> {
  const key = apiKey();
  if (!key) throw new Error("GEMINI_API_KEY absente");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${MODEL}`,
          content: { parts: [{ text }] },
          taskType: task,
          outputDimensionality: DIMENSIONS,
        })),
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  if (!response.ok) {
    throw new Error(`embeddings ${response.status} : ${(await response.text()).slice(0, 200)}`);
  }
  const json = (await response.json()) as { embeddings?: Array<{ values: number[] }> };
  const vectors = (json.embeddings ?? []).map((e) => Float32Array.from(e.values));
  if (vectors.length !== texts.length) throw new Error("embeddings : reponse incomplete");
  return vectors;
}

/**
 * Vecteurs des textes, dans l'ordre. Retourne null si la recherche par le sens
 * n'est pas disponible : l'appelant garde alors la recherche par mots-cles.
 */
export async function embedTexts(
  admin: SupabaseClient,
  organizationId: string,
  texts: string[],
  task: TaskType,
): Promise<Float32Array[] | null> {
  if (!isSemanticSearchAvailable() || texts.length === 0) return texts.length === 0 ? [] : null;

  try {
    const prepared = texts.map((t) => t.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS) || "-");
    const hashes = prepared.map((t) => hashOf(t, task));
    const found = new Map<string, Float32Array>();

    for (const hash of hashes) {
      const hit = memory.get(`${organizationId}|${hash}`);
      if (hit) found.set(hash, hit);
    }

    const persistent = await hasTable(admin);
    const unknown = [...new Set(hashes.filter((h) => !found.has(h)))];
    if (persistent && unknown.length > 0) {
      for (let i = 0; i < unknown.length; i += BATCH) {
        const { data } = await admin
          .from("embeddings")
          .select("content_hash, vector")
          .eq("organization_id", organizationId)
          .in("content_hash", unknown.slice(i, i + BATCH));
        for (const row of data ?? []) {
          found.set(row.content_hash as string, decode(row.vector as string));
        }
      }
    }

    // Textes jamais vectorises : appel au modele, par lots.
    const missing: Array<{ hash: string; text: string }> = [];
    const seen = new Set<string>();
    hashes.forEach((hash, index) => {
      if (found.has(hash) || seen.has(hash)) return;
      seen.add(hash);
      missing.push({ hash, text: prepared[index] });
    });

    for (let i = 0; i < missing.length; i += BATCH) {
      const batch = missing.slice(i, i + BATCH);
      const vectors = await callApi(batch.map((m) => m.text), task);
      batch.forEach((m, j) => found.set(m.hash, vectors[j]));
      if (persistent) {
        await admin.from("embeddings").upsert(
          batch.map((m, j) => ({
            organization_id: organizationId,
            content_hash: m.hash,
            model: MODEL,
            dimensions: DIMENSIONS,
            vector: encode(vectors[j]),
          })),
          { onConflict: "organization_id,content_hash", ignoreDuplicates: true },
        );
      }
    }

    for (const hash of hashes) {
      if (memory.size >= MEMORY_LIMIT) memory.delete(memory.keys().next().value as string);
      memory.set(`${organizationId}|${hash}`, found.get(hash)!);
    }

    return hashes.map((hash) => found.get(hash)!);
  } catch (error) {
    console.warn("Recherche par le sens indisponible, repli sur les mots-cles :", error);
    return null;
  }
}

/**
 * Similarite de chaque element avec la ou les requetes (meilleure des
 * requetes). Null si la recherche par le sens est indisponible.
 */
export async function semanticSimilarities(
  admin: SupabaseClient,
  organizationId: string,
  queries: string[],
  items: Array<{ id: string; text: string }>,
): Promise<Map<string, number> | null> {
  const usableQueries = queries.map((q) => q.trim()).filter(Boolean);
  if (usableQueries.length === 0 || items.length === 0) return null;

  const [queryVectors, itemVectors] = await Promise.all([
    embedTexts(admin, organizationId, usableQueries, "RETRIEVAL_QUERY"),
    embedTexts(admin, organizationId, items.map((i) => i.text), "RETRIEVAL_DOCUMENT"),
  ]);
  if (!queryVectors || !itemVectors) return null;

  return bestSimilarities(
    queryVectors,
    new Map(items.map((item, index) => [item.id, itemVectors[index]])),
  );
}
