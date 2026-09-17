import type { ProjectProgress } from "@/lib/data/projects";
import type { ProjectStatus } from "@/lib/projects";

/**
 * Recherche, filtre et tri de la liste des dossiers (section 6).
 *
 * Une entreprise qui repond regulierement accumule vite plusieurs dizaines de
 * consultations. Le tri se fait sur les dossiers deja charges : aucun
 * aller-retour serveur, donc aucune attente entre deux frappes.
 */
export type GroupKey = "all" | "active" | "decided" | "ready" | "archived";
export type SortKey = "deadline" | "recent" | "name";

export type ProjectFilter = {
  query: string;
  group: GroupKey;
  sort: SortKey;
};

export const DEFAULT_FILTER: ProjectFilter = {
  query: "",
  group: "all",
  sort: "deadline",
};

/**
 * Groupes d'etats, nommes par ce que l'utilisateur doit en faire et non par
 * l'etat technique du dossier. Ensemble, ils couvrent tous les statuts.
 */
export const PROJECT_GROUPS: Array<{
  key: GroupKey;
  label: string;
  statuses?: ProjectStatus[];
}> = [
  { key: "all", label: "Tous" },
  {
    key: "active",
    label: "À traiter",
    statuses: ["DRAFT", "ANALYZING", "ANALYZED"],
  },
  {
    key: "decided",
    label: "En rédaction",
    statuses: ["GO", "STRATEGY_READY", "WRITING", "REVIEW"],
  },
  { key: "ready", label: "Prêts à déposer", statuses: ["READY", "EXPORTED"] },
  { key: "archived", label: "Sans suite", statuses: ["NO_GO"] },
];

export function applyProjectFilter<
  T extends Pick<
    ProjectProgress,
    "name" | "buyer" | "reference" | "lot" | "status" | "deadline" | "created_at"
  >,
>(projects: T[], { query, group, sort }: ProjectFilter): T[] {
  const needle = query.trim().toLowerCase();
  const statuses = PROJECT_GROUPS.find((g) => g.key === group)?.statuses;

  const kept = projects.filter((p) => {
    if (statuses && !statuses.includes(p.status)) return false;
    if (!needle) return true;
    // On cherche dans ce que l'utilisateur a sous les yeux : intitule du
    // marche, acheteur, reference de consultation, lot.
    return [p.name, p.buyer, p.reference, p.lot]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(needle));
  });

  return kept.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "fr");
    if (sort === "recent")
      return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    // Par date limite : un dossier sans date passe en dernier, sinon il
    // occuperait le haut de liste sans qu'aucune echeance ne le justifie.
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });
}
