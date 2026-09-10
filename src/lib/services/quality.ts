import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  QUALITY_SYSTEM,
  QualityReviewSchema,
  qualityPrompt,
} from "@/lib/ai/prompts/quality";
import { buildProjectContext } from "./project-context";

export type Subscore = {
  key: string;
  label: string;
  score: number;
  /** Vrai si la note est calculee, faux si elle releve d'une appreciation. */
  computed: boolean;
  detail: string;
};

export type QualityOutcome = {
  score: number;
  issues: number;
  blocking: number;
};

/**
 * Poids des sous-scores dans la note globale.
 *
 * La couverture des exigences pese le plus : une exigence non traitee coute
 * directement des points a la commission.
 */
const SUBSCORE_WEIGHTS: Record<string, number> = {
  coverage: 30,
  criteriaAlignment: 20,
  personalisation: 18,
  precision: 17,
  traceability: 15,
};

export async function runQualityCheck(input: {
  organizationId: string;
  projectId: string;
}): Promise<QualityOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const context = await buildProjectContext(admin, input);

  const { data: sections } = await admin
    .from("memory_sections")
    .select(
      "id, position, number, title, content, status, requirement_ids, memory_sources (id)",
    )
    .eq("project_id", input.projectId)
    .order("position", { ascending: true });

  const written = (sections ?? []).filter(
    (s) => ((s.content as string) ?? "").trim().length > 0,
  );

  if (written.length === 0) {
    throw new AiError(
      "Aucun chapitre redige.",
      "conflict",
      "Aucun chapitre n'est redige. Le controle qualite porte sur le texte du memoire.",
    );
  }

  // --- Indicateurs calcules ---------------------------------------------------
  // Ces deux notes ne demandent aucune appreciation : elles se deduisent des
  // donnees enregistrees, et sont donc reproductibles a l'identique.
  const { data: requirements } = await admin
    .from("requirements")
    .select("id, status, priority")
    .eq("project_id", input.projectId);

  const allRequirements = requirements ?? [];
  const coveredIds = new Set<string>();
  for (const section of sections ?? []) {
    if (((section.content as string) ?? "").trim().length === 0) continue;
    for (const id of (section.requirement_ids ?? []) as string[]) {
      coveredIds.add(id);
    }
  }
  for (const r of allRequirements) {
    if (r.status === "COVERED") coveredIds.add(r.id as string);
  }

  const coverage =
    allRequirements.length === 0
      ? 100
      : Math.round((coveredIds.size / allRequirements.length) * 100);

  const withSources = written.filter(
    (s) => ((s.memory_sources ?? []) as unknown[]).length > 0,
  ).length;
  const traceability = Math.round((withSources / written.length) * 100);

  // --- Relecture par le moteur -------------------------------------------------
  const sectionRefById = new Map<string, string>();
  const memoryText = written
    .map((section, index) => {
      const ref = `S${index + 1}`;
      sectionRefById.set(ref, section.id as string);
      return `[${ref}] ${section.number ?? ""} ${section.title}\n${section.content}`;
    })
    .join("\n\n---\n\n");

  const { data: analysis } = await admin
    .from("dce_analyses")
    .select("award_criteria")
    .eq("project_id", input.projectId)
    .maybeSingle();

  const criteria = (
    (analysis?.award_criteria ?? []) as Array<{
      label: string;
      weight: string;
    }>
  )
    .map((c) => `- ${c.label} : ${c.weight}`)
    .join("\n");

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "quality_check",
    provider: provider.id,
    model: provider.model,
    meta: { sections: written.length, coverage, traceability },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: QUALITY_SYSTEM,
      prompt: qualityPrompt({
        projectName: context.projectName,
        criteria: criteria || "Aucun critere de jugement identifie.",
        requirements:
          context.requirementLines.join("\n") || "Aucune exigence relevee.",
        companyBase: context.companyBase,
        memory: memoryText,
      }),
      schema: QualityReviewSchema,
      schemaName: "QualityReview",
      maxOutputTokens: 12000,
    });

    const subscores: Subscore[] = [
      {
        key: "coverage",
        label: "Couverture des exigences",
        score: coverage,
        computed: true,
        detail: `${coveredIds.size} exigence(s) traitees sur ${allRequirements.length}.`,
      },
      {
        key: "criteriaAlignment",
        label: "Alignement aux criteres",
        score: value.judgement.criteriaAlignment,
        computed: false,
        detail: "Appreciation du moteur d'analyse.",
      },
      {
        key: "personalisation",
        label: "Personnalisation",
        score: value.judgement.personalisation,
        computed: false,
        detail: "Appreciation du moteur d'analyse.",
      },
      {
        key: "precision",
        label: "Precision",
        score: value.judgement.precision,
        computed: false,
        detail: "Appreciation du moteur d'analyse.",
      },
      {
        key: "traceability",
        label: "Tracabilite",
        score: traceability,
        computed: true,
        detail: `${withSources} chapitre(s) sur ${written.length} citent au moins une source.`,
      },
    ];

    const score = Math.round(
      subscores.reduce(
        (sum, s) => sum + s.score * (SUBSCORE_WEIGHTS[s.key] ?? 0),
        0,
      ) / 100,
    );

    // --- Enregistrement ---------------------------------------------------------
    const { data: saved } = await admin
      .from("quality_checks")
      .upsert(
        {
          organization_id: input.organizationId,
          project_id: input.projectId,
          score,
          subscores,
          summary: value.summary,
          provider: provider.id,
          model: provider.model,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" },
      )
      .select("id")
      .single();

    let issueCount = 0;
    let blocking = 0;

    if (saved) {
      await admin
        .from("quality_issues")
        .delete()
        .eq("check_id", saved.id as string);

      // Les exigences non couvertes sont constatees, pas appreciees : elles
      // sont ajoutees directement par l'application.
      const uncovered = allRequirements.filter(
        (r) => !coveredIds.has(r.id as string),
      );

      const rows = [
        ...uncovered.map((r, index) => ({
          organization_id: input.organizationId,
          check_id: saved.id as string,
          kind: "REQUIREMENT_UNCOVERED" as const,
          severity: (r.priority === "HIGH" ? "BLOCKING" : "IMPORTANT") as
            | "BLOCKING"
            | "IMPORTANT",
          title: "Exigence non traitee",
          detail:
            "Aucun chapitre redige ne traite cette exigence, et elle n'a pas ete marquee comme couverte.",
          requirement_id: r.id as string,
          position: index,
        })),
        ...value.issues.map((issue, index) => ({
          organization_id: input.organizationId,
          check_id: saved.id as string,
          kind: issue.kind,
          severity: issue.severity,
          title: issue.title,
          detail: issue.detail,
          section_id: issue.sectionRef
            ? (sectionRefById.get(issue.sectionRef) ?? null)
            : null,
          position: uncovered.length + index,
        })),
      ];

      if (rows.length > 0) await admin.from("quality_issues").insert(rows);

      issueCount = rows.length;
      blocking = rows.filter((r) => r.severity === "BLOCKING").length;
    }

    await admin
      .from("projects")
      .update({ status: "REVIEW" })
      .eq("id", input.projectId);

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        score,
        issues: issueCount,
        blocking,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return { score, issues: issueCount, blocking };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
