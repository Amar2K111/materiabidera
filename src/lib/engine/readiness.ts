/**
 * Moteur de preparation du memoire : regles deterministes.
 *
 * Les controles (couverture, affirmations, coherence, pertinence, criteres)
 * sont produits par le moteur d'analyse sous forme de donnees validees. Ce
 * module, pur et testable, en tire les alertes priorisees, les indicateurs et
 * le verdict "pret a deposer". Aucune note n'est inventee : chaque indicateur
 * se recalcule a l'identique a partir des memes resultats.
 */

export type CoverageStatus =
  | "covered"
  | "partially_covered"
  | "not_covered"
  | "needs_company_information"
  | "not_applicable";

export type RequirementInput = {
  id: string;
  text: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  mandatory: boolean;
  /** Statut fixe par l'utilisateur : "MISSING" est respecte tel quel. */
  userStatus: "COVERED" | "TO_HANDLE" | "MISSING";
};

export type CoverageResult = {
  requirementId: string;
  status: CoverageStatus;
  sectionIds: string[];
  present: string[];
  missing: string[];
};

export type ClaimStatus =
  | "supported"
  | "partially_supported"
  | "unsupported"
  | "needs_validation";

export type ClaimResult = {
  sectionId: string | null;
  text: string;
  type: string;
  status: ClaimStatus;
  importance: "HIGH" | "MEDIUM" | "LOW";
  note: string;
  evidence: string[];
};

export type ConsistencyResult = {
  description: string;
  sectionIds: string[];
  severity: "HIGH" | "MEDIUM";
};

export type GenericResult = {
  sectionId: string | null;
  excerpt: string;
  reason: string;
  suggestion: string;
  kind: "GENERIC" | "READABILITY";
};

export type CriterionResult = {
  criterion: string;
  weight: string | null;
  sectionIds: string[];
  treatment: "strong" | "adequate" | "weak" | "absent";
  easyToFind: boolean;
  weaknesses: string[];
  correction: string;
};

export type MissingInformation = {
  question: string;
  criterion: string | null;
  impact: "HIGH" | "MEDIUM" | "LOW";
};

export type Severity = "BLOCKING" | "IMPORTANT" | "MINOR";

export type IssueKind =
  | "REQUIREMENT_UNCOVERED"
  | "PARTIAL_COVERAGE"
  | "MISSING_COMPANY_INFO"
  | "UNVERIFIED_CLAIM"
  | "CONSISTENCY"
  | "TOO_GENERIC"
  | "IRRELEVANT_CONTENT"
  | "CRITERIA_MISALIGNED";

export type EngineIssue = {
  kind: IssueKind;
  severity: Severity;
  title: string;
  detail: string;
  requirementId: string | null;
  sectionId: string | null;
};

/** Categories dont l'exigence se traite en general hors du memoire technique. */
const OUTSIDE_MEMORY = new Set(["ADMINISTRATIF", "FINANCIER"]);

function isCritical(r: RequirementInput) {
  return r.mandatory || (r.priority === "HIGH" && !OUTSIDE_MEMORY.has(r.category));
}

function list(items: string[]) {
  return items.map((i) => `- ${i}`).join("\n");
}

/**
 * Alertes priorisees (section 28).
 * CRITIQUE (BLOCKING) : exigence obligatoire absente, contradiction majeure,
 * affirmation importante non verifiee, critere absent.
 * IMPORTANT : couverture partielle, preuve manquante, contenu generique.
 * AMELIORATION (MINOR) : lisibilite, repetition, preuve partielle.
 */
export function buildIssues(input: {
  requirements: RequirementInput[];
  coverage: CoverageResult[];
  claims: ClaimResult[];
  consistency: ConsistencyResult[];
  generic: GenericResult[];
  criteria: CriterionResult[];
}): EngineIssue[] {
  const byId = new Map(input.requirements.map((r) => [r.id, r]));
  const issues: EngineIssue[] = [];

  for (const c of input.coverage) {
    const requirement = byId.get(c.requirementId);
    if (!requirement || requirement.userStatus === "MISSING") continue;
    const sectionId = c.sectionIds[0] ?? null;

    if (c.status === "not_covered") {
      issues.push({
        kind: "REQUIREMENT_UNCOVERED",
        severity: isCritical(requirement) ? "BLOCKING" : "IMPORTANT",
        title: "Exigence non traitée",
        detail: requirement.mandatory
          ? "Exigence obligatoire : aucun chapitre ne la traite."
          : "Aucun chapitre ne traite réellement cette exigence.",
        requirementId: requirement.id,
        sectionId,
      });
    } else if (c.status === "partially_covered") {
      issues.push({
        kind: "PARTIAL_COVERAGE",
        severity: requirement.mandatory ? "BLOCKING" : "IMPORTANT",
        title: "Couverture partielle",
        detail: [
          c.present.length ? `Déjà présent :\n${list(c.present)}` : "",
          c.missing.length ? `Manquant :\n${list(c.missing)}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
        requirementId: requirement.id,
        sectionId,
      });
    } else if (c.status === "needs_company_information") {
      issues.push({
        kind: "MISSING_COMPANY_INFO",
        severity: isCritical(requirement) ? "BLOCKING" : "IMPORTANT",
        title: "Information entreprise manquante",
        detail: c.missing.length
          ? `À fournir :\n${list(c.missing)}`
          : "La réponse exige une information absente de la base entreprise.",
        requirementId: requirement.id,
        sectionId,
      });
    }
  }

  for (const claim of input.claims) {
    if (claim.status === "supported") continue;
    const severity: Severity =
      claim.status === "unsupported"
        ? claim.importance === "LOW"
          ? "IMPORTANT"
          : "BLOCKING"
        : claim.status === "needs_validation"
          ? "IMPORTANT"
          : "MINOR";
    issues.push({
      kind: "UNVERIFIED_CLAIM",
      severity,
      title:
        claim.status === "unsupported"
          ? "Affirmation non vérifiée"
          : claim.status === "needs_validation"
            ? "Affirmation à valider"
            : "Affirmation partiellement étayée",
      detail: `« ${claim.text} »${claim.note ? `\n\n${claim.note}` : ""}`,
      requirementId: null,
      sectionId: claim.sectionId,
    });
  }

  for (const c of input.consistency) {
    issues.push({
      kind: "CONSISTENCY",
      severity: c.severity === "HIGH" ? "BLOCKING" : "IMPORTANT",
      title: "Incohérence entre chapitres",
      detail: c.description,
      requirementId: null,
      sectionId: c.sectionIds[0] ?? null,
    });
  }

  for (const g of input.generic) {
    issues.push({
      kind: g.kind === "GENERIC" ? "TOO_GENERIC" : "IRRELEVANT_CONTENT",
      severity: g.kind === "GENERIC" ? "IMPORTANT" : "MINOR",
      title: g.kind === "GENERIC" ? "Passage trop générique" : "Lisibilité à améliorer",
      detail: [g.excerpt ? `« ${g.excerpt} »` : "", g.reason, g.suggestion ? `Piste : ${g.suggestion}` : ""]
        .filter(Boolean)
        .join("\n\n"),
      requirementId: null,
      sectionId: g.sectionId,
    });
  }

  for (const c of input.criteria) {
    if (c.treatment === "strong" || (c.treatment === "adequate" && c.easyToFind)) continue;
    issues.push({
      kind: "CRITERIA_MISALIGNED",
      severity: c.treatment === "absent" ? "BLOCKING" : c.treatment === "weak" ? "IMPORTANT" : "MINOR",
      title:
        c.treatment === "absent"
          ? `Critère non traité : ${c.criterion}`
          : c.treatment === "weak"
            ? `Critère insuffisamment traité : ${c.criterion}`
            : `Réponse difficile à retrouver : ${c.criterion}`,
      detail: [
        c.weaknesses.length ? list(c.weaknesses) : "",
        c.correction ? `Correction proposée : ${c.correction}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
      requirementId: null,
      sectionId: c.sectionIds[0] ?? null,
    });
  }

  const order: Record<Severity, number> = { BLOCKING: 0, IMPORTANT: 1, MINOR: 2 };
  return issues.sort((a, b) => order[a.severity] - order[b.severity]);
}

export type ReadinessMetric = {
  key: string;
  label: string;
  /** Pourcentage, ou null si rien n'est mesurable. */
  value: number | null;
  detail: string;
  computed: boolean;
};

export type Readiness = {
  score: number;
  ready: boolean;
  /** Raisons pour lesquelles le memoire n'est pas pret, par ordre d'importance. */
  blockers: string[];
  metrics: ReadinessMetric[];
  missingInformation: number;
};

const WEIGHTS: Record<string, number> = {
  requirements: 30,
  criteria: 20,
  evidence: 15,
  claims: 15,
  personalisation: 10,
  consistency: 10,
};

function pct(part: number, total: number): number | null {
  return total === 0 ? null : Math.round((part / total) * 100);
}

/**
 * Score de preparation et verdict (sections 27 et 51).
 *
 * Ce n'est pas une probabilite de gagner : c'est la mesure de ce qui est
 * couvert, prouve et coherent au regard du dossier.
 */
export function computeReadiness(input: {
  requirements: RequirementInput[];
  coverage: CoverageResult[];
  claims: ClaimResult[];
  consistency: ConsistencyResult[];
  generic: GenericResult[];
  criteria: CriterionResult[];
  missingInformation: MissingInformation[];
  issues: EngineIssue[];
  sectionCount: number;
}): Readiness {
  const coverageById = new Map(input.coverage.map((c) => [c.requirementId, c]));
  const scored = input.requirements.filter(
    (r) => coverageById.get(r.id)?.status !== "not_applicable",
  );

  let requirementPoints = 0;
  for (const r of scored) {
    if (r.userStatus === "MISSING") continue;
    const status = coverageById.get(r.id)?.status;
    if (status === "covered" || (!status && r.userStatus === "COVERED")) requirementPoints += 1;
    else if (status === "partially_covered") requirementPoints += 0.5;
  }
  const requirementsValue = pct(requirementPoints, scored.length);

  const criteriaPoints = input.criteria.reduce(
    (sum, c) =>
      sum + (c.treatment === "strong" ? 1 : c.treatment === "adequate" ? 0.8 : c.treatment === "weak" ? 0.4 : 0),
    0,
  );
  const criteriaValue = pct(criteriaPoints, input.criteria.length);

  const factual = input.claims;
  const supported = factual.filter((c) => c.status === "supported").length;
  const partially = factual.filter((c) => c.status === "partially_supported").length;
  const evidenceValue = pct(supported + partially * 0.5, factual.length);
  const unsupportedImportant = factual.filter(
    (c) => c.status === "unsupported" && c.importance !== "LOW",
  ).length;
  const claimsValue = pct(
    factual.length - factual.filter((c) => c.status === "unsupported").length,
    factual.length,
  );

  const genericCount = input.generic.filter((g) => g.kind === "GENERIC").length;
  const personalisationValue =
    input.sectionCount === 0
      ? null
      : Math.max(0, Math.round(100 - (genericCount / input.sectionCount) * 35));

  const highConsistency = input.consistency.filter((c) => c.severity === "HIGH").length;
  const consistencyValue = Math.max(
    0,
    100 - highConsistency * 25 - (input.consistency.length - highConsistency) * 10,
  );

  const metrics: ReadinessMetric[] = [
    {
      key: "requirements",
      label: "Couverture des exigences",
      value: requirementsValue,
      detail: `${scored.filter((r) => coverageById.get(r.id)?.status === "covered").length} couverte(s), ${scored.filter((r) => coverageById.get(r.id)?.status === "partially_covered").length} partielle(s) sur ${scored.length} exigence(s) attendue(s) dans le mémoire.`,
      computed: true,
    },
    {
      key: "criteria",
      label: "Couverture des critères",
      value: criteriaValue,
      detail: `${input.criteria.filter((c) => c.treatment === "strong" || c.treatment === "adequate").length} critère(s) traité(s) correctement sur ${input.criteria.length}.`,
      computed: false,
    },
    {
      key: "evidence",
      label: "Preuves entreprise",
      value: evidenceValue,
      detail: `${supported} affirmation(s) prouvée(s), ${partially} partiellement, sur ${factual.length} relevée(s).`,
      computed: true,
    },
    {
      key: "claims",
      label: "Affirmations vérifiées",
      value: claimsValue,
      detail: `${factual.filter((c) => c.status === "unsupported").length} affirmation(s) sans source.`,
      computed: true,
    },
    {
      key: "personalisation",
      label: "Personnalisation au marché",
      value: personalisationValue,
      detail: `${genericCount} passage(s) générique(s) relevé(s).`,
      computed: false,
    },
    {
      key: "consistency",
      label: "Cohérence",
      value: consistencyValue,
      detail: `${input.consistency.length} incohérence(s) entre chapitres.`,
      computed: false,
    },
  ];

  let weighted = 0;
  let total = 0;
  for (const m of metrics) {
    if (m.value === null) continue;
    weighted += m.value * (WEIGHTS[m.key] ?? 0);
    total += WEIGHTS[m.key] ?? 0;
  }
  const score = total === 0 ? 0 : Math.round(weighted / total);

  const mandatoryOpen = input.requirements.filter((r) => {
    if (!r.mandatory || r.userStatus === "MISSING") return false;
    const status = coverageById.get(r.id)?.status;
    return status !== "covered" && status !== "not_applicable";
  }).length;
  const blockingIssues = input.issues.filter((i) => i.severity === "BLOCKING").length;
  const absentCriteria = input.criteria.filter((c) => c.treatment === "absent").length;

  const blockers: string[] = [];
  if (mandatoryOpen > 0) blockers.push(`${mandatoryOpen} exigence(s) obligatoire(s) non couverte(s)`);
  if (absentCriteria > 0) blockers.push(`${absentCriteria} critère(s) de notation non traité(s)`);
  if (unsupportedImportant > 0) blockers.push(`${unsupportedImportant} affirmation(s) importante(s) non vérifiée(s)`);
  if (highConsistency > 0) blockers.push(`${highConsistency} incohérence(s) majeure(s)`);
  if (blockers.length === 0 && blockingIssues > 0) {
    blockers.push(`${blockingIssues} problème(s) critique(s) à traiter`);
  }

  return {
    score,
    ready: blockers.length === 0 && input.sectionCount > 0,
    blockers,
    metrics,
    missingInformation: input.missingInformation.length,
  };
}
