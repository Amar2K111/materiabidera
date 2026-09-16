// Modele documentaire du memoire technique : ce que Word et PDF rendent a l'identique.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildMemoryDocument,
  columnWidths,
  exportFileName,
  normalizeText,
  sectionNumber,
} from "../src/lib/export/document.ts";

const base = {
  companyName: "Couverture Val de Loire",
  projectName: "Réfection de la couverture — École Jean-Moulin",
  subject: "Travaux de réfection de la couverture de l'école élémentaire Jean-Moulin.",
  buyer: "Ville de Tours",
  lot: "Lot unique - Couverture / Étanchéité / Zinguerie",
  reference: "2026-TRV-COUV-03",
  issuedOn: "15 septembre 2026",
  includeSources: false,
  includeAnnexes: true,
  references: [],
  certifications: [],
  sections: [
    { number: "1", title: "Compréhension du besoin", content: "## Enjeux\nTexte.\n\n## Contraintes\nTexte.", sources: [] },
    { number: null, title: "Méthodologie", content: "Texte → suite.", sources: [] },
  ],
};

test("couverture : champs du marche, sans reference ni acheteur inventes", () => {
  const withAll = buildMemoryDocument(base);
  assert.deepEqual(
    withAll.cover.rows.map((r) => r.label),
    ["Opération", "Maître d'ouvrage", "Candidat", "Référence", "Version"],
  );
  assert.equal(withAll.cover.rows[0].value, base.subject);

  const missing = buildMemoryDocument({ ...base, reference: null, buyer: "Information non trouvée dans les pièces" });
  const labels = missing.cover.rows.map((r) => r.label);
  assert.ok(!labels.includes("Référence"));
  assert.ok(!labels.includes("Maître d'ouvrage"));
  assert.ok(!missing.footerText.includes("•"));
});

test("aucune mention technique : document de l'entreprise candidate", () => {
  const doc = buildMemoryDocument(base);
  const text = JSON.stringify(doc);
  assert.ok(!/materia/i.test(text));
  assert.equal(doc.cover.kicker, "Couverture Val de Loire");
  assert.ok(doc.headerText.startsWith("Couverture Val de Loire | Mémoire technique"));
});

test("numerotation : chapitres dans l'ordre du plan, sous-titres 1.1, 1.2", () => {
  const doc = buildMemoryDocument(base);
  assert.deepEqual(doc.toc.map((t) => t.number), ["1", "2"]);
  const headings = doc.sections[0].blocks.filter((b) => b.type === "heading");
  assert.deepEqual(headings.map((h) => h.number), ["1.1", "1.2"]);
  assert.equal(sectionNumber("A", 0), "A");
  assert.equal(sectionNumber("03", 2), "3");
});

test("caracteres hors police : transcrits et signales, jamais un carre vide", () => {
  const replaced = new Set();
  assert.equal(normalizeText("Pose → contrôle ≥ 2 ✓", replaced), "Pose -> contrôle >= 2 ");
  assert.equal(normalizeText("Œuvre, cœur, 12 € « ok »", replaced), "Œuvre, cœur, 12 € « ok »");
  assert.ok(replaced.has("→") && replaced.has("✓"));
  const doc = buildMemoryDocument(base);
  assert.deepEqual(doc.replacedCharacters, ["→"]);
});

test("annexes : seulement si des preuves sont citees, sans colonne vide", () => {
  assert.equal(buildMemoryDocument(base).annexes.length, 0);
  const doc = buildMemoryDocument({
    ...base,
    references: [{ name: "École des Halles", client: "Ville de Tours", year: 2023, workType: null, amount: null, location: "Tours" }],
  });
  assert.equal(doc.annexes.length, 1);
  assert.deepEqual(doc.annexes[0].header, ["Chantier", "Maître d'ouvrage", "Année", "Localisation"]);
  assert.equal(buildMemoryDocument({ ...base, includeAnnexes: false, references: [{ name: "x", client: null, year: null, workType: null, amount: null, location: null }] }).annexes.length, 0);
});

test("nom de fichier professionnel, sans accent ni mot coupe", () => {
  const name = exportFileName({ companyName: "Couverture Val de Loire", lot: base.lot, reference: base.reference, extension: "pdf" });
  assert.equal(name, "Memoire_Technique_Couverture-Val-de-Loire_Lot-unique-Couverture-Etancheite_2026-TRV-COUV-03.pdf");
  assert.match(name, /^[A-Za-z0-9_.-]+$/);
  assert.equal(exportFileName({ companyName: "SARL Dupont & Fils", lot: null, reference: null, extension: "docx" }), "Memoire_Technique_SARL-Dupont-Fils.docx");
});

test("largeur des colonnes : jamais plus etroite que le mot le plus long", () => {
  const header = ["Chantier", "Maître d'ouvrage", "Année", "Nature des travaux", "Localisation", "Montant"];
  const rows = [["Réfection de la couverture ardoise - Groupe scolaire Anatole-France", "Ville de Blois", "2024", "Dépose et pose ardoise naturelle, zinguerie zinc", "Blois (41)", "268 000 EUR HT"]];
  const widths = columnWidths(header, rows);
  assert.ok(Math.abs(widths.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  // "Localisation" (12 lettres, en gras) : au moins sa largeur.
  assert.ok(widths[4] * 482 >= 12 * 1.08 * 5.1 + 12 - 0.5, `Localisation : ${(widths[4] * 482).toFixed(1)} pt`);
  assert.ok(widths.every((w) => w < 0.5));
});
