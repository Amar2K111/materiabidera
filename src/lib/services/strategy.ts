import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  STRATEGY_SYSTEM,
  StrategySchema,
  strategyPrompt,
} from "@/lib/ai/prompts/strategy";
import { buildProjectContext, resolveSources } from "./project-context";

export type StrategyOutcome = {
  priorities: number;
  recommendations: number;
  matches: number;
};

export async function runStrategy(input: {
  organizationId: string;
  projectId: string;
}): Promise<StrategyOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const context = await buildProjectContext(admin, input);
  if (!context.hasAnalysis) {
    throw new AiError("Le dossier doit d'abord etre analyse.", "invalid_output");
  }

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "strategy",
    provider: provider.id,
    model: provider.model,
    meta: {
      requirements: context.requirementLines.length,
      companyItems: context.snapshot.items.length,
    },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: STRATEGY_SYSTEM,
      prompt: strategyPrompt({
        projectName: context.projectName,
        dceSummary: context.dceSummary,
        requirements:
          context.requirementLines.join("\n") ||
          "Aucune exigence n'a ete relevee.",
        companyBase: context.companyBase,
      }),
      schema: StrategySchema,
      schemaName: "Strategy",
      maxOutputTokens: 8000,
    });

    // Le rang est donne par l'ordre de la liste : c'est le classement etabli
    // par le modele, rendu explicite plutot que laisse implicite.
    const priorities = value.priorities.map((p, index) => ({
      rank: index + 1,
      title: p.title,
      rationale: p.rationale,
      sources: resolveSources(p.sourceIds, context.sourcesById),
    }));

    const recommendations = value.recommendations.map((r) => ({
      title: r.title,
      detail: r.detail,
      sources: resolveSources(r.sourceIds, context.sourcesById),
    }));

    // Un rapprochement qui ne pointe pas vers une fiche existante est ecarte :
    // il ne doit jamais apparaitre comme un element reel de la base.
    const byId = new Map(context.snapshot.items.map((i) => [i.id, i]));
    const matches = value.companyMatches.flatMap((m) => {
      const item = byId.get(m.sourceId);
      if (!item) return [];
      return [
        {
          table: item.table,
          recordId: item.recordId,
          label: item.label,
          why: m.why,
        },
      ];
    });

    await admin.from("tender_strategies").upsert(
      {
        organization_id: input.organizationId,
        project_id: input.projectId,
        priorities,
        recommendations,
        company_matches: matches,
        provider: provider.id,
        model: provider.model,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    );

    // Le dossier avance d'une etape, sauf s'il a ete ecarte.
    const { data: project } = await admin
      .from("projects")
      .select("status")
      .eq("id", input.projectId)
      .single();

    if (project?.status !== "NO_GO") {
      await admin
        .from("projects")
        .update({ status: "STRATEGY_READY" })
        .eq("id", input.projectId);
    }

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        priorities: priorities.length,
        recommendations: recommendations.length,
        matches: matches.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return {
      priorities: priorities.length,
      recommendations: recommendations.length,
      matches: matches.length,
    };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
