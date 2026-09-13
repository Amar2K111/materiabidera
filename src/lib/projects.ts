export type ProjectStatus =
  | "DRAFT"
  | "ANALYZING"
  | "ANALYZED"
  | "GO"
  | "NO_GO"
  | "STRATEGY_READY"
  | "WRITING"
  | "REVIEW"
  | "READY"
  | "EXPORTED";

type Tone = "neutral" | "brand" | "ok" | "warn" | "risk";

export const PROJECT_STATUS: Record<
  ProjectStatus,
  { label: string; tone: Tone }
> = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  ANALYZING: { label: "Analyse en cours", tone: "brand" },
  ANALYZED: { label: "Analyse terminée", tone: "brand" },
  GO: { label: "Go", tone: "ok" },
  NO_GO: { label: "No-Go", tone: "risk" },
  STRATEGY_READY: { label: "Stratégie prête", tone: "brand" },
  WRITING: { label: "Rédaction", tone: "brand" },
  REVIEW: { label: "Contrôle", tone: "warn" },
  READY: { label: "Prêt à déposer", tone: "ok" },
  EXPORTED: { label: "Exporté", tone: "ok" },
};

/**
 * Prochaine action utile pour un dossier, selon son avancement (section 35).
 * Le segment designe la page du dossier ou cette action se realise.
 */
export const NEXT_STEP: Record<
  ProjectStatus,
  { label: string; segment: string }
> = {
  DRAFT: { label: "Analyser le DCE", segment: "analyse" },
  ANALYZING: { label: "Suivre l'analyse", segment: "analyse" },
  ANALYZED: { label: "Évaluer l'opportunité", segment: "go-no-go" },
  GO: { label: "Construire la stratégie", segment: "strategie" },
  NO_GO: { label: "Revoir la décision", segment: "go-no-go" },
  STRATEGY_READY: { label: "Rédiger le mémoire", segment: "memoire" },
  WRITING: { label: "Terminer la rédaction", segment: "memoire" },
  REVIEW: { label: "Traiter le contrôle qualité", segment: "controle" },
  READY: { label: "Exporter la réponse", segment: "export" },
  EXPORTED: { label: "Relire la réponse exportée", segment: "export" },
};

/** Jours restants avant la date limite. Negatif si la date est passee. */
export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  if (Number.isNaN(end)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.ceil((end - startOfToday.getTime()) / 86_400_000);
}

/** Libelle d'echeance, avec le ton a appliquer selon l'urgence. */
export function deadlineLabel(deadline: string | null): {
  text: string;
  tone: Tone;
} {
  const days = daysUntil(deadline);
  if (days === null) return { text: "Sans date limite", tone: "neutral" };
  if (days < 0) return { text: "Date limite dépassée", tone: "risk" };
  if (days === 0) return { text: "Remise aujourd'hui", tone: "risk" };
  if (days === 1) return { text: "1 jour restant", tone: "risk" };
  if (days <= 7) return { text: `${days} jours restants`, tone: "warn" };
  return { text: `${days} jours restants`, tone: "neutral" };
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string | null): string {
  if (!value) return "Non renseignée";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Non renseignée" : DATE_FORMAT.format(d);
}

const DATETIME_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : DATETIME_FORMAT.format(d);
}
