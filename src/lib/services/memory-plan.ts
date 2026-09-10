import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  MEMORY_PLAN_SYSTEM,
  MemoryPlanSchema,
  memoryPlanPrompt,
} from "@/lib/ai/prompts/memory-plan";
import { buildProjectContext } from "./project-context";

export type PlanOutcome = { sections: number; replaced: boolean };

/** Volume de cadre de memoire transmis au modele. */
const FRAMEWORK_CHARS = 40_000;

export async function runMemoryPlan(input: {
  organizationId: string;
  projectId: string;
}): Promise<PlanOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const context = await buildProjectContext(admin, input);
  if (!context.hasAnalysis) {
    throw new AiError(
      "Analyse absente.",
      "conflict",
      "Le dossier doit d'abord etre analyse.",
    );
  }

  // Verifie AVANT d'appeler le modele : un plan deja redige ne doit pas etre
  // efface, et il serait absurde de payer une generation pour la jeter.
  const { data: existing } = await admin
    .from("memory_sections")
    .select("id, status")
    .eq("project_id", input.projectId);

  const written = (existing ?? []).filter((s) => s.status !== "EMPTY");
  if (written.length > 0) {
    throw new AiError(
      "Chapitres deja rediges.",
      "conflict",
      `${written.length} chapitre(s) sont deja rediges. Regenerer le plan les supprimerait. Videz-les ou modifiez le plan a la main.`,
    );
  }

  // --- Cadre de memoire impose, s'il existe -----------------------------------
  const { data: frameworkDocs } = await admin
    .from("project_documents")
    .select("id")
    .eq("project_id", input.projectId)
    .eq("kind", "CADRE_MEMOIRE");

  let memoryFramework = "Aucun cadre de memoire n'est impose par l'acheteur.";

  if (frameworkDocs && frameworkDocs.length > 0) {
    const { data: pages } = await admin
      .from("document_pages")
      .select("content")
      .in(
        "document_id",
        frameworkDocs.map((d) => d.id as string),
      )
      .order("page_number", { ascending: true, nullsFirst: true });

    const text = (pages ?? [])
      .map((p) => p.content as string)
      .join("\n\n")
      .slice(0, FRAMEWORK_CHARS);

    if (text.trim().length > 0) memoryFramework = text;
  }

  // --- Strategie retenue ------------------------------------------------------
  const { data: strategy } = await admin
    .from("tender_strategies")
    .select("priorities, recommendations")
    .eq("project_id", input.projectId)
    .maybeSingle();

  const strategyText = strategy
    ? [
        "Axes prioritaires :",
        ...((strategy.priorities ?? []) as Array<{
          rank: number;
          title: string;
          rationale: string;
        }>).map((p) => `${p.rank}. ${p.title} — ${p.rationale}`),
        "",
        "Recommandations :",
        ...((strategy.recommendations ?? []) as Array<{
          title: string;
          detail: string;
        }>).map((r) => `- ${r.title} : ${r.detail}`),
      ].join("\n")
    : "Aucune strategie n'a encore ete etablie.";

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "memory_plan",
    provider: provider.id,
    model: provider.model,
    meta: {
      requirements: context.requirementLines.length,
      hasFramework: frameworkDocs ? frameworkDocs.length > 0 : false,
    },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: MEMORY_PLAN_SYSTEM,
      prompt: memoryPlanPrompt({
        projectName: context.projectName,
        dceSummary: context.dceSummary,
        requirements:
          context.requirementLines.join("\n") ||
          "Aucune exigence n'a ete relevee.",
        strategy: strategyText,
        memoryFramework,
      }),
      schema: MemoryPlanSchema,
      schemaName: "MemoryPlan",
      maxOutputTokens: 12000,
    });

    await admin
      .from("memory_sections")
      .delete()
      .eq("project_id", input.projectId);

    await admin.from("memory_sections").insert(
      value.sections.map((section, position) => ({
        organization_id: input.organizationId,
        project_id: input.projectId,
        position,
        number: section.number,
        title: section.title,
        brief: section.brief,
        status: "EMPTY",
        // Une reference inconnue est ecartee : le plan ne peut pas pointer
        // vers une exigence qui n'existe pas.
        requirement_ids: section.requirementRefs
          .map((ref) => context.requirementIdsByRef.get(ref))
          .filter((id): id is string => Boolean(id)),
        word_target: section.wordTarget,
      })),
    );

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        sections: value.sections.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return { sections: value.sections.length, replaced: true };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
