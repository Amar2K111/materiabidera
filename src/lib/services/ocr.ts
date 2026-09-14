import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AiError, getAiProvider, isAiConfigured } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  ScanTranscriptionSchema,
  TRANSCRIBE_SYSTEM,
  transcribePrompt,
} from "@/lib/ai/prompts/transcribe-scan";
import type { ExtractedUnit } from "@/lib/extraction/types";

/**
 * Limites de la reconnaissance en une passe.
 *
 * Le fichier est transmis tel quel au moteur : au-dela, la requete depasserait
 * la taille acceptee ou le volume de texte qu'une reponse peut contenir.
 */
const MAX_OCR_BYTES = 18 * 1024 * 1024;
const MAX_OCR_PAGES = 40;

export type OcrOutcome =
  | { ok: true; units: ExtractedUnit[] }
  | { ok: false; message: string };

/**
 * Reconnaissance du texte d'un PDF scanne (section 9 : "OCR si necessaire").
 *
 * Le texte obtenu suit le meme chemin que celui d'un PDF natif : pages
 * numerotees, donc citables. Rien n'est invente : une page illisible reste
 * vide et n'est pas enregistree.
 */
export async function transcribeScannedPdf(input: {
  admin: SupabaseClient;
  organizationId: string;
  projectId: string | null;
  fileName: string;
  bytes: Uint8Array;
  pageCount: number;
}): Promise<OcrOutcome> {
  if (!isAiConfigured()) {
    return {
      ok: false,
      message:
        "Ce document est un scan sans texte sélectionnable, et le moteur d'analyse n'est pas configuré pour le reconnaître. Fournissez une version texte de cette pièce.",
    };
  }

  if (input.bytes.byteLength > MAX_OCR_BYTES || input.pageCount > MAX_OCR_PAGES) {
    return {
      ok: false,
      message: `Ce document est un scan de ${input.pageCount} page(s) trop volumineux pour être reconnu en une fois (limite : ${MAX_OCR_PAGES} pages, 18 Mo). Découpez-le ou fournissez une version texte.`,
    };
  }

  const provider = getAiProvider();
  const run = await startRun(input.admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "ocr_scan",
    provider: provider.id,
    model: provider.model,
    meta: { pages: input.pageCount, bytes: input.bytes.byteLength },
  });

  try {
    const { value, usage } = await provider.generateObjectFromFile({
      system: TRANSCRIBE_SYSTEM,
      prompt: transcribePrompt({
        fileName: input.fileName,
        pageCount: input.pageCount,
      }),
      schema: ScanTranscriptionSchema,
      schemaName: "ScanTranscription",
      // Environ 1 500 jetons par page dense, plafonne par ce qu'un modele
      // accepte en sortie.
      maxOutputTokens: Math.min(64000, 2000 + input.pageCount * 1500),
      file: { data: input.bytes, mimeType: "application/pdf" },
    });

    // Une page hors du document est ecartee : on ne cite jamais une page
    // qui n'existe pas.
    const byPage = new Map<number, string>();
    for (const p of value.pages) {
      if (p.page > input.pageCount || byPage.has(p.page)) continue;
      const text = p.text.replace(/[ \t]+/g, " ").trim();
      if (text.length === 0 || text === "[illisible]") continue;
      byPage.set(p.page, text);
    }
    const units: ExtractedUnit[] = [...byPage.entries()]
      .sort(([a], [b]) => a - b)
      .map(([page, text]) => ({ pageNumber: page, label: `page ${page}`, text }));

    await finishRun(input.admin, run, {
      status: "SUCCEEDED",
      meta: { pagesRecognized: units.length, outputTokens: usage.outputTokens ?? 0 },
    });

    if (units.length === 0) {
      return {
        ok: false,
        message:
          "Ce document scanné est illisible : aucun texte n'a pu être reconnu. Fournissez une version de meilleure qualité.",
      };
    }

    return { ok: true, units };
  } catch (error) {
    await finishRun(input.admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    return {
      ok: false,
      message:
        error instanceof AiError && error.kind === "rate_limited"
          ? "La reconnaissance du texte de ce scan est momentanément indisponible. Supprimez puis redéposez cette pièce dans quelques minutes."
          : "Le texte de ce document scanné n'a pas pu être reconnu. Fournissez une version texte de cette pièce.",
    };
  }
}
