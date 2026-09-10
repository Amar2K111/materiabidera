import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractionOf, ExtractionError } from "@/lib/extraction";
import { extensionOf, guessKindFromName, safeFileName } from "@/lib/documents";
import { getAiProvider, isAiConfigured } from "@/lib/ai";
import {
  CLASSIFY_SYSTEM,
  DocumentClassificationSchema,
  classifyPrompt,
} from "@/lib/ai/prompts/classify-document";
import { finishRun, startRun } from "@/lib/ai/run-log";

export type IngestOutcome = {
  documentId: string;
  fileName: string;
  status: "EXTRACTED" | "FAILED" | "EXPANDED";
  /** Message affichable tel quel si le traitement a echoue. */
  message?: string;
  pageCount?: number | null;
  addedDocuments?: number;
};

/**
 * Traite UNE piece a la fois.
 *
 * Le decoupage est volontaire : un DCE peut peser des centaines de pages, et
 * une requete HTTP a une duree limitee. Le client rappelle cette operation
 * tant qu'il reste des pieces en attente, ce qui donne une progression reelle
 * plutot qu'une barre qui avance toute seule.
 */
export async function ingestNextDocument(input: {
  organizationId: string;
  projectId: string;
}): Promise<IngestOutcome | null> {
  const admin = createAdminClient();

  const { data: doc } = await admin
    .from("project_documents")
    .select("id, file_name, storage_path, kind, status")
    .eq("project_id", input.projectId)
    .eq("organization_id", input.organizationId)
    .eq("status", "UPLOADED")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Plus rien a traiter.
  if (!doc) return null;

  await admin
    .from("project_documents")
    .update({ status: "EXTRACTING" })
    .eq("id", doc.id);

  const documentId = doc.id as string;
  const fileName = doc.file_name as string;
  const storagePath = doc.storage_path as string;

  try {
    const { data: file, error: downloadError } = await admin.storage
      .from("dce")
      .download(storagePath);

    if (downloadError || !file) {
      return await markFailed(
        admin,
        documentId,
        fileName,
        "Le fichier n'a pas pu etre recupere depuis le stockage.",
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    // Une archive n'est pas analysee telle quelle : on en sort les pieces,
    // qui seront traitees aux passages suivants.
    if (extensionOf(fileName) === "zip") {
      const added = await expandArchive({
        admin,
        bytes,
        organizationId: input.organizationId,
        projectId: input.projectId,
      });

      await admin
        .from("project_documents")
        .update({ status: "EXTRACTED", page_count: 0, kind: "AUTRE" })
        .eq("id", documentId);

      return {
        documentId,
        fileName,
        status: "EXPANDED",
        addedDocuments: added,
      };
    }

    const result = await extractionOf(bytes, fileName);

    if (result.needsOcr) {
      return await markFailed(
        admin,
        documentId,
        fileName,
        "Ce document est un scan sans texte selectionnable. La reconnaissance optique n'est pas encore en service : fournissez une version texte de cette piece.",
      );
    }

    if (result.units.length === 0) {
      return await markFailed(
        admin,
        documentId,
        fileName,
        "Ce document ne contient aucun texte exploitable.",
      );
    }

    // Le texte deja extrait pour cette piece est remplace, jamais duplique.
    await admin.from("document_pages").delete().eq("document_id", documentId);

    await admin.from("document_pages").insert(
      result.units.map((u) => ({
        organization_id: input.organizationId,
        project_id: input.projectId,
        document_id: documentId,
        page_number: u.pageNumber,
        label: u.label,
        content: u.text,
        char_count: u.text.length,
      })),
    );

    const kind = await classifyDocument({
      admin,
      organizationId: input.organizationId,
      projectId: input.projectId,
      fileName,
      excerpt: result.units
        .slice(0, 3)
        .map((u) => u.text)
        .join("\n\n")
        .slice(0, 6000),
    });

    await admin
      .from("project_documents")
      .update({
        status: "EXTRACTED",
        page_count: result.pageCount,
        failure_reason: null,
        ...(kind ? { kind } : {}),
      })
      .eq("id", documentId);

    return {
      documentId,
      fileName,
      status: "EXTRACTED",
      pageCount: result.pageCount,
    };
  } catch (error) {
    const message =
      error instanceof ExtractionError
        ? error.userMessage
        : "Ce document n'a pas pu etre lu.";
    return markFailed(admin, documentId, fileName, message);
  }
}

async function markFailed(
  admin: SupabaseClient,
  documentId: string,
  fileName: string,
  message: string,
): Promise<IngestOutcome> {
  await admin
    .from("project_documents")
    .update({ status: "FAILED", failure_reason: message })
    .eq("id", documentId);

  return { documentId, fileName, status: "FAILED", message };
}

/**
 * Classement du document d'apres son contenu.
 *
 * Sans moteur configure, on conserve le pre-classement issu du nom de fichier
 * plutot que d'afficher un resultat qui n'a pas eu lieu (section 37).
 */
async function classifyDocument(input: {
  admin: SupabaseClient;
  organizationId: string;
  projectId: string;
  fileName: string;
  excerpt: string;
}): Promise<string | null> {
  if (!isAiConfigured()) return null;

  let provider;
  try {
    provider = getAiProvider();
  } catch {
    return null;
  }

  const run = await startRun(input.admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "classify_document",
    provider: provider.id,
    model: provider.model,
    meta: { excerptChars: input.excerpt.length },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: CLASSIFY_SYSTEM,
      prompt: classifyPrompt({
        fileName: input.fileName,
        excerpt: input.excerpt,
      }),
      schema: DocumentClassificationSchema,
      schemaName: "DocumentClassification",
      maxOutputTokens: 1000,
    });

    await finishRun(input.admin, run, {
      status: "SUCCEEDED",
      meta: {
        kind: value.kind,
        confidence: value.confidence,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    // Une classification hesitante ne remplace pas le pre-classement.
    if (value.confidence === "LOW" || value.kind === "UNKNOWN") {
      return guessKindFromName(input.fileName);
    }
    return value.kind;
  } catch (error) {
    await finishRun(input.admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    return null;
  }
}

/** Extrait les pieces d'une archive et les enregistre comme documents. */
async function expandArchive(input: {
  admin: SupabaseClient;
  bytes: Uint8Array;
  organizationId: string;
  projectId: string;
}): Promise<number> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(input.bytes);

  const SUPPORTED = new Set(["pdf", "docx", "xlsx", "doc", "xls"]);
  let added = 0;

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;

    const base = entry.name.split("/").pop() ?? entry.name;
    // Les fichiers caches des systemes de fichiers ne sont pas des pieces.
    if (base.startsWith(".") || base.startsWith("__")) continue;
    if (!SUPPORTED.has(extensionOf(base))) continue;

    const content = await entry.async("uint8array");
    if (content.byteLength === 0) continue;

    const path = `${input.organizationId}/${input.projectId}/${crypto.randomUUID()}-${safeFileName(base)}`;

    const { error } = await input.admin.storage
      .from("dce")
      .upload(path, content, { upsert: false });
    if (error) continue;

    await input.admin.from("project_documents").insert({
      organization_id: input.organizationId,
      project_id: input.projectId,
      storage_path: path,
      file_name: base,
      size_bytes: content.byteLength,
      kind: guessKindFromName(base),
      status: "UPLOADED",
    });

    added += 1;
  }

  return added;
}
