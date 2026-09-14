// Rapprochement des exigences entre deux analyses, et selection hybride des
// preuves (vocabulaire + sens).

import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRequirements, similarity } from "../src/lib/engine/requirement-match.ts";
import {
  SEMANTIC_MIN,
  bestSimilarities,
  cosine,
  selectHybrid,
  semanticStrength,
} from "../src/lib/engine/semantic.ts";
import { selectEvidence } from "../src/lib/engine/relevance.ts";
import { isOwnStoragePath } from "../src/lib/storage-path.ts";

test("isOwnStoragePath : seul le dossier de l'organisation est accepte", () => {
  const org = "bb7b6135-3213-4937-a1c8-d7b2859cd147";
  assert.equal(isOwnStoragePath(`${org}/projet/fichier.pdf`, org), true);
  assert.equal(isOwnStoragePath(`autre-org/projet/fichier.pdf`, org), false);
  assert.equal(isOwnStoragePath(`${org}/../autre-org/fichier.pdf`, org), false);
  assert.equal(isOwnStoragePath(`${org}`, org), false);
  assert.equal(isOwnStoragePath(`${org}//fichier.pdf`, org), false);
  assert.equal(isOwnStoragePath(null, org), false);
});

// --- Rapprochement des exigences ----------------------------------------------------
test("une exigence reformulee est retrouvee, une nouvelle ne l'est pas", () => {
  const previous = [
    { text: "Le délai d'exécution des travaux est de 12 semaines maximum à compter de l'ordre de service.", category: "DELAI" },
    { text: "Les variantes ne sont pas autorisées pour cette consultation.", category: "ADMINISTRATIF" },
    { text: "Les déchets de chantier devront être triés et évacués vers des filières autorisées.", category: "QSE" },
  ];
  const next = [
    { text: "Les variantes ne sont pas autorisées.", category: "ADMINISTRATIF" },
    { text: "Délai d'exécution des travaux : 12 semaines maximum à compter de l'ordre de service de démarrage.", category: "DELAI" },
    { text: "Le candidat fournit une attestation de visite du site.", category: "ADMINISTRATIF" },
  ];
  const matches = matchRequirements(previous, next);
  assert.equal(matches.get(0), 1);
  assert.equal(matches.get(1), 0);
  assert.equal(matches.has(2), false);
  // L'exigence sur les dechets n'est reprise par aucune : elle sera supprimee.
  assert.ok(![...matches.values()].includes(2));
});

test("chaque exigence precedente ne sert qu'une fois", () => {
  const previous = [{ text: "Les variantes ne sont pas autorisées.", category: "ADMINISTRATIF" }];
  const next = [
    { text: "Les variantes ne sont pas autorisées.", category: "ADMINISTRATIF" },
    { text: "Variantes non autorisées pour la consultation.", category: "ADMINISTRATIF" },
  ];
  const matches = matchRequirements(previous, next);
  assert.equal(matches.size, 1);
  assert.equal(matches.get(0), 0);
});

test("similarity : identiques = 1, sans rapport = 0", () => {
  assert.equal(similarity("pose d'ardoises naturelles", "Pose d'ardoises naturelles"), 1);
  assert.equal(similarity("pénalités de retard", "échafaudage de pied"), 0);
});

// --- Selection hybride -----------------------------------------------------------
const items = [
  { id: "C1", text: "Plan de prévention : séparation des flux piétons et chantier en établissement recevant du public" },
  { id: "C2", text: "Nacelle articulée 16 m et bennes à déchets" },
  { id: "C3", text: "Pénalité de 150 euros par jour de retard" },
];
const query = "Sécurité des élèves pendant les travaux en site scolaire occupé";

test("sans vecteurs : resultat identique a la recherche par mots-cles", () => {
  const hybrid = selectHybrid(query, items, null, { limit: 5, minScore: 0 });
  const lexical = selectEvidence(query, items, { limit: 5, minScore: 0 });
  assert.deepEqual(hybrid.map((i) => i.id), lexical.map((i) => i.id));
});

test("avec vecteurs : une preuve sans mot commun mais proche par le sens est retenue", () => {
  // Aucun mot commun entre la requete et C1 : la recherche lexicale l'ignore.
  assert.equal(selectEvidence(query, items, { limit: 5, minScore: 0 }).some((i) => i.id === "C1"), false);
  const similarities = new Map([
    ["C1", 0.73],
    ["C2", 0.62],
    ["C3", 0.56],
  ]);
  const selected = selectHybrid(query, items, similarities, { limit: 5, minScore: 0 });
  assert.equal(selected[0].id, "C1");
  assert.ok(!selected.some((i) => i.id === "C3"));
  assert.ok(0.62 < SEMANTIC_MIN);
});

test("cosine, echelle et meilleure requete", () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(semanticStrength(0.5), 0);
  assert.equal(semanticStrength(0.9), 1);
  const best = bestSimilarities([[1, 0], [0, 1]], new Map([["x", [0, 1]]]));
  assert.equal(best.get("x"), 1);
});

test("le sens rapproche deux formulations sans vocabulaire commun, jamais seul", () => {
  const previous = [{ text: "Les variantes ne sont pas autorisées par le maître d'ouvrage.", category: "ADMINISTRATIF" }];
  const next = [{ text: "L'offre ne doit pas comporter de variantes.", category: "ADMINISTRATIF" }];
  // Sans vecteurs : le vocabulaire commun est trop faible.
  assert.equal(matchRequirements(previous, next).size, 0);
  // Avec une proximite de sens elevee : rapprochement.
  assert.equal(matchRequirements(previous, next, { semantic: () => 0.87 }).get(0), 0);
  // Le sens seul ne suffit pas : sans aucun mot commun, pas de rapprochement.
  const unrelated = [{ text: "Les déchets sont évacués vers des filières agréées.", category: "QSE" }];
  assert.equal(matchRequirements(previous, unrelated, { semantic: () => 0.95 }).size, 0);
});

test("l'ancrage sur le meme passage du DCE rapproche une exigence reformulee", () => {
  const anchors = ["doc-1|3"];
  const previous = [{ text: "Le titulaire maintient les cheminements sécurisés pour les élèves.", category: "QSE", anchors }];
  const next = [{ text: "Les cheminements des élèves restent protégés pendant toute la durée.", category: "TECHNIQUE", anchors }];
  assert.equal(matchRequirements(previous, next).get(0), 0);
  // Sans passage commun, ces deux formulations resteraient distinctes.
  assert.equal(matchRequirements(previous, [{ ...next[0], anchors: ["doc-9|1"] }]).size, 0);
});

test("une exigence decoupee en deux reste rattachee a la plus proche", () => {
  const previous = [{ text: "Le mémoire technique traite la méthodologie, les moyens humains et les moyens matériels.", category: "TECHNIQUE" }];
  const next = [
    { text: "Le mémoire technique traite la méthodologie.", category: "TECHNIQUE" },
    { text: "Le planning prévisionnel est joint à l'offre.", category: "DELAI" },
  ];
  const matches = matchRequirements(previous, next);
  assert.equal(matches.get(0), 0);
  assert.equal(matches.has(1), false);
});
