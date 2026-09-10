import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CitedSource } from "@/lib/requirements";
import {
  buildCompanySnapshot,
  renderCompanySnapshot,
  type CompanySnapshot,
} from "./company-context";

/**
 * Contexte citable d'un dossier.
 *
 * Rassemble en un seul endroit ce que les etapes de decision, de strategie et
 * de redaction doivent transmettre au modele : l'analyse du DCE, les exigences
 * et la base entreprise, chacun sous forme d'elements identifies.
 *
 * Le modele ne voit que des identifiants. L'application seule sait les
 * retraduire en documents, pages et fiches reelles : une citation ne peut donc
 * pas etre fabriquee, et un identifiant inconnu est simplement ignore.
 */
export type ProjectContext = {
  projectName: string;
  deadline: string | null;
  dceSummary: string;
  requirementLines: string[];
  companyBase: string;
  snapshot: CompanySnapshot;
  sourcesById: Map<string, CitedSource[]>;
  /** Correspondance entre reference citable (R1, R2...) et exigence reelle. */
  requirementIdsByRef: Map<string, string>;
  hasAnalysis: boolean;
};

export async function buildProjectContext(
  admin: SupabaseClient,
  input: { organizationId: string; projectId: string },
): Promise<ProjectContext> {
  const [{ data: project }, { data: analysis }, { data: requirementRows }] =
    await Promise.all([
      admin
        .from("projects")
        .select("name, deadline")
        .eq("id", input.projectId)
        .single(),
      admin
        .from("dce_analyses")
        .select("*")
        .eq("project_id", input.projectId)
        .maybeSingle(),
      admin
        .from("requirements")
        .select(
          "id, text, category, priority, status, requirement_sources (document_id, page_number, label, project_documents (file_name))",
        )
        .eq("project_id", input.projectId)
        .order("position", { ascending: true })
        .limit(200),
    ]);

  const snapshot = await buildCompanySnapshot(admin, input.organizationId);
  const sourcesById = new Map<string, CitedSource[]>();
  const requirementIdsByRef = new Map<string, string>();

  // --- Exigences --------------------------------------------------------------
  const requirementLines = (requirementRows ?? []).map((row, index) => {
    const id = `R${index + 1}`;
    requirementIdsByRef.set(id, row.id as string);
    // La relation vers le document est de type "un seul" : le typage generique
    // la decrit comme une liste, d'ou la conversion explicite.
    const rowSources = (row.requirement_sources ?? []) as unknown as Array<{
      document_id: string | null;
      page_number: number | null;
      label: string | null;
      project_documents: { file_name: string } | null;
    }>;

    sourcesById.set(
      id,
      rowSources.map((s) => ({
        documentId: s.document_id ?? "",
        documentName: s.project_documents?.file_name ?? "Document",
        pageNumber: s.page_number,
        label: s.label ?? "",
      })),
    );

    const first = rowSources[0];
    const where = first
      ? ` — source : ${first.project_documents?.file_name ?? "document"}${
          first.page_number ? `, page ${first.page_number}` : ""
        }`
      : "";

    return `[${id}] (${row.category}, priorite ${row.priority}) ${row.text}${where}`;
  });

  // --- Base entreprise --------------------------------------------------------
  for (const item of snapshot.items) {
    sourcesById.set(item.id, [
      {
        documentId: item.recordId,
        documentName: item.label,
        pageNumber: null,
        label: "base entreprise",
      },
    ]);
  }

  // --- Analyse du DCE ---------------------------------------------------------
  let dceSummary = "Le dossier n'a pas encore ete analyse.";

  if (analysis) {
    const vigilanceLines = (
      (analysis.vigilance_points ?? []) as Array<{
        title: string;
        detail: string;
        severity: string;
        sources: CitedSource[];
      }>
    ).map((point, index) => {
      const id = `V${index + 1}`;
      sourcesById.set(id, point.sources ?? []);
      return `[${id}] (${point.severity}) ${point.title} : ${point.detail}`;
    });

    const criteriaLines = (
      (analysis.award_criteria ?? []) as Array<{
        label: string;
        weight: string;
        detail: string;
        sources: CitedSource[];
      }>
    ).map((c, index) => {
      const id = `K${index + 1}`;
      sourcesById.set(id, c.sources ?? []);
      return `[${id}] ${c.label} (${c.weight}) : ${c.detail}`;
    });

    dceSummary = [
      `Objet : ${analysis.subject ?? "non precise"}`,
      `Acheteur : ${analysis.buyer ?? "non precise"}`,
      `Lot : ${analysis.lot ?? "non precise"}`,
      `Montant : ${analysis.amount ?? "non precise"}`,
      `Duree : ${analysis.duration ?? "non precisee"}`,
      `Visite de site : ${analysis.site_visit ?? "non precisee"}`,
      `Variantes : ${analysis.variants ?? "non precisees"}`,
      "",
      "Criteres d'attribution :",
      criteriaLines.join("\n") || "Aucun critere identifie.",
      "",
      "Points de vigilance :",
      vigilanceLines.join("\n") || "Aucun point de vigilance releve.",
    ].join("\n");
  }

  return {
    projectName: (project?.name as string) ?? "Consultation",
    deadline: (project?.deadline as string) ?? null,
    dceSummary,
    requirementLines,
    companyBase: snapshot.isEmpty
      ? "La base entreprise est vide : aucune reference, aucun moyen, aucune certification n'a ete renseigne."
      : renderCompanySnapshot(snapshot),
    snapshot,
    sourcesById,
    requirementIdsByRef,
    hasAnalysis: Boolean(analysis),
  };
}

/** Les identifiants inconnus sont ignores : aucune source ne peut etre forgee. */
export function resolveSources(
  ids: string[],
  index: Map<string, CitedSource[]>,
): CitedSource[] {
  const out: CitedSource[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    for (const source of index.get(id) ?? []) {
      const key = `${source.documentId}-${source.pageNumber ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(source);
    }
  }

  return out;
}
