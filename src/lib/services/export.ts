import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/projects";
import { stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import type { ResponseFormat } from "@/lib/requirements";
import { buildMemoryDocument, exportFileName, type MemoryDocument } from "@/lib/export/document";
import { checkDocx, checkPdf, parsePageLimit, type ExportCheckReport } from "@/lib/export/checks";
import { buildDocx } from "./export-docx";

export type ExportFormat = "DOCX" | "PDF";

export type ExportOptions = {
  /** Liste des sources a la fin de chaque chapitre (usage interne). */
  includeSources: boolean;
  /** Annexes : references et certifications citees dans le memoire. */
  includeAnnexes: boolean;
};

export type ExportResult = {
  fileName: string;
  url: string;
  sizeBytes: number;
  sections: number;
  checks: ExportCheckReport;
};

export type PreviewResult = {
  fileName: string;
  pdfBase64: string;
  pages: number;
  checks: ExportCheckReport;
};

export class ExportError extends Error {
  constructor(readonly userMessage: string) {
    super(userMessage);
    this.name = "ExportError";
  }
}

/** Duree de validite du lien de telechargement. */
const LINK_TTL_SECONDS = 300;

type Prepared = {
  model: MemoryDocument;
  writtenCount: number;
  pageLimit: number | null;
  names: { companyName: string; lot: string | null; reference: string | null };
};

/** Rassemble les donnees du dossier et construit le modele documentaire. */
async function prepare(
  admin: SupabaseClient,
  input: { organizationId: string; projectId: string } & ExportOptions,
): Promise<Prepared> {
  const engine = await isEngineSchemaReady();

  const [{ data: project }, { data: organization }, { data: sections }, { data: analysis }] =
    await Promise.all([
      admin
        .from("projects")
        .select("name, reference, buyer, lot")
        .eq("id", input.projectId)
        .single(),
      admin.from("organizations").select("name").eq("id", input.organizationId).single(),
      admin
        .from("memory_sections")
        .select("number, title, content, memory_sources (label, company_table, company_record_id)")
        .eq("project_id", input.projectId)
        .order("position", { ascending: true }),
      admin
        .from("dce_analyses")
        .select(engine ? "subject, buyer, lot, response_format" : "subject, buyer, lot")
        .eq("project_id", input.projectId)
        .maybeSingle(),
    ]);

  if (!project || !organization) {
    throw new ExportError("Le dossier est introuvable.");
  }

  const allSections = (sections ?? []) as unknown as Array<{
    number: string | null;
    title: string;
    content: string | null;
    memory_sources: Array<{ label: string; company_table: string | null; company_record_id: string | null }>;
  }>;
  if (allSections.length === 0) {
    throw new ExportError("Le plan du mémoire n'a pas encore été créé. Il n'y a rien à exporter.");
  }
  const written = allSections.filter((s) => (s.content ?? "").trim().length > 0);
  if (written.length === 0) {
    throw new ExportError("Aucun chapitre n'est rédigé. Il n'y a rien à exporter.");
  }

  // Preuves de l'entreprise effectivement citees dans le memoire.
  const cited = (table: string) => [
    ...new Set(
      allSections.flatMap((s) =>
        (s.memory_sources ?? [])
          .filter((src) => src.company_table === table && src.company_record_id)
          .map((src) => src.company_record_id as string),
      ),
    ),
  ];
  const referenceIds = cited("company_references");
  const certificationIds = cited("company_certifications");
  const qualificationIds = cited("company_qualifications");

  const [references, certifications, qualifications] = input.includeAnnexes
    ? await Promise.all([
        referenceIds.length
          ? admin
              .from("company_references")
              .select("name, client, year, work_type, amount, location")
              .eq("organization_id", input.organizationId)
              .in("id", referenceIds)
          : Promise.resolve({ data: [] }),
        certificationIds.length
          ? admin
              .from("company_certifications")
              .select("name, reference, valid_until")
              .eq("organization_id", input.organizationId)
              .in("id", certificationIds)
          : Promise.resolve({ data: [] }),
        qualificationIds.length
          ? admin
              .from("company_qualifications")
              .select("name, reference, valid_until")
              .eq("organization_id", input.organizationId)
              .in("id", qualificationIds)
          : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const row = analysis as unknown as {
    subject: string | null;
    buyer: string | null;
    lot: string | null;
    response_format?: ResponseFormat | null;
  } | null;
  const format = row?.response_format ?? null;

  const companyName = organization.name as string;
  const lot = (project.lot as string) || row?.lot || null;
  const reference = (project.reference as string) || null;

  const model = buildMemoryDocument({
    companyName,
    projectName: project.name as string,
    subject: row?.subject ?? null,
    buyer: (project.buyer as string) || row?.buyer || null,
    lot,
    reference,
    issuedOn: formatDate(new Date().toISOString()),
    includeSources: input.includeSources,
    includeAnnexes: input.includeAnnexes,
    sections: allSections.map((s) => ({
      number: s.number,
      title: s.title,
      content: stripCitationCodes(s.content),
      sources: [...new Set((s.memory_sources ?? []).map((src) => src.label))],
    })),
    references: ((references.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      name: String(r.name),
      client: (r.client as string) ?? null,
      year: (r.year as number) ?? null,
      workType: (r.work_type as string) ?? null,
      amount: (r.amount as string) ?? null,
      location: (r.location as string) ?? null,
    })),
    certifications: [
      ...((certifications.data ?? []) as Array<Record<string, unknown>>),
      ...((qualifications.data ?? []) as Array<Record<string, unknown>>),
    ].map((c) => ({
      name: String(c.name),
      reference: (c.reference as string) ?? null,
      validUntil: c.valid_until ? formatDate(String(c.valid_until)) : null,
    })),
  });

  return {
    model,
    writtenCount: written.length,
    pageLimit: parsePageLimit(format?.pageLimit),
    names: { companyName, lot, reference },
  };
}

async function renderPdf(prepared: Prepared) {
  // Import differe : le moteur de rendu PDF est volumineux et n'a pas a etre
  // charge lorsqu'on exporte au format Word.
  const { buildPdf } = await import("./export-pdf");
  const pdf = await buildPdf(prepared.model);
  const checks = await checkPdf({
    bytes: new Uint8Array(pdf.bytes),
    pages: pdf.pages,
    model: prepared.model,
    starts: pdf.starts,
    pageLimit: prepared.pageLimit,
  });
  return { bytes: pdf.bytes, pages: pdf.pages.length, checks };
}

/** Apercu du document final : PDF produit et controle, sans enregistrement. */
export async function previewMemory(
  input: { organizationId: string; projectId: string } & ExportOptions,
): Promise<PreviewResult> {
  const admin = createAdminClient();
  const prepared = await prepare(admin, input);

  let rendered;
  try {
    rendered = await renderPdf(prepared);
  } catch (error) {
    console.error("Apercu du memoire impossible :", error);
    throw new ExportError("L'aperçu n'a pas pu être produit. Merci de réessayer.");
  }

  return {
    fileName: exportFileName({ ...prepared.names, extension: "pdf" }),
    pdfBase64: rendered.bytes.toString("base64"),
    pages: rendered.pages,
    checks: rendered.checks,
  };
}

export async function exportMemory(
  input: {
    organizationId: string;
    projectId: string;
    userId: string;
    format: ExportFormat;
  } & ExportOptions,
): Promise<ExportResult> {
  const admin = createAdminClient();
  const prepared = await prepare(admin, input);

  // --- Production et controle du fichier --------------------------------------
  let bytes: Buffer;
  let checks: ExportCheckReport;
  try {
    if (input.format === "DOCX") {
      bytes = await buildDocx(prepared.model);
      checks = await checkDocx({ bytes: new Uint8Array(bytes), model: prepared.model });
    } else {
      const rendered = await renderPdf(prepared);
      bytes = rendered.bytes;
      checks = rendered.checks;
    }
  } catch (error) {
    console.error("Export du memoire impossible :", error);
    throw new ExportError("Le document n'a pas pu être produit. Merci de réessayer.");
  }

  // --- Enregistrement ---------------------------------------------------------
  const extension = input.format === "DOCX" ? "docx" : "pdf";
  const fileName = exportFileName({ ...prepared.names, extension });
  const path = `${input.organizationId}/${input.projectId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await admin.storage.from("exports").upload(path, bytes, {
    contentType:
      input.format === "DOCX"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf",
    upsert: false,
  });

  if (uploadError) {
    throw new ExportError("Le document a été produit mais n'a pas pu être enregistré.");
  }

  await admin.from("exports").insert({
    organization_id: input.organizationId,
    project_id: input.projectId,
    format: input.format,
    file_name: fileName,
    storage_path: path,
    size_bytes: bytes.byteLength,
    section_count: prepared.writtenCount,
    created_by: input.userId,
  });

  await admin.from("projects").update({ status: "EXPORTED" }).eq("id", input.projectId);

  // Lien signe de courte duree : le bucket reste prive.
  const { data: signed } = await admin.storage
    .from("exports")
    // "download" force l'enregistrement du fichier sous son nom lisible.
    .createSignedUrl(path, LINK_TTL_SECONDS, { download: fileName });

  if (!signed) {
    throw new ExportError(
      "Le document a été enregistré mais le lien de téléchargement n'a pas pu être créé.",
    );
  }

  return {
    fileName,
    url: signed.signedUrl,
    sizeBytes: bytes.byteLength,
    sections: prepared.writtenCount,
    checks,
  };
}
