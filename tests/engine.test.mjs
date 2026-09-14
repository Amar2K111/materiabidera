// Tests du moteur de preparation du memoire (regles deterministes).
// Lancement : npm test   (Node 22.18+ : les modules .ts sont lus directement)

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIssues, computeReadiness } from "../src/lib/engine/readiness.ts";

const requirement = (overrides = {}) => ({
  id: "r1",
  text: "Plan de phasage en site occupé",
  category: "TECHNIQUE",
  priority: "HIGH",
  mandatory: false,
  userStatus: "TO_HANDLE",
  ...overrides,
});

const coverage = (overrides = {}) => ({
  requirementId: "r1",
  status: "covered",
  sectionIds: ["s1"],
  present: [],
  missing: [],
  ...overrides,
});

const criterion = (overrides = {}) => ({
  criterion: "Valeur technique",
  weight: "60 %",
  sectionIds: ["s1"],
  treatment: "strong",
  easyToFind: true,
  weaknesses: [],
  correction: "",
  ...overrides,
});

const empty = { requirements: [], coverage: [], claims: [], consistency: [], generic: [], criteria: [] };

function evaluate(input, extra = {}) {
  const full = { ...empty, ...input };
  const issues = buildIssues(full);
  const readiness = computeReadiness({
    ...full,
    missingInformation: [],
    issues,
    sectionCount: 3,
    ...extra,
  });
  return { issues, readiness };
}

// --- Test 1 : exigence absente ----------------------------------------------
test("exigence obligatoire absente : alerte critique et memoire non pret", () => {
  const { issues, readiness } = evaluate({
    requirements: [requirement({ mandatory: true })],
    coverage: [coverage({ status: "not_covered", sectionIds: [] })],
  });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].kind, "REQUIREMENT_UNCOVERED");
  assert.equal(issues[0].severity, "BLOCKING");
  assert.equal(readiness.ready, false);
  assert.match(readiness.blockers[0], /obligatoire/);
});

test("exigence administrative non obligatoire absente : importante, pas critique", () => {
  const { issues } = evaluate({
    requirements: [requirement({ category: "ADMINISTRATIF" })],
    coverage: [coverage({ status: "not_covered", sectionIds: [] })],
  });
  assert.equal(issues[0].severity, "IMPORTANT");
});

test("exigence marquee manquante par l'utilisateur : pas d'alerte en double", () => {
  const { issues } = evaluate({
    requirements: [requirement({ userStatus: "MISSING" })],
    coverage: [coverage({ status: "not_covered" })],
  });
  assert.equal(issues.length, 0);
});

// --- Test 2 : exigence partielle ----------------------------------------------
test("couverture partielle : detail present / manquant et demi-point", () => {
  const { issues, readiness } = evaluate({
    requirements: [requirement()],
    coverage: [
      coverage({
        status: "partially_covered",
        present: ["Phasage par zones"],
        missing: ["Maintien des accès pompiers"],
      }),
    ],
  });
  assert.equal(issues[0].kind, "PARTIAL_COVERAGE");
  assert.equal(issues[0].severity, "IMPORTANT");
  assert.match(issues[0].detail, /Déjà présent :\n- Phasage par zones/);
  assert.match(issues[0].detail, /Manquant :\n- Maintien des accès pompiers/);
  assert.equal(readiness.metrics.find((m) => m.key === "requirements").value, 50);
});

// --- Test 3 : hallucination ---------------------------------------------------
test("affirmation sans source : critique et bloque la remise", () => {
  const { issues, readiness } = evaluate({
    claims: [
      {
        sectionId: "s2",
        text: "L'entreprise dispose de 12 véhicules.",
        type: "EQUIPMENT",
        status: "unsupported",
        importance: "MEDIUM",
        note: "Aucun véhicule n'est enregistré dans la base entreprise.",
        evidence: [],
      },
    ],
  });
  assert.equal(issues[0].kind, "UNVERIFIED_CLAIM");
  assert.equal(issues[0].severity, "BLOCKING");
  assert.equal(issues[0].sectionId, "s2");
  assert.match(issues[0].detail, /12 véhicules/);
  assert.equal(readiness.ready, false);
  assert.equal(readiness.metrics.find((m) => m.key === "claims").value, 0);
});

test("affirmation prouvee : aucune alerte", () => {
  const { issues, readiness } = evaluate({
    claims: [
      {
        sectionId: "s2",
        text: "Chef de chantier certifié amiante SS4.",
        type: "CERTIFICATION",
        status: "supported",
        importance: "HIGH",
        note: "",
        evidence: ["Certification SS4"],
      },
    ],
  });
  assert.equal(issues.length, 0);
  assert.equal(readiness.metrics.find((m) => m.key === "evidence").value, 100);
});

// --- Test 4 : contradiction ---------------------------------------------------
test("contradiction majeure entre chapitres : critique", () => {
  const { issues, readiness } = evaluate({
    consistency: [
      {
        description: "Équipe de 4 personnes au chapitre 2, de 6 personnes au chapitre 4.",
        sectionIds: ["s2", "s4"],
        severity: "HIGH",
      },
    ],
  });
  assert.equal(issues[0].kind, "CONSISTENCY");
  assert.equal(issues[0].severity, "BLOCKING");
  assert.equal(readiness.ready, false);
  assert.equal(readiness.metrics.find((m) => m.key === "consistency").value, 75);
});

// --- Test 5 : contenu generique ----------------------------------------------
test("passage generique : important, lisibilite : amelioration", () => {
  const { issues, readiness } = evaluate({
    generic: [
      {
        sectionId: "s1",
        excerpt: "Notre entreprise place la qualité au cœur de ses préoccupations.",
        reason: "Applicable à n'importe quel chantier.",
        suggestion: "Citer le contrôle réellement prévu sur ce lot.",
        kind: "GENERIC",
      },
      { sectionId: "s3", excerpt: "", reason: "Paragraphe de 400 mots sans intertitre.", suggestion: "", kind: "READABILITY" },
    ],
  });
  assert.deepEqual(
    issues.map((i) => [i.kind, i.severity]),
    [
      ["TOO_GENERIC", "IMPORTANT"],
      ["IRRELEVANT_CONTENT", "MINOR"],
    ],
  );
  // Aucun point bloquant : le memoire reste deposable.
  assert.equal(readiness.ready, true);
  assert.ok(readiness.metrics.find((m) => m.key === "personalisation").value < 100);
});

// --- Test 6 : information manquante importante --------------------------------
test("critere fortement pondere sans preuve entreprise : information manquante critique", () => {
  const { issues } = evaluate({
    requirements: [requirement({ priority: "HIGH" })],
    coverage: [
      coverage({
        status: "needs_company_information",
        missing: ["Références de chantiers en site occupé"],
      }),
    ],
    criteria: [criterion({ treatment: "weak", weaknesses: ["Aucune référence citée"] })],
  });
  const missing = issues.find((i) => i.kind === "MISSING_COMPANY_INFO");
  assert.ok(missing);
  assert.equal(missing.severity, "BLOCKING");
  assert.match(missing.detail, /Références de chantiers/);
  assert.equal(issues.find((i) => i.kind === "CRITERIA_MISALIGNED").severity, "IMPORTANT");
});

test("critere absent : bloque la remise", () => {
  const { issues, readiness } = evaluate({ criteria: [criterion({ treatment: "absent", sectionIds: [] })] });
  assert.equal(issues[0].severity, "BLOCKING");
  assert.equal(readiness.ready, false);
  assert.match(readiness.blockers.join(" "), /critère/);
});

// --- Score et verdict -----------------------------------------------------------
test("memoire complet, prouve et coherent : pret, score 100", () => {
  const { issues, readiness } = evaluate({
    requirements: [requirement(), requirement({ id: "r2", mandatory: true })],
    coverage: [coverage(), coverage({ requirementId: "r2" })],
    criteria: [criterion()],
  });
  assert.equal(issues.length, 0);
  assert.equal(readiness.ready, true);
  assert.equal(readiness.score, 100);
});

test("les alertes sont triees par gravite", () => {
  const { issues } = evaluate({
    generic: [{ sectionId: null, excerpt: "", reason: "Long", suggestion: "", kind: "READABILITY" }],
    consistency: [{ description: "x", sectionIds: [], severity: "HIGH" }],
    requirements: [requirement({ category: "ADMINISTRATIF", priority: "LOW" })],
    coverage: [coverage({ status: "not_covered" })],
  });
  assert.deepEqual(
    issues.map((i) => i.severity),
    ["BLOCKING", "IMPORTANT", "MINOR"],
  );
});

test("sans rien de mesurable, le score ne s'invente pas et le memoire vide n'est pas pret", () => {
  const readiness = computeReadiness({ ...empty, missingInformation: [], issues: [], sectionCount: 0 });
  assert.equal(readiness.ready, false);
  // Seule la coherence est mesurable (aucune incoherence) : pas de note fictive ailleurs.
  assert.equal(readiness.metrics.filter((m) => m.value === null).length, 5);
});

test("une exigence hors memoire n'entre pas dans le calcul", () => {
  const { readiness } = evaluate({
    requirements: [requirement(), requirement({ id: "r2", category: "FINANCIER" })],
    coverage: [coverage(), coverage({ requirementId: "r2", status: "not_applicable" })],
  });
  assert.equal(readiness.metrics.find((m) => m.key === "requirements").value, 100);
});
