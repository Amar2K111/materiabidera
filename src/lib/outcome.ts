import type { ProjectStatus } from "@/lib/projects";

/**
 * Resultat d'une consultation, saisi par l'entreprise apres le depot.
 *
 * C'est la seule mesure qui dise si la demarche paie : sans elle, un tableau de
 * bord compte des dossiers traites, pas des marches gagnes.
 */
export type ProjectOutcome = "WON" | "LOST" | "CANCELLED" | "NOT_SUBMITTED";

export const OUTCOME_LABELS: Record<
  ProjectOutcome,
  { label: string; hint: string; tone: "ok" | "risk" | "neutral" }
> = {
  WON: { label: "Gagné", hint: "Marché attribué à votre entreprise", tone: "ok" },
  LOST: { label: "Perdu", hint: "Attribué à un concurrent", tone: "risk" },
  CANCELLED: {
    label: "Sans suite",
    hint: "Procédure infructueuse ou abandonnée par l'acheteur",
    tone: "neutral",
  },
  NOT_SUBMITTED: {
    label: "Non déposé",
    hint: "L'offre n'a finalement pas été remise",
    tone: "neutral",
  },
};

export const OUTCOMES = Object.keys(OUTCOME_LABELS) as ProjectOutcome[];

export type OutcomeRow = {
  status: ProjectStatus;
  outcome: ProjectOutcome | null;
  is_demo: boolean;
  deadline: string | null;
};

export type Pipeline = {
  /** Dossiers en preparation : ni deposes, ni abandonnes, ni clos. */
  inProgress: number;
  /** Offres deposees dont le resultat n'est pas encore connu. */
  awaiting: number;
  won: number;
  lost: number;
  /**
   * Taux de reussite sur les consultations dont le resultat est connu (gagnees
   * et perdues). Null tant qu'aucune n'est tranchee : afficher 0 % laisserait
   * croire a une mesure.
   */
  winRate: number | null;
};

/**
 * Chiffres du pipeline. Les dossiers exemples sont exclus : une donnee de
 * demonstration ne doit jamais se meler aux chiffres reels de l'entreprise.
 */
export function computePipeline(rows: OutcomeRow[]): Pipeline {
  const real = rows.filter((r) => !r.is_demo);

  const won = real.filter((r) => r.outcome === "WON").length;
  const lost = real.filter((r) => r.outcome === "LOST").length;
  const awaiting = real.filter(
    (r) => !r.outcome && (r.status === "EXPORTED" || r.status === "READY"),
  ).length;
  const inProgress = real.filter(
    (r) =>
      !r.outcome &&
      r.status !== "EXPORTED" &&
      r.status !== "READY" &&
      r.status !== "NO_GO",
  ).length;

  const decided = won + lost;
  return {
    inProgress,
    awaiting,
    won,
    lost,
    winRate: decided === 0 ? null : Math.round((won / decided) * 100),
  };
}

/**
 * Le resultat devient pertinent une fois l'offre prete ou la date limite
 * passee. Avant, proposer "Gagne / Perdu" n'aurait pas de sens.
 */
export function outcomeRelevant(
  row: Pick<OutcomeRow, "status" | "outcome" | "deadline">,
  now: Date = new Date(),
): boolean {
  if (row.outcome) return true;
  if (row.status === "EXPORTED" || row.status === "READY") return true;
  if (!row.deadline) return false;
  const due = new Date(row.deadline).getTime();
  return !Number.isNaN(due) && due < now.getTime();
}
