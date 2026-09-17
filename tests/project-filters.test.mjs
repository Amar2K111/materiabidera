// Recherche et tri de la liste des dossiers.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FILTER,
  PROJECT_GROUPS,
  applyProjectFilter,
} from "../src/lib/project-filters.ts";
import { PROJECT_STATUS } from "../src/lib/projects.ts";

const project = (overrides = {}) => ({
  name: "Réhabilitation groupe scolaire",
  buyer: "Ville de Lyon",
  reference: "2026-TR-014",
  lot: "Lot 3 — Menuiseries",
  status: "DRAFT",
  deadline: "2026-11-02",
  created_at: "2026-09-01T10:00:00Z",
  ...overrides,
});

test("chaque statut appartient a un groupe de filtres", () => {
  const covered = PROJECT_GROUPS.flatMap((g) => g.statuses ?? []);
  for (const status of Object.keys(PROJECT_STATUS)) {
    assert.ok(
      covered.includes(status),
      `le statut ${status} n'est visible dans aucun filtre`,
    );
  }
});

test("la recherche porte sur le marche, l'acheteur, la reference et le lot", () => {
  const list = [
    project({ name: "Réhabilitation groupe scolaire" }),
    project({ name: "Extension EHPAD", buyer: "CH de Valence" }),
    project({ name: "Voirie centre-bourg", reference: "2026-VRD-009" }),
    project({ name: "Gymnase", lot: "Lot 7 — Charpente" }),
  ];

  const only = (query) =>
    applyProjectFilter(list, { ...DEFAULT_FILTER, query }).map((p) => p.name);

  assert.deepEqual(only("valence"), ["Extension EHPAD"]);
  assert.deepEqual(only("VRD"), ["Voirie centre-bourg"]);
  assert.deepEqual(only("charpente"), ["Gymnase"]);
  assert.equal(only("").length, 4);
  assert.deepEqual(only("introuvable"), []);
});

test("le filtre d'etat ne retient que les statuts du groupe", () => {
  const list = [
    project({ name: "A", status: "DRAFT" }),
    project({ name: "B", status: "WRITING" }),
    project({ name: "C", status: "READY" }),
    project({ name: "D", status: "NO_GO" }),
  ];

  const group = (key) =>
    applyProjectFilter(list, { ...DEFAULT_FILTER, group: key }).map((p) => p.name);

  assert.deepEqual(group("active"), ["A"]);
  assert.deepEqual(group("decided"), ["B"]);
  assert.deepEqual(group("ready"), ["C"]);
  assert.deepEqual(group("archived"), ["D"]);
  assert.equal(group("all").length, 4);
});

test("un dossier sans date limite ne remonte pas en tete du tri par echeance", () => {
  const list = [
    project({ name: "sans date", deadline: null }),
    project({ name: "dans un mois", deadline: "2026-10-15" }),
    project({ name: "demain", deadline: "2026-09-18" }),
  ];

  assert.deepEqual(
    applyProjectFilter(list, { ...DEFAULT_FILTER, sort: "deadline" }).map(
      (p) => p.name,
    ),
    ["demain", "dans un mois", "sans date"],
  );
});

test("les autres tris restent previsibles", () => {
  const list = [
    project({ name: "Zone artisanale", created_at: "2026-09-10T00:00:00Z" }),
    project({ name: "École Jules Ferry", created_at: "2026-09-12T00:00:00Z" }),
    project({ name: "Atelier municipal", created_at: "2026-09-11T00:00:00Z" }),
  ];

  assert.deepEqual(
    applyProjectFilter(list, { ...DEFAULT_FILTER, sort: "recent" }).map(
      (p) => p.name,
    ),
    ["École Jules Ferry", "Atelier municipal", "Zone artisanale"],
  );

  assert.deepEqual(
    applyProjectFilter(list, { ...DEFAULT_FILTER, sort: "name" }).map(
      (p) => p.name,
    ),
    ["Atelier municipal", "École Jules Ferry", "Zone artisanale"],
  );
});

test("le filtrage ne modifie pas la liste d'origine", () => {
  const list = [
    project({ name: "B", deadline: "2026-12-01" }),
    project({ name: "A", deadline: "2026-10-01" }),
  ];
  const before = list.map((p) => p.name);
  applyProjectFilter(list, { ...DEFAULT_FILTER, sort: "deadline" });
  assert.deepEqual(list.map((p) => p.name), before);
});
