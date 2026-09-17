import "server-only";
import { stripCitationCodes } from "@/lib/citations";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import { matchRequirements } from "@/lib/engine/requirement-match";
import { cosine } from "@/lib/engine/semantic";
import { embedTexts } from "./embeddings";
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
import { syncProjectMetadataFromOverview } from "@/lib/services/project-metadata-sync";
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
  const engine = await isEngineSchemaReady();

  const { data: before } = await admin
    .from("projects")
    .select("status, name, reference, buyer, lot, deadline")
    .eq("id", input.projectId)
    .single();
  const previousStatus = (before?.status as string | undefined) ?? "DRAFT";
  const projectRow = before as {
    name: string;
    reference: string | null;
    buyer: string | null;
    lot: string | null;
    deadline: string | null;
  } | null;

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
      engine,
      project: projectRow,
    });

    const requirementCount = await runRequirements({
      admin,
      provider,
      input,
      units,
      byId,
      criteria: overview.criteriaLabels,
      engine,
    });

    await admin
      .from("projects")
      .update({ status: "ANALYZED" })
      .eq("id", input.projectId);

    return {
      requirements: requirementCount,
      vigilancePoints: overview.vigilance,
      documentsUsed: new Set(units.map((u) => u.documentId)).size,
      pagesUsed: units.length,
    };
  } catch (error) {
    // Le dossier ne doit pas rester bloque sur "analyse en cours" : il
    // retrouve le statut qu'il avait avant la tentative.
    await admin
      .from("projects")
      .update({
        status: previousStatus === "ANALYZING" ? "DRAFT" : previousStatus,
      })
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
  engine: boolean;
  project: {
    name: string;
    reference: string | null;
    buyer: string | null;
    lot: string | null;
    deadline: string | null;
  } | null;
}): Promise<{ vigilance: number; criteriaLabels: string[] }> {
  const { admin, provider, input, units, byId, engine, project } = args;

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

    // Criteres et sous-criteres restent dans award_criteria (JSON) : aucune
    // migration n'est necessaire pour les conserver.
    const criteria = value.awardCriteria.map((c) => ({
      label: c.label,
      weight: c.weight,
      weightValue: c.weightValue,
      expectedElements: c.expectedElements,
      subcriteria: c.subcriteria.map((sub) => ({
        label: sub.label,
        weight: sub.weight,
        weightValue: sub.weightValue,
        detail: stripCitationCodes(sub.detail),
        sources: resolveSources(sub.sourceIds, byId),
      })),
      detail: stripCitationCodes(c.detail),
      sources: resolveSources(c.sourceIds, byId),
    }));

    const criteriaLabels = criteria.flatMap((c) => [
      c.label,
      ...c.subcriteria.map((sub) => `${c.label} > ${sub.label}`),
    ]);

    const vigilance = value.vigilancePoints.map((p) => ({
      title: p.title,
      detail: stripCitationCodes(p.detail),
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
        ...(engine
          ? {
              response_format: {
                imposedFramework: value.responseFormat.imposedFramework,
                structure: value.responseFormat.structure,
                pageLimit: value.responseFormat.pageLimit,
                constraints: value.responseFormat.constraints,
                sources: resolveSources(value.responseFormat.sourceIds, byId),
              },
              market_context: {
                constraints: value.marketConstraints.map((m) => ({
                  type: m.type,
                  label: m.label,
                  detail: stripCitationCodes(m.detail),
                  sources: resolveSources(m.sourceIds, byId),
                })),
              },
            }
          : {}),
        provider: provider.id,
        model: provider.model,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    );

    if (project) {
      await syncProjectMetadataFromOverview(admin, {
        projectId: input.projectId,
        project,
        overview: value,
      });
    }

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        criteria: criteria.length,
        vigilance: vigilance.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return { vigilance: vigilance.length, criteriaLabels };
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
  criteria: string[];
  engine: boolean;
}): Promise<number> {
  const { admin, provider, input, units, byId, criteria, engine } = args;

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
          criteria,
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

  // Aucune exigence trouvee : les exigences existantes ne sont pas touchees.
  if (collected.length === 0) return 0;

  // Une meme exigence peut ressortir de deux passes : on la garde une fois,
  // avec l'ensemble de ses sources.
  const unique = dedupeRequirements(collected);

  // --- Rapprochement avec l'analyse precedente ---------------------------------
  // Une exigence retrouvee garde son identifiant, donc son statut, la reponse
  // saisie, sa couverture et ses rattachements aux chapitres. Les exigences
  // saisies a la main ne sont jamais concernees.
  const { data: previousRows } = await admin
    .from("requirements")
    .select("id, text, category, requirement_sources (document_id, page_number)")
    .eq("project_id", input.projectId)
    .eq("is_manual", false);
  const previous = (previousRows ?? []) as unknown as Array<{
    id: string;
    text: string;
    category: string;
    requirement_sources: Array<{ document_id: string | null; page_number: number | null }>;
  }>;

  // Le passage cite (document et page) sert de reperage : une exigence
  // reformulee cite le plus souvent le meme endroit du dossier.
  const anchorsOf = (sources: Array<{ documentId: string | null; pageNumber: number | null }>) =>
    sources.map((s) => `${s.documentId ?? ""}|${s.pageNumber ?? ""}`);

  // Proximite de sens : deux formulations tres differentes peuvent designer la
  // meme exigence. Sans vecteurs disponibles, seul le vocabulaire compte.
  const previousTexts = previous.map((r) => r.text);
  const nextTexts = unique.map((r) => stripCitationCodes(r.text));
  const [previousVectors, nextVectors] = await Promise.all([
    embedTexts(admin, input.organizationId, previousTexts, "RETRIEVAL_DOCUMENT"),
    embedTexts(admin, input.organizationId, nextTexts, "RETRIEVAL_DOCUMENT"),
  ]);
  const meaningOf =
    previousVectors && nextVectors
      ? (prevIndex: number, nextIndex: number) =>
          cosine(previousVectors[prevIndex], nextVectors[nextIndex])
      : undefined;

  const matches = matchRequirements(
    previous.map((r) => ({
      text: r.text,
      category: r.category,
      anchors: anchorsOf(
        (r.requirement_sources ?? []).map((s) => ({
          documentId: s.document_id,
          pageNumber: s.page_number,
        })),
      ),
    })),
    unique.map((r) => ({
      text: stripCitationCodes(r.text),
      category: r.category,
      anchors: anchorsOf(resolveSources(r.sourceIds, byId)),
    })),
    { semantic: meaningOf },
  );

  const fields = (r: ExtractedRequirement, position: number) => ({
    text: stripCitationCodes(r.text),
    category: r.category,
    priority: r.priority,
    expected_answer: stripCitationCodes(r.expectedAnswer ?? null),
    position,
    ...(engine
      ? {
          mandatory: r.mandatory,
          criterion_ref: r.criterionLabel,
          buyer_intent: stripCitationCodes(r.buyerIntent || null),
        }
      : {}),
  });

  const idByIndex = new Map<number, string>();

  // Exigences retrouvees : mise a jour sur place.
  await Promise.all(
    unique.map(async (r, index) => {
      const prevIndex = matches.get(index);
      if (prevIndex === undefined) return;
      const id = previous[prevIndex].id;
      const { error } = await admin
        .from("requirements")
        .update(fields(r, index))
        .eq("id", id)
        .eq("project_id", input.projectId);
      if (!error) idByIndex.set(index, id);
    }),
  );

  // Nouvelles exigences.
  const fresh = unique
    .map((r, index) => ({ r, index }))
    .filter(({ index }) => !matches.has(index));
  if (fresh.length > 0) {
    const { data: inserted } = await admin
      .from("requirements")
      .insert(
        fresh.map(({ r, index }) => ({
          organization_id: input.organizationId,
          project_id: input.projectId,
          status: "TO_HANDLE",
          is_manual: false,
          ...fields(r, index),
        })),
      )
      .select("id");
    (inserted ?? []).forEach((row, i) => idByIndex.set(fresh[i].index, row.id as string));
  }

  // Exigences disparues du dossier : retirees des chapitres, puis supprimees.
  const keptIds = new Set(idByIndex.values());
  const removedIds = previous.map((p) => p.id).filter((id) => !keptIds.has(id));
  if (removedIds.length > 0) {
    await detachRequirements(admin, input.projectId, removedIds);
    await admin.from("requirements").delete().in("id", removedIds).eq("project_id", input.projectId);
  }

  // Sources : remplacees pour les exigences retrouvees, creees pour les autres.
  // Le modele a cite des identifiants d'extraits, retraduits en document et page.
  const touchedIds = [...idByIndex.values()];
  if (touchedIds.length > 0) {
    await admin.from("requirement_sources").delete().in("requirement_id", touchedIds);
  }
  const sources = [...idByIndex.entries()].flatMap(([index, requirementId]) => {
    const requirement = unique[index];
    return resolveSources(requirement.sourceIds, byId).map((s) => ({
      organization_id: input.organizationId,
      requirement_id: requirementId,
      document_id: s.documentId,
      page_number: s.pageNumber,
      label: s.label,
      quote: requirement.quote,
    }));
  });

  if (sources.length > 0) {
    await admin.from("requirement_sources").insert(sources);
  }

  return idByIndex.size;
}

/** Retire des exigences supprimees des chapitres qui les referencaient. */
async function detachRequirements(admin: SupabaseClient, projectId: string, ids: string[]) {
  const removed = new Set(ids);
  const { data: sections } = await admin
    .from("memory_sections")
    .select("id, requirement_ids")
    .eq("project_id", projectId);

  await Promise.all(
    (sections ?? []).map((section) => {
      const current = (section.requirement_ids ?? []) as string[];
      const kept = current.filter((id) => !removed.has(id));
      if (kept.length === current.length) return null;
      return admin.from("memory_sections").update({ requirement_ids: kept }).eq("id", section.id as string);
    }),
  );
}

/** Cle de comparaison : sans accents, ponctuation ni casse. */
function requirementKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 140);
}

function dedupeRequirements(list: ExtractedRequirement[]): ExtractedRequirement[] {
  const byKey = new Map<string, ExtractedRequirement>();
  for (const requirement of list) {
    const key = requirementKey(requirement.text);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...requirement, sourceIds: [...requirement.sourceIds] });
      continue;
    }
    existing.sourceIds = [...new Set([...existing.sourceIds, ...requirement.sourceIds])];
    existing.mandatory = existing.mandatory || requirement.mandatory;
    if (requirement.priority === "HIGH") existing.priority = "HIGH";
    existing.criterionLabel = existing.criterionLabel ?? requirement.criterionLabel;
  }
  return [...byKey.values()];
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
