import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  MAX_TOTAL_CHARS,
  clampExcerpt,
  type Excerpt,
} from "@/lib/ai/prompts/shared";
import {
  DceOverviewSchema,
  OVERVIEW_SYSTEM,
  overviewPrompt,
} from "@/lib/ai/prompts/dce-overview";
import {
  REQUIREMENTS_SYSTEM,
  RequirementsSchema,
  requirementsPrompt,
  type ExtractedRequirement,
} from "@/lib/ai/prompts/extract-requirements";

/** Une unite de texte, enrichie de sa provenance reelle. */
type SourceUnit = Excerpt & {
  documentId: string;
  pageNumber: number | null;
};

/**
 * Ordre de depouillement.
 *
 * Le reglement de consultation porte les regles du jeu, le CCAP les
 * obligations contractuelles : ce sont les pieces les plus denses en
 * exigences, elles passent en premier lorsque le budget de contexte est
 * limite.
 */
const KIND_PRIORITY: Record<string, number> = {
  RC: 0,
  CCAP: 1,
  CADRE_MEMOIRE: 2,
  CCTP: 3,
  ACTE_ENGAGEMENT: 4,
  ADMINISTRATIF: 5,
  DPGF: 6,
  BPU: 7,
  ANNEXE: 8,
  AUTRE: 9,
  PLAN: 10,
  UNKNOWN: 11,
};

/** Budget par passe d'extraction d'exigences. */
const BATCH_CHARS = 90_000;

export type AnalysisOutcome = {
  requirements: number;
  vigilancePoints: number;
  documentsUsed: number;
  pagesUsed: number;
};

export async function analyzeProject(input: {
  organizationId: string;
  projectId: string;
  projectName: string;
}): Promise<AnalysisOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const units = await loadSourceUnits(admin, input);
  if (units.length === 0) {
    throw new AiError(
      "Aucun texte exploitable pour ce dossier.",
      "invalid_output",
    );
  }

  const byId = new Map(units.map((u) => [u.id, u]));

  await admin
    .from("projects")
    .update({ status: "ANALYZING" })
    .eq("id", input.projectId);

  try {
    const overview = await runOverview({
      admin,
      provider,
      input,
      units: units.slice(0, 60),
      byId,
    });

    const requirementCount = await runRequirements({
      admin,
      provider,
      input,
      units,
      byId,
    });

    await admin
      .from("projects")
      .update({ status: "ANALYZED" })
      .eq("id", input.projectId);

    return {
      requirements: requirementCount,
      vigilancePoints: overview,
      documentsUsed: new Set(units.map((u) => u.documentId)).size,
      pagesUsed: units.length,
    };
  } catch (error) {
    // Le dossier ne doit pas rester bloque sur "analyse en cours".
    await admin
      .from("projects")
      .update({ status: "DRAFT" })
      .eq("id", input.projectId);
    throw error;
  }
}

/** Charge le texte extrait, ordonne par importance de la piece. */
async function loadSourceUnits(
  admin: SupabaseClient,
  input: { organizationId: string; projectId: string },
): Promise<SourceUnit[]> {
  const { data } = await admin
    .from("document_pages")
    .select(
      "id, document_id, page_number, label, content, project_documents (file_name, kind)",
    )
    .eq("project_id", input.projectId)
    .eq("organization_id", input.organizationId)
    .order("page_number", { ascending: true, nullsFirst: true });

  if (!data) return [];

  const rows = data.map((row) => {
    const doc = row.project_documents as unknown as {
      file_name: string;
      kind: string;
    } | null;
    return {
      documentId: row.document_id as string,
      documentName: doc?.file_name ?? "document",
      kind: doc?.kind ?? "UNKNOWN",
      pageNumber: row.page_number as number | null,
      label: row.label as string,
      text: row.content as string,
    };
  });

  rows.sort((a, b) => {
    const pa = KIND_PRIORITY[a.kind] ?? 99;
    const pb = KIND_PRIORITY[b.kind] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.documentName !== b.documentName) {
      return a.documentName.localeCompare(b.documentName);
    }
    return (a.pageNumber ?? 0) - (b.pageNumber ?? 0);
  });

  const units: SourceUnit[] = [];
  let total = 0;

  for (const [index, row] of rows.entries()) {
    const text = clampExcerpt(row.text);
    if (total + text.length > MAX_TOTAL_CHARS) break;
    total += text.length;

    units.push({
      id: `E${index + 1}`,
      documentId: row.documentId,
      documentName: row.documentName,
      label: row.label,
      pageNumber: row.pageNumber,
      text,
    });
  }

  return units;
}

/** Fiche d'identite du DCE et points de vigilance. */
async function runOverview(args: {
  admin: SupabaseClient;
  provider: ReturnType<typeof getAiProvider>;
  input: { organizationId: string; projectId: string; projectName: string };
  units: SourceUnit[];
  byId: Map<string, SourceUnit>;
}): Promise<number> {
  const { admin, provider, input, units, byId } = args;

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "dce_overview",
    provider: provider.id,
    model: provider.model,
    meta: { excerpts: units.length },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: OVERVIEW_SYSTEM,
      prompt: overviewPrompt({
        projectName: input.projectName,
        excerpts: units,
      }),
      schema: DceOverviewSchema,
      schemaName: "DceOverview",
      maxOutputTokens: 8000,
    });

    const criteria = value.awardCriteria.map((c) => ({
      label: c.label,
      weight: c.weight,
      detail: c.detail,
      sources: resolveSources(c.sourceIds, byId),
    }));

    const vigilance = value.vigilancePoints.map((p) => ({
      title: p.title,
      detail: p.detail,
      severity: p.severity,
      sources: resolveSources(p.sourceIds, byId),
    }));

    await admin.from("dce_analyses").upsert(
      {
        organization_id: input.organizationId,
        project_id: input.projectId,
        subject: value.subject.value,
        buyer: value.buyer.value,
        lot: value.lot.value,
        amount: value.amount.value,
        duration: value.duration.value,
        submission_date: value.submissionDate.value,
        variants: value.variants.value,
        site_visit: value.siteVisit.value,
        award_criteria: criteria,
        vigilance_points: vigilance,
        provider: provider.id,
        model: provider.model,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    );

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        criteria: criteria.length,
        vigilance: vigilance.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return vigilance.length;
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}

/** Extraction des exigences, en plusieurs passes si le dossier est volumineux. */
async function runRequirements(args: {
  admin: SupabaseClient;
  provider: ReturnType<typeof getAiProvider>;
  input: { organizationId: string; projectId: string; projectName: string };
  units: SourceUnit[];
  byId: Map<string, SourceUnit>;
}): Promise<number> {
  const { admin, provider, input, units, byId } = args;

  // Les exigences saisies a la main par l'utilisateur sont preservees :
  // seules celles issues d'une analyse precedente sont remplacees.
  await admin
    .from("requirements")
    .delete()
    .eq("project_id", input.projectId)
    .eq("is_manual", false);

  const batches = batchUnits(units, BATCH_CHARS);
  const collected: ExtractedRequirement[] = [];

  for (const [index, batch] of batches.entries()) {
    const run = await startRun(admin, {
      organizationId: input.organizationId,
      projectId: input.projectId,
      operation: "extract_requirements",
      provider: provider.id,
      model: provider.model,
      meta: { batch: index + 1, batches: batches.length, excerpts: batch.length },
    });

    try {
      const { value, usage } = await provider.generateObject({
        system: REQUIREMENTS_SYSTEM,
        prompt: requirementsPrompt({
          projectName: input.projectName,
          excerpts: batch,
        }),
        schema: RequirementsSchema,
        schemaName: "Requirements",
        maxOutputTokens: 16000,
      });

      collected.push(...value.requirements);

      await finishRun(admin, run, {
        status: "SUCCEEDED",
        meta: {
          found: value.requirements.length,
          outputTokens: usage.outputTokens ?? 0,
        },
      });
    } catch (error) {
      await finishRun(admin, run, {
        status: "FAILED",
        reason: error instanceof Error ? error.message : "echec",
      });
      // Une passe en echec ne doit pas annuler les exigences deja trouvees.
      if (batches.length === 1) throw error;
    }
  }

  if (collected.length === 0) return 0;

  const { data: inserted } = await admin
    .from("requirements")
    .insert(
      collected.map((r, position) => ({
        organization_id: input.organizationId,
        project_id: input.projectId,
        text: r.text,
        category: r.category,
        priority: r.priority,
        status: "TO_HANDLE",
        expected_answer: r.expectedAnswer,
        is_manual: false,
        position,
      })),
    )
    .select("id");

  if (!inserted) return 0;

  // Rattachement des sources : le modele a cite des identifiants d'extraits,
  // que l'on retraduit ici en document et page reels.
  const sources = inserted.flatMap((row, index) => {
    const requirement = collected[index];
    if (!requirement) return [];

    return resolveSources(requirement.sourceIds, byId).map((s) => ({
      organization_id: input.organizationId,
      requirement_id: row.id as string,
      document_id: s.documentId,
      page_number: s.pageNumber,
      label: s.label,
      quote: requirement.quote,
    }));
  });

  if (sources.length > 0) {
    await admin.from("requirement_sources").insert(sources);
  }

  return inserted.length;
}

/**
 * Convertit les identifiants cites par le modele en references verifiables.
 * Un identifiant inconnu est ignore : il ne peut donc pas produire une source
 * inventee.
 */
function resolveSources(
  ids: string[],
  byId: Map<string, SourceUnit>,
): Array<{
  documentId: string;
  documentName: string;
  pageNumber: number | null;
  label: string;
}> {
  const seen = new Set<string>();
  const out = [];

  for (const id of ids) {
    const unit = byId.get(id);
    if (!unit || seen.has(unit.id)) continue;
    seen.add(unit.id);
    out.push({
      documentId: unit.documentId,
      documentName: unit.documentName,
      pageNumber: unit.pageNumber,
      label: unit.label,
    });
  }

  return out;
}

/** Regroupe les extraits en passes tenant dans le budget de contexte. */
function batchUnits(units: SourceUnit[], budget: number): SourceUnit[][] {
  const batches: SourceUnit[][] = [];
  let current: SourceUnit[] = [];
  let size = 0;

  for (const unit of units) {
    if (current.length > 0 && size + unit.text.length > budget) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(unit);
    size += unit.text.length;
  }

  if (current.length > 0) batches.push(current);
  return batches;
}
