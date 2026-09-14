import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  COVERAGE_SYSTEM,
  CoverageReviewSchema,
  coveragePrompt,
} from "@/lib/ai/prompts/quality-coverage";
import {
  CLAIMS_SYSTEM,
  ClaimsReviewSchema,
  claimsPrompt,
} from "@/lib/ai/prompts/quality-claims";
import { humanizeRefs, stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import {
  buildIssues,
  computeReadiness,
  type ClaimResult,
  type ConsistencyResult,
  type CoverageResult,
  type CriterionResult,
  type EngineIssue,
  type GenericResult,
  type IssueKind,
  type MissingInformation,
  type RequirementInput,
} from "@/lib/engine/readiness";
import type { CitedSource, ResponseFormat } from "@/lib/requirements";
import { buildProjectContext } from "./project-context";
import { findCompanyEvidence } from "./company-context";
import { advanceProjectStatus } from "./project-status";

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
  ready: boolean;
};

/**
 * Sans la migration 0008, les nouveaux types de problemes n'existent pas en
 * base : ils sont enregistres sous le type le plus proche, le titre gardant
 * leur nature exacte.
 */
const LEGACY_KIND: Record<IssueKind, string> = {
  REQUIREMENT_UNCOVERED: "REQUIREMENT_UNCOVERED",
  PARTIAL_COVERAGE: "REQUIREMENT_UNCOVERED",
  MISSING_COMPANY_INFO: "WEAK_SOURCING",
  UNVERIFIED_CLAIM: "UNVERIFIED_CLAIM",
  CONSISTENCY: "UNVERIFIED_CLAIM",
  TOO_GENERIC: "TOO_GENERIC",
  IRRELEVANT_CONTENT: "TOO_GENERIC",
  CRITERIA_MISALIGNED: "CRITERIA_MISALIGNED",
};

/**
 * Controle du memoire avant remise (sections 18 a 31).
 *
 * Deux relectures independantes, lancees en parallele :
 *   1. couverture des exigences, traitement des criteres, lisibilite, synthese ;
 *   2. affirmations, coherence entre chapitres, contenu generique.
 * L'application en deduit ensuite, par des regles fixes, les alertes
 * priorisees, les indicateurs et le verdict "pret a deposer".
 */
export async function runQualityCheck(input: {
  organizationId: string;
  projectId: string;
}): Promise<QualityOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();
  const engine = await isEngineSchemaReady();

  const context = await buildProjectContext(admin, input);

  const { data: sectionRows } = await admin
    .from("memory_sections")
    .select("id, position, number, title, content, requirement_ids, memory_sources (id)")
    .eq("project_id", input.projectId)
    .order("position", { ascending: true });

  const sections = (sectionRows ?? []).filter(
    (s) => ((s.content as string) ?? "").trim().length > 0,
  );

  if (sections.length === 0) {
    throw new AiError(
      "Aucun chapitre rédigé.",
      "conflict",
      "Aucun chapitre n'est rédigé. Le contrôle qualité porte sur le texte du mémoire.",
    );
  }

  // --- Donnees de reference -----------------------------------------------------
  const [{ data: requirementRows }, { data: analysis }] = await Promise.all([
    admin
      .from("requirements")
      .select(
        engine
          ? "id, text, category, priority, status, expected_answer, mandatory, criterion_ref, requirement_sources (document_id, page_number, label, quote, project_documents (file_name))"
          : "id, text, category, priority, status, expected_answer, requirement_sources (document_id, page_number, label, quote, project_documents (file_name))",
      )
      .eq("project_id", input.projectId)
      .order("position", { ascending: true })
      .limit(250),
    engine
      ? admin
          .from("dce_analyses")
          .select("response_format")
          .eq("project_id", input.projectId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  type RequirementRow = {
    id: string;
    text: string;
    category: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "COVERED" | "TO_HANDLE" | "MISSING";
    expected_answer: string | null;
    mandatory?: boolean | null;
    criterion_ref?: string | null;
    requirement_sources: Array<{
      document_id: string | null;
      page_number: number | null;
      label: string | null;
      quote: string | null;
      project_documents: { file_name: string } | null;
    }>;
  };
  const requirements = (requirementRows ?? []) as unknown as RequirementRow[];

  const refByRequirement = new Map<string, string>();
  const requirementByRef = new Map<string, RequirementRow>();
  requirements.forEach((r, index) => {
    const ref = `R${index + 1}`;
    refByRequirement.set(r.id, ref);
    requirementByRef.set(ref, r);
  });

  const sectionIdByRef = new Map<string, string>();
  const memoryText = sections
    .map((section, index) => {
      const ref = `S${index + 1}`;
      sectionIdByRef.set(ref, section.id as string);
      return `[${ref}] ${section.number ?? ""} ${section.title}\n${stripCitationCodes(section.content as string)}`;
    })
    .join("\n\n---\n\n");
  const toSectionIds = (refs: string[]) =>
    refs.map((ref) => sectionIdByRef.get(ref)).filter((id): id is string => Boolean(id));
  const sectionTitleByRef = new Map(
    sections.map((section, index) => [`S${index + 1}`, section.title as string]),
  );

  const requirementsText = requirements
    .map((r) => {
      const ref = refByRequirement.get(r.id);
      const flags = [r.category, `priorité ${r.priority}`, r.mandatory ? "OBLIGATOIRE" : null]
        .filter(Boolean)
        .join(", ");
      return `[${ref}] (${flags}) ${r.text}${r.expected_answer ? `\n  attendu : ${r.expected_answer}` : ""}${r.criterion_ref ? `\n  critère : ${r.criterion_ref}` : ""}`;
    })
    .join("\n");

  const criteriaText =
    context.criteria
      .flatMap((c) => [
        `- ${c.label} (${c.weight})${c.detail ? ` : ${c.detail}` : ""}`,
        ...(c.subcriteria ?? []).map((sub) => `  - ${c.label} > ${sub.label} (${sub.weight})`),
      ])
      .join("\n") || "Aucun critère de notation identifié.";

  const format = (analysis as { response_format?: ResponseFormat | null } | null)?.response_format;
  const formatText = format
    ? [
        `Cadre imposé : ${format.imposedFramework ? "oui" : "non"}`,
        format.structure.length ? `Structure : ${format.structure.join(" ; ")}` : null,
        `Limite de pages : ${format.pageLimit ?? "non précisée"}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "Non analysé.";

  // Toute la base structuree, et les passages de bibliotheque proches du texte :
  // c'est l'ensemble des preuves admissibles pour verifier les affirmations.
  const companyBase = context.snapshot.isEmpty
    ? "La base entreprise est vide : aucune affirmation sur l'entreprise ne peut être prouvée."
    : (
        await findCompanyEvidence(
          admin,
          input.organizationId,
          context.snapshot,
          // Une requete par chapitre : chaque affirmation doit pouvoir etre
          // confrontee aux preuves proches de son propre chapitre.
          sections.map((s) => `${s.title}\n${stripCitationCodes(s.content as string)}`),
          { itemLimit: 240, documentLimit: 20 },
        )
      ).text;

  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: "quality_check",
    provider: provider.id,
    model: provider.model,
    meta: { sections: sections.length, requirements: requirements.length },
  });

  try {
    const [coverageReview, claimsReview] = await Promise.all([
      provider.generateObject({
        system: COVERAGE_SYSTEM,
        prompt: coveragePrompt({
          projectName: context.projectName,
          criteria: criteriaText,
          responseFormat: formatText,
          requirements: requirementsText || "Aucune exigence relevée.",
          memory: memoryText,
        }),
        schema: CoverageReviewSchema,
        schemaName: "CoverageReview",
        maxOutputTokens: 32000,
      }),
      provider.generateObject({
        system: CLAIMS_SYSTEM,
        prompt: claimsPrompt({
          projectName: context.projectName,
          marketFacts: context.dceSummary,
          requirements: requirementsText || "Aucune exigence relevée.",
          companyBase,
          memory: memoryText,
        }),
        schema: ClaimsReviewSchema,
        schemaName: "ClaimsReview",
        maxOutputTokens: 32000,
      }),
    ]);

    // --- Traduction des references en donnees reelles ----------------------------
    // Le relecteur ecrit parfois "section S2" ou "l'exigence R4" en toutes
    // lettres : ces references internes deviennent des intitules lisibles.
    const clean = (text: string) =>
      humanizeRefs(stripCitationCodes(text), {
        section: (ref) => sectionTitleByRef.get(ref),
        requirement: (ref) => requirementByRef.get(ref)?.text,
      });

    const coverageByRef = new Map(coverageReview.value.requirements.map((r) => [r.ref, r]));

    const requirementInputs: RequirementInput[] = requirements.map((r) => ({
      id: r.id,
      text: r.text,
      category: r.category,
      priority: r.priority,
      mandatory: Boolean(r.mandatory),
      userStatus: r.status,
    }));

    const coverage: CoverageResult[] = requirements.map((r) => {
      const result = coverageByRef.get(refByRequirement.get(r.id) ?? "");
      if (result) {
        return {
          requirementId: r.id,
          status: result.status,
          sectionIds: toSectionIds(result.sectionRefs),
          present: result.present.map((p) => clean(p)),
          missing: result.missing.map((m) => clean(m)),
        };
      }
      // Exigence omise par la relecture : elle n'est pas presumee couverte.
      const linked = sections.some((s) =>
        ((s.requirement_ids ?? []) as string[]).includes(r.id),
      );
      return {
        requirementId: r.id,
        status: linked ? "partially_covered" : "not_covered",
        sectionIds: [],
        present: [],
        missing: ["Couverture non confirmée par le contrôle : à vérifier."],
      };
    });

    const labelOf = (id: string) => {
      const company = [...context.snapshot.items, ...context.snapshot.documents].find(
        (i) => i.id === id,
      );
      if (company) return company.label;
      const source = context.sourcesById.get(id)?.[0];
      return source
        ? `${source.documentName}${source.pageNumber ? `, page ${source.pageNumber}` : ""}`
        : null;
    };

    const claims: ClaimResult[] = claimsReview.value.claims.map((c) => ({
      sectionId: sectionIdByRef.get(c.sectionRef) ?? null,
      text: clean(c.text),
      type: c.type,
      status: c.status,
      importance: c.importance,
      note: clean(c.note),
      evidence: c.evidenceIds.map(labelOf).filter((l): l is string => Boolean(l)),
    }));

    const consistency: ConsistencyResult[] = claimsReview.value.consistency.map((c) => ({
      description: clean(c.description),
      sectionIds: toSectionIds(c.sectionRefs),
      severity: c.severity,
    }));

    const generic: GenericResult[] = [
      ...claimsReview.value.generic.map((g) => ({
        sectionId: sectionIdByRef.get(g.sectionRef) ?? null,
        excerpt: clean(g.excerpt),
        reason: clean(g.reason),
        suggestion: clean(g.suggestion),
        kind: "GENERIC" as const,
      })),
      ...coverageReview.value.readability.map((r) => ({
        sectionId: sectionIdByRef.get(r.sectionRef) ?? null,
        excerpt: "",
        reason: clean(r.detail),
        suggestion: "",
        kind: "READABILITY" as const,
      })),
    ];

    const weightOf = (label: string) => {
      for (const c of context.criteria) {
        if (c.label === label) return c.weight;
        for (const sub of c.subcriteria ?? []) {
          if (`${c.label} > ${sub.label}` === label || sub.label === label) return sub.weight;
        }
      }
      return null;
    };

    const criteria: CriterionResult[] = coverageReview.value.criteria.map((c) => ({
      criterion: c.criterion,
      weight: weightOf(c.criterion),
      sectionIds: toSectionIds(c.sectionRefs),
      treatment: c.treatment,
      easyToFind: c.easyToFind,
      weaknesses: c.weaknesses.map((w) => clean(w)),
      correction: clean(c.correction),
    }));

    const missingInformation: MissingInformation[] = claimsReview.value.missingInformation.map(
      (m) => ({ question: clean(m.question), criterion: m.criterion, impact: m.impact }),
    );

    const issues = buildIssues({
      requirements: requirementInputs,
      coverage,
      claims,
      consistency,
      generic,
      criteria,
    });

    const readiness = computeReadiness({
      requirements: requirementInputs,
      coverage,
      claims,
      consistency,
      generic,
      criteria,
      missingInformation,
      issues,
      sectionCount: sections.length,
    });

    // Compatibilite : les indicateurs restent lisibles par l'ecran existant.
    const subscores: Subscore[] = readiness.metrics.map((m) => ({
      key: m.key,
      label: m.label,
      score: m.value ?? 0,
      computed: m.computed,
      detail: m.detail,
    }));

    const checkedAt = new Date().toISOString();

    // --- Enregistrement ---------------------------------------------------------
    const { data: saved } = await admin
      .from("quality_checks")
      .upsert(
        {
          organization_id: input.organizationId,
          project_id: input.projectId,
          score: readiness.score,
          subscores,
          summary: clean(coverageReview.value.summary),
          provider: provider.id,
          model: provider.model,
          generated_at: checkedAt,
          ...(engine
            ? {
                matrix: coverage,
                claims,
                criteria_review: criteria,
                missing_info: missingInformation,
                readiness: { ...readiness, consistency, generic },
              }
            : {}),
        },
        { onConflict: "project_id" },
      )
      .select("id")
      .single();

    if (saved) {
      await admin.from("quality_issues").delete().eq("check_id", saved.id as string);

      const sourcesOf = (issue: EngineIssue): CitedSource[] => {
        if (!issue.requirementId) return [];
        const r = requirements.find((x) => x.id === issue.requirementId);
        return (r?.requirement_sources ?? []).map((s) => ({
          documentId: s.document_id ?? "",
          documentName: s.project_documents?.file_name ?? "Document",
          pageNumber: s.page_number,
          label: s.quote ?? s.label ?? "",
        }));
      };

      if (issues.length > 0) {
        await admin.from("quality_issues").insert(
          issues.map((issue, position) => ({
            organization_id: input.organizationId,
            check_id: saved.id as string,
            kind: engine ? issue.kind : LEGACY_KIND[issue.kind],
            severity: issue.severity,
            title: issue.title,
            detail: issue.detail,
            section_id: issue.sectionId,
            requirement_id: issue.requirementId,
            sources: sourcesOf(issue),
            position,
          })),
        );
      }
    }

    // --- Matrice des exigences ---------------------------------------------------
    // Le controle confirme une couverture ; il ne revient jamais sur un statut
    // pose par l'utilisateur (humain dans la boucle).
    const confirmed = coverage
      .filter((c) => c.status === "covered")
      .map((c) => c.requirementId)
      .filter((id) => requirements.find((r) => r.id === id)?.status === "TO_HANDLE");
    if (confirmed.length > 0) {
      await admin
        .from("requirements")
        .update({ status: "COVERED" })
        .in("id", confirmed)
        .eq("project_id", input.projectId);
    }
    if (engine) {
      await Promise.all(
        coverage.map((c) =>
          admin
            .from("requirements")
            .update({
              coverage: {
                status: c.status,
                sectionIds: c.sectionIds,
                present: c.present,
                missing: c.missing,
                checkedAt,
              },
            })
            .eq("id", c.requirementId)
            .eq("project_id", input.projectId),
        ),
      );
    }

    await advanceProjectStatus(admin, input.projectId, "REVIEW");

    const blocking = issues.filter((i) => i.severity === "BLOCKING").length;

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        score: readiness.score,
        ready: readiness.ready,
        issues: issues.length,
        blocking,
        claims: claims.length,
        outputTokens:
          (coverageReview.usage.outputTokens ?? 0) + (claimsReview.usage.outputTokens ?? 0),
      },
    });

    return { score: readiness.score, issues: issues.length, blocking, ready: readiness.ready };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
