import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  GO_FACTORS,
  GO_NO_GO_SYSTEM,
  GoNoGoSchema,
  goNoGoPrompt,
} from "@/lib/ai/prompts/go-no-go";
import {
  FACTOR_WEIGHTS,
  GO_THRESHOLD,
  VIGILANCE_THRESHOLD,
} from "@/lib/decision";
import { formatDate } from "@/lib/projects";
import { buildProjectContext, resolveSources } from "./project-context";

export type GoNoGoOutcome = {
  score: number;
  recommendation: "GO" | "VIGILANCE" | "NO_GO";
  factors: number;
};

export async function runGoNoGo(input: {
  organizationId: string;
  projectId: string;
}): Promise<GoNoGoOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const context = await buildProjectContext(admin, input);
  if (!context.hasAnalysis) {
    throw new AiError("Le dossier doit d'abord etre analyse.", "invalid_output");
  }

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "go_no_go",
    provider: provider.id,
    model: provider.model,
    meta: {
      requirements: context.requirementLines.length,
      companyItems: context.snapshot.items.length,
    },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: GO_NO_GO_SYSTEM,
      prompt: goNoGoPrompt({
        projectName: context.projectName,
        deadline: formatDate(context.deadline),
        dceSummary: context.dceSummary,
        requirements:
          context.requirementLines.join("\n") ||
          "Aucune exigence n'a ete relevee.",
        companyBase: context.companyBase,
      }),
      schema: GoNoGoSchema,
      schemaName: "GoNoGo",
      maxOutputTokens: 8000,
    });

    // --- Score global, calcule par l'application ------------------------------
    // Le modele note chaque facteur ; la ponderation et les seuils relevent de
    // l'application, ce qui rend la note reproductible et discutable.
    const byKey = new Map(value.factors.map((f) => [f.key, f]));
    let weighted = 0;
    let totalWeight = 0;

    for (const factor of GO_FACTORS) {
      const produced = byKey.get(factor.key);
      // Un facteur non note ne compte pas : il ne doit ni gonfler ni
      // penaliser artificiellement la note.
      if (!produced) continue;
      const weight = FACTOR_WEIGHTS[factor.key] ?? 0;
      weighted += produced.score * weight;
      totalWeight += weight;
    }

    const score = totalWeight === 0 ? 0 : Math.round(weighted / totalWeight);

    let recommendation: GoNoGoOutcome["recommendation"] =
      score >= GO_THRESHOLD
        ? "GO"
        : score >= VIGILANCE_THRESHOLD
          ? "VIGILANCE"
          : "NO_GO";

    // Regle metier : une exigence administrative bloquante non couverte,
    // constatee avec certitude, interdit un GO franc.
    const administrative = byKey.get("administrative");
    if (
      recommendation === "GO" &&
      administrative &&
      administrative.confidence === "HIGH" &&
      administrative.score < 35
    ) {
      recommendation = "VIGILANCE";
    }

    // --- Enregistrement -------------------------------------------------------
    const { data: saved } = await admin
      .from("go_no_go_analyses")
      .upsert(
        {
          organization_id: input.organizationId,
          project_id: input.projectId,
          score,
          recommendation,
          summary: value.summary,
          provider: provider.id,
          model: provider.model,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select("id")
      .single();

    if (saved) {
      await admin
        .from("go_no_go_factors")
        .delete()
        .eq("analysis_id", saved.id as string);

      await admin.from("go_no_go_factors").insert(
        GO_FACTORS.map((factor, position) => {
          const produced = byKey.get(factor.key);
          return {
            organization_id: input.organizationId,
            analysis_id: saved.id as string,
            key: factor.key,
            label: factor.label,
            score: produced?.score ?? 0,
            justification:
              produced?.justification ??
              "Ce facteur n'a pas pu etre evalue a partir des elements disponibles.",
            confidence: produced?.confidence ?? "LOW",
            sources: resolveSources(
              produced?.sourceIds ?? [],
              context.sourcesById,
            ),
            position,
          };
        }),
      );
    }

    // Le statut suit la recommandation. L'utilisateur peut ensuite trancher
    // autrement depuis l'interface : son choix prime.
    await admin
      .from("projects")
      .update({ status: recommendation === "NO_GO" ? "NO_GO" : "GO" })
      .eq("id", input.projectId);

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: { score, recommendation, outputTokens: usage.outputTokens ?? 0 },
    });

    return { score, recommendation, factors: GO_FACTORS.length };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
