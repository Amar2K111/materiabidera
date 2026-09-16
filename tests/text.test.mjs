// Tests des traitements de texte purs : pertinence des preuves, citations,
// decoupage des documents et structure des exports.

import { test } from "node:test";
import assert from "node:assert/strict";
import { rankByRelevance, selectEvidence, tokenize } from "../src/lib/engine/relevance.ts";
import { humanizeRefs, stripCitationCodes } from "../src/lib/citations.ts";
import { validateStructured } from "../src/lib/ai/types.ts";
import { z } from "zod";
import { PASSAGE_CHARS, splitIntoPassages } from "../src/lib/extraction/chunk.ts";
import { parseBlocks, parseRuns } from "../src/lib/services/export-blocks.ts";

// --- Pertinence -------------------------------------------------------------------
test("tokenize : sans accents, sans mots vides, racines rapprochees", () => {
  const terms = tokenize("La sécurisation du chantier et la sécurité des équipes");
  assert.ok(!terms.includes("la"));
  assert.equal(terms.filter((t) => t === "securi").length, 2);
});

test("rankByRelevance : la preuve pertinente passe en tete", () => {
  const items = [
    { id: "C1", text: "Référence : réfection de toiture d'un gymnase, couverture zinc" },
    { id: "C2", text: "Certification Qualibat 3113 étanchéité toitures-terrasses" },
    { id: "C3", text: "Parc matériel : nacelle, échafaudage, benne à déchets" },
  ];
  const ranked = rankByRelevance("étanchéité des toitures-terrasses", items);
  assert.equal(ranked[0].id, "C2");
  assert.ok(ranked[0].score > ranked[2].score);
});

test("selectEvidence : petite base transmise en entier, grande base filtree", () => {
  const items = Array.from({ length: 30 }, (_, i) => ({
    id: `C${i}`,
    text: i === 7 ? "désamiantage sous confinement" : `fiche sans rapport ${i}`,
  }));
  assert.equal(selectEvidence("désamiantage", items.slice(0, 5), { limit: 2, keepAllBelow: 10 }).length, 5);
  const selected = selectEvidence("désamiantage", items, { limit: 5, keepAllBelow: 10 });
  assert.deepEqual(selected.map((s) => s.id), ["C7"]);
});

// --- Citations (Test 7 : tracabilite sans code visible) -----------------------------
test("stripCitationCodes retire les identifiants mais garde les parentheses utiles", () => {
  assert.equal(
    stripCitationCodes("Le phasage est imposé [E3, R12]. Le délai (8 semaines) est tenu."),
    "Le phasage est imposé. Le délai (8 semaines) est tenu.",
  );
  assert.equal(stripCitationCodes("Critère technique (K1.2) détaillé."), "Critère technique détaillé.");
  assert.equal(stripCitationCodes("Norme (R408) respectée."), "Norme (R408) respectée.");
  assert.equal(stripCitationCodes(null), null);
});

test("humanizeRefs : references internes remplacees par des intitules", () => {
  const lookup = {
    section: (ref) => ({ S2: "Moyens humains et matériels", S3: "Méthodologie" })[ref],
    requirement: (ref) => ({ R4: "Les offres doivent être transmises par voie électronique avant la date limite" })[ref],
  };
  assert.equal(
    humanizeRefs("Effectif de 6 à la fin de la section S2 et de 4 dans S3.", lookup),
    "Effectif de 6 à la fin du chapitre « Moyens humains et matériels » et de 4 dans « Méthodologie ».",
  );
  assert.equal(
    humanizeRefs("La section S3 contredit le chapitre S2.", lookup),
    "Le chapitre « Méthodologie » contredit le chapitre « Moyens humains et matériels ».",
  );
  assert.match(humanizeRefs("L'exigence R4 manque.", lookup), /L'exigence « Les offres doivent être transmises par voie électronique avant la… »/);
  // Reference inconnue ou norme : inchangee.
  assert.equal(humanizeRefs("Norme R408, chapitre S9.", lookup), "Norme R408, chapitre S9.");
});

// --- Validation des sorties structurees ---------------------------------------------
test("validateStructured : texte trop long ramene a la limite, autre defaut refuse", () => {
  const schema = z.object({ note: z.string().max(20), items: z.array(z.object({ t: z.string().max(10) })) });
  const value = validateStructured(schema, {
    note: "Une note beaucoup trop longue pour la limite",
    items: [{ t: "court" }, { t: "vraiment trop long" }],
  });
  assert.ok(value.note.length <= 20 && value.note.endsWith("…"));
  assert.ok(value.items[1].t.length <= 10);
  assert.throws(() => validateStructured(schema, { note: 3, items: [] }), /hors format/);
});

// --- Decoupage --------------------------------------------------------------------
test("splitIntoPassages : aucun contenu perdu, passages sous le plafond", () => {
  const paragraph = "Article. ".repeat(120).trim();
  const text = Array.from({ length: 20 }, (_, i) => `${i} ${paragraph}`).join("\n\n") + "\n\nClause finale.";
  const passages = splitIntoPassages(text, "\n\n");
  assert.ok(passages.length > 1);
  assert.ok(passages.every((p) => p.length <= PASSAGE_CHARS));
  assert.match(passages.at(-1), /Clause finale\.$/);
  assert.equal(passages.join("").replace(/\s/g, "").length, text.replace(/\s/g, "").length);
});

// --- Structure des exports ----------------------------------------------------------
test("parseRuns : gras reconnu, marqueur orphelin retire", () => {
  assert.deepEqual(parseRuns("Un **point** clé"), [
    { text: "Un ", bold: false },
    { text: "point", bold: true },
    { text: " clé", bold: false },
  ]);
  assert.deepEqual(parseRuns("Un **point"), [
    { text: "Un ", bold: false },
    { text: "point", bold: false },
  ]);
});

test("parseBlocks : sous-titres, listes, paragraphes et tableaux", () => {
  const blocks = parseBlocks(
    [
      "## Organisation",
      "Introduction du chapitre",
      "sur deux lignes.",
      "",
      "- Chef de chantier",
      "- Compagnons",
      "",
      "| Poste | Effectif |",
      "|---|---|",
      "| Couvreur | **3** |",
      "| Manœuvre |",
      "",
      "Conclusion.",
    ].join("\n"),
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["heading", "paragraph", "bullets", "table", "paragraph"],
  );
  assert.equal(blocks[1].runs[0].text, "Introduction du chapitre sur deux lignes.");
  const table = blocks[3];
  assert.equal(table.header.length, 2);
  assert.equal(table.rows.length, 2);
  assert.deepEqual(table.rows[0][1], [{ text: "3", bold: true }]);
  // Ligne incomplete completee par une cellule vide.
  assert.equal(table.rows[1].length, 2);
});

test("parseBlocks : une ligne avec des barres sans separateur reste un paragraphe", () => {
  const blocks = parseBlocks("| pas un tableau |");
  assert.equal(blocks[0].type, "paragraph");
});

test("parseBlocks : niveaux de titre et encadre", () => {
  const blocks = parseBlocks(
    ["## Phasage", "### Phase 1", "Texte.", "", "> **Engagement principal** : aucune zone laissée découverte."].join("\n"),
  );
  assert.deepEqual(
    blocks.map((b) => (b.type === "heading" ? `h${b.level}` : b.type)),
    ["h2", "h3", "paragraph", "callout"],
  );
  const callout = blocks[3];
  assert.equal(callout.title, "Engagement principal");
  // Le texte de l'encadre commence par une majuscule apres le titre.
  assert.equal(callout.runs[0].text, "Aucune zone laissée découverte.");
});
