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
import { advanceProjectStatus } from "./project-status";
import { stripCitationCodes } from "@/lib/citations";
import { isPipelineSchemaReady } from "@/lib/engine/pipeline-schema";
import {
  applyRules,
  checkPrepDays,
  parseRules,
  ruleLabel,
  type RuleCheck,
} from "@/lib/qualification";

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
    throw new AiError("Le dossier doit d'abord être analysé.", "invalid_output");
  }

  // Criteres de qualification de l'entreprise (migration 0011).
  const schemaReady = await isPipelineSchemaReady();
  let rules: ReturnType<typeof parseRules> = [];
  if (schemaReady) {
    const { data: org } = await admin
      .from("organizations")
      .select("qualification_rules")
      .eq("id", input.organizationId)
      .maybeSingle();
    rules = parseRules(org?.qualification_rules);
  }
  // Le modele ne voit que les criteres a interpreter, sous un identifiant court.
  const textRules = rules.filter((r) => r.kind === "text");
  const refById = new Map(textRules.map((r, i) => [`Q${i + 1}`, r]));
  const rulesPrompt = [...refById]
    .map(([ref, r]) => `${ref}${r.blocking ? " (eliminatoire)" : ""} : ${r.text}`)
    .join("\n");

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
          "Aucune exigence n'a été relevée.",
        companyBase: context.companyBase,
        rules: rulesPrompt,
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

    // --- Criteres de qualification ------------------------------------------
    const verdicts = new Map((value.rules ?? []).map((r) => [r.id.trim(), r]));
    const ruleChecks: RuleCheck[] = rules.map((rule) => {
      if (rule.kind === "min_prep_days") {
        return checkPrepDays(rule, context.deadline);
      }
      const ref = [...refById].find(([, r]) => r.id === rule.id)?.[0];
      const verdict = ref ? verdicts.get(ref) : undefined;
      return {
        ruleId: rule.id,
        text: ruleLabel(rule),
        blocking: rule.blocking,
        status: verdict?.status ?? "UNKNOWN",
        justification:
          stripCitationCodes(verdict?.justification ?? null) ??
          "Ce critère n'a pas pu être vérifié à partir des pièces disponibles.",
        sources: resolveSources(verdict?.sourceIds ?? [], context.sourcesById),
        automatic: false,
      };
    });
    const ruled = applyRules(recommendation, ruleChecks);
    // Le resume du modele porte sur l'opportunite ; c'est l'application qui
    // applique les criteres. Quand ils changent la recommandation, la synthese
    // le dit d'emblee, sans quoi elle conclurait a l'inverse du verdict affiche.
    const rulePreamble =
      ruled.recommendation !== recommendation
        ? `Recommandation ramenée à ${
            ruled.recommendation === "NO_GO" ? "NO-GO" : "« sous réserve »"
          } par ${
            ruled.decisive.length > 1 ? "vos critères de qualification" : "votre critère de qualification"
          } : ${ruled.decisive.map((c) => `« ${c.text} »`).join(", ")}. `
        : "";
    recommendation = ruled.recommendation;

    // --- Enregistrement -------------------------------------------------------
    const { data: saved } = await admin
      .from("go_no_go_analyses")
      .upsert(
        {
          organization_id: input.organizationId,
          project_id: input.projectId,
          score,
          recommendation,
          summary: rulePreamble + (stripCitationCodes(value.summary) ?? ""),
          ...(schemaReady ? { rule_checks: ruleChecks } : {}),
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
              stripCitationCodes(produced?.justification ?? null) ??
              "Ce facteur n'a pas pu être évalué à partir des éléments disponibles.",
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
    await advanceProjectStatus(
      admin,
      input.projectId,
      recommendation === "NO_GO" ? "NO_GO" : "GO",
    );

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        score,
        recommendation,
        rules: ruleChecks.length,
        outputTokens: usage.outputTokens ?? 0,
      },
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
