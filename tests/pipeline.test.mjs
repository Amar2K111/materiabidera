// Criteres de qualification, resultats des consultations, recherche dans la
// base entreprise, rangement des methodes.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyRules,
  checkPrepDays,
  parseRules,
  ruleLabel,
  rulePresets,
} from "../src/lib/qualification.ts";
import { computePipeline, outcomeRelevant } from "../src/lib/outcome.ts";
import { bestExcerpt, searchItems } from "../src/lib/engine/search.ts";
import { guessDomain } from "../src/lib/method-domain.ts";

// --- Criteres de qualification ----------------------------------------------

test("parseRules ecarte les entrees invalides, vides ou en double", () => {
  const rules = parseRules([
    { id: "a", kind: "text", text: "Montant > 50 k€", blocking: false },
    { id: "a", kind: "text", text: "doublon", blocking: false },
    { id: "b", kind: "text", text: "   ", blocking: true },
    { id: "c", kind: "min_prep_days", text: "", blocking: false },
    { id: "d", kind: "min_prep_days", text: "", days: 10, blocking: true },
    { id: "e", kind: "inconnu", text: "x", blocking: false },
    "pas un objet",
  ]);
  assert.deepEqual(
    rules.map((r) => r.id),
    ["a", "d"],
  );
  assert.deepEqual(parseRules(null), []);
  assert.deepEqual(parseRules({}), []);
});

test("delai de preparation : calcule sur la date limite, sans interpretation", () => {
  const rule = { id: "d", kind: "min_prep_days", text: "", days: 10, blocking: true };
  const now = new Date("2026-09-18T09:00:00Z");

  assert.equal(checkPrepDays(rule, "2026-10-15T12:00:00Z", now).status, "RESPECTED");
  assert.equal(checkPrepDays(rule, "2026-09-22T12:00:00Z", now).status, "VIOLATED");
  assert.equal(checkPrepDays(rule, "2026-09-01T12:00:00Z", now).status, "VIOLATED");
  assert.equal(checkPrepDays(rule, null, now).status, "UNKNOWN");
  assert.equal(checkPrepDays(rule, "pas une date", now).status, "UNKNOWN");

  const ok = checkPrepDays(rule, "2026-10-15T12:00:00Z", now);
  assert.equal(ok.automatic, true);
  // Meme decompte que daysUntil : depuis le debut de la journee, arrondi au-dessus.
  assert.match(ok.justification, /28 jours/);
  assert.equal(ruleLabel(rule), "Au moins 10 jours pour préparer l'offre");
});

test("un critere eliminatoire non respecte impose le NO-GO", () => {
  const check = (blocking, status) => ({
    ruleId: `${blocking}-${status}`,
    text: "x",
    blocking,
    status,
    justification: "x",
    sources: [],
    automatic: false,
  });

  assert.equal(applyRules("GO", [check(true, "VIOLATED")]).recommendation, "NO_GO");
  assert.equal(applyRules("VIGILANCE", [check(true, "VIOLATED")]).recommendation, "NO_GO");
  // Eliminatoire non verifiable, ou critere simple non respecte : sous reserve.
  assert.equal(applyRules("GO", [check(true, "UNKNOWN")]).recommendation, "VIGILANCE");
  assert.equal(applyRules("GO", [check(false, "VIOLATED")]).recommendation, "VIGILANCE");
  // Un critere simple inconnu ne change rien ; un NO-GO de la note reste NO-GO.
  assert.equal(applyRules("GO", [check(false, "UNKNOWN")]).recommendation, "GO");
  assert.equal(applyRules("NO_GO", [check(false, "VIOLATED")]).recommendation, "NO_GO");
  assert.equal(applyRules("GO", [check(true, "RESPECTED")]).recommendation, "GO");
  assert.equal(applyRules("GO", []).recommendation, "GO");

  const { decisive } = applyRules("GO", [check(true, "VIOLATED"), check(false, "VIOLATED")]);
  assert.deepEqual(decisive.map((c) => c.ruleId), ["true-VIOLATED"]);
});

test("les suggestions reprennent la zone d'intervention de l'entreprise", () => {
  const withArea = rulePresets("Indre-et-Loire et Loir-et-Cher");
  assert.ok(withArea.some((r) => r.text.includes("Indre-et-Loire et Loir-et-Cher")));
  assert.ok(rulePresets(null).every((r) => !r.text.includes("null")));
  // Chaque suggestion est un critere valide une fois identifie.
  assert.equal(
    parseRules(withArea.map((r, i) => ({ ...r, id: `p${i}` }))).length,
    withArea.length,
  );
});

// --- Resultats des consultations --------------------------------------------

test("taux de reussite : sur les resultats connus, hors dossiers exemples", () => {
  const row = (status, outcome, is_demo = false) => ({ status, outcome, is_demo, deadline: null });
  const pipeline = computePipeline([
    row("EXPORTED", "WON"),
    row("EXPORTED", "WON"),
    row("EXPORTED", "LOST"),
    row("EXPORTED", "CANCELLED"),
    row("EXPORTED", null),
    row("READY", null),
    row("WRITING", null),
    row("DRAFT", null),
    row("NO_GO", null),
    row("EXPORTED", "WON", true),
    row("EXPORTED", "LOST", true),
  ]);
  assert.deepEqual(pipeline, { inProgress: 2, awaiting: 2, won: 2, lost: 1, winRate: 67 });
});

test("sans resultat connu, pas de taux affiche", () => {
  assert.equal(computePipeline([]).winRate, null);
  assert.equal(
    computePipeline([{ status: "EXPORTED", outcome: "CANCELLED", is_demo: false, deadline: null }])
      .winRate,
    null,
  );
});

test("le resultat se propose une fois l'offre prete ou la date passee", () => {
  const now = new Date("2026-09-18T09:00:00Z");
  assert.equal(outcomeRelevant({ status: "WRITING", outcome: null, deadline: "2026-10-01" }, now), false);
  assert.equal(outcomeRelevant({ status: "WRITING", outcome: null, deadline: "2026-09-01" }, now), true);
  assert.equal(outcomeRelevant({ status: "EXPORTED", outcome: null, deadline: null }, now), true);
  assert.equal(outcomeRelevant({ status: "DRAFT", outcome: "LOST", deadline: null }, now), true);
  assert.equal(outcomeRelevant({ status: "DRAFT", outcome: null, deadline: null }, now), false);
});

// --- Recherche ----------------------------------------------------------------

const base = [
  {
    id: "C1",
    label: "Méthode : Astreinte",
    text: "Intitule : Astreinte\nDescription : Astreinte 24/7 avec intervention en moins de 2 heures sur site.",
  },
  {
    id: "C2",
    label: "Certification : ISO 9001",
    text: "Certification : ISO 9001\nValable jusqu au : 2027-06-30",
  },
  {
    id: "L1",
    label: "Ancien mémoire : ecole.pdf, page 3",
    text: "Le chantier a été mené en site occupé. Les travaux bruyants ont été planifiés pendant les vacances scolaires.",
  },
];

test("recherche par mots : la bonne fiche remonte, avec son extrait", () => {
  const hits = searchItems("astreinte", base, null);
  assert.equal(hits[0].id, "C1");
  assert.equal(hits[0].match, "mots");
  assert.match(hits[0].excerpt, /24\/7/);

  // Le libelle compte : "ISO 9001" retrouve la certification.
  assert.equal(searchItems("iso 9001", base, null)[0].id, "C2");
  // Rien de commun, rien de retenu.
  assert.deepEqual(searchItems("désamiantage", base, null), []);
  assert.deepEqual(searchItems("   ", base, null), []);
});

test("recherche par le sens : un passage sans mot commun peut remonter", () => {
  const similarities = new Map([
    ["C1", 0.5],
    ["C2", 0.4],
    ["L1", 0.82],
  ]);
  const hits = searchItems("contraintes d'un établissement scolaire en activité", base, similarities);
  assert.equal(hits[0].id, "L1");
  assert.ok(hits[0].match === "sens" || hits[0].match === "sens et mots");
});

test("l'extrait retenu est la phrase la plus proche de la question", () => {
  const text =
    "Premiere phrase generale. Les travaux bruyants sont planifies hors periode scolaire. Derniere phrase.";
  assert.equal(bestExcerpt("travaux bruyants", text), "Les travaux bruyants sont planifies hors periode scolaire.");
  assert.equal(bestExcerpt("rien a voir", "Seule phrase."), "Seule phrase.");
  assert.ok(bestExcerpt("x", "a".repeat(600)).length <= 240);
});

// --- Rangement des methodes -------------------------------------------------

test("un chapitre valide est range dans le bon domaine de methode", () => {
  assert.equal(guessDomain("Sécurité et prévention"), "SECURITE");
  assert.equal(guessDomain("Gestion des déchets"), "ENVIRONNEMENT");
  assert.equal(guessDomain("Contrôle qualité"), "QUALITE");
  assert.equal(guessDomain("Organisation et moyens humains"), "ORGANISATION");
  assert.equal(guessDomain("Méthodologie d'exécution"), "CHANTIER");
  assert.equal(guessDomain("Compréhension du besoin"), "AUTRE");
});
