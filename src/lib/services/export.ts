import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/projects";
import { safeFileName } from "@/lib/documents";
import { buildDocx, type ExportPayload } from "./export-docx";

export type ExportFormat = "DOCX" | "PDF";

export type ExportResult = {
  fileName: string;
  url: string;
  sizeBytes: number;
  sections: number;
};

export class ExportError extends Error {
  constructor(readonly userMessage: string) {
    super(userMessage);
    this.name = "ExportError";
  }
}

/** Duree de validite du lien de telechargement. */
const LINK_TTL_SECONDS = 300;

export async function exportMemory(input: {
  organizationId: string;
  projectId: string;
  userId: string;
  format: ExportFormat;
  includeSources: boolean;
}): Promise<ExportResult> {
  const admin = createAdminClient();

  const [{ data: project }, { data: organization }, { data: sections }] =
    await Promise.all([
      admin
        .from("projects")
        .select("name, reference, buyer, lot, deadline")
        .eq("id", input.projectId)
        .single(),
      admin
        .from("organizations")
        .select("name")
        .eq("id", input.organizationId)
        .single(),
      admin
        .from("memory_sections")
        .select("number, title, content, memory_sources (label)")
        .eq("project_id", input.projectId)
        .order("position", { ascending: true }),
    ]);

  if (!project || !organization) {
    throw new ExportError("Le dossier est introuvable.");
  }

  const allSections = sections ?? [];
  if (allSections.length === 0) {
    throw new ExportError(
      "Le plan du memoire n'a pas encore ete cree. Il n'y a rien a exporter.",
    );
  }

  const written = allSections.filter(
    (s) => ((s.content as string) ?? "").trim().length > 0,
  );
  if (written.length === 0) {
    throw new ExportError(
      "Aucun chapitre n'est redige. Il n'y a rien a exporter.",
    );
  }

  const payload: ExportPayload = {
    organizationName: organization.name as string,
    projectName: project.name as string,
    reference: (project.reference as string) ?? null,
    buyer: (project.buyer as string) ?? null,
    lot: (project.lot as string) ?? null,
    deadline: project.deadline ? formatDate(project.deadline as string) : null,
    includeSources: input.includeSources,
    sections: allSections.map((s) => ({
      number: (s.number as string) ?? null,
      title: s.title as string,
      content: (s.content as string) ?? null,
      sources: (
        (s.memory_sources ?? []) as unknown as Array<{ label: string }>
      ).map((source) => source.label),
    })),
  };

  // --- Production du fichier --------------------------------------------------
  let bytes: Buffer;
  try {
    if (input.format === "DOCX") {
      bytes = await buildDocx(payload);
    } else {
      // Import differe : le moteur de rendu PDF est volumineux et n'a pas a
      // etre charge lorsqu'on exporte au format Word.
      const { buildPdf } = await import("./export-pdf");
      bytes = await buildPdf(payload);
    }
  } catch {
    throw new ExportError(
      "Le document n'a pas pu etre produit. Merci de reessayer.",
    );
  }

  // --- Enregistrement ---------------------------------------------------------
  const extension = input.format === "DOCX" ? "docx" : "pdf";
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = safeFileName(
    `Memoire-technique-${payload.projectName}-${stamp}.${extension}`,
  );
  const path = `${input.organizationId}/${input.projectId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await admin.storage
    .from("exports")
    .upload(path, bytes, {
      contentType:
        input.format === "DOCX"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    throw new ExportError(
      "Le document a ete produit mais n'a pas pu etre enregistre.",
    );
  }

  await admin.from("exports").insert({
    organization_id: input.organizationId,
    project_id: input.projectId,
    format: input.format,
    file_name: fileName,
    storage_path: path,
    size_bytes: bytes.byteLength,
    section_count: written.length,
    created_by: input.userId,
  });

  await admin
    .from("projects")
    .update({ status: "EXPORTED" })
    .eq("id", input.projectId);

  // Lien signe de courte duree : le bucket reste prive.
  const { data: signed } = await admin.storage
    .from("exports")
    .createSignedUrl(path, LINK_TTL_SECONDS);

  if (!signed) {
    throw new ExportError(
      "Le document a ete enregistre mais le lien de telechargement n'a pas pu etre cree.",
    );
  }

  return {
    fileName,
    url: signed.signedUrl,
    sizeBytes: bytes.byteLength,
    sections: written.length,
  };
}
