import { z } from "zod";
import type { CitedSource } from "@/lib/requirements";

/**
 * Criteres de qualification de l'entreprise (regles internes de Go/No-Go).
 *
 * Fixes une fois par l'entreprise, ils sont confrontes a chaque consultation :
 * montant minimum, zone d'intervention, pénalités acceptables, delai de
 * preparation... Un critere eliminatoire non respecte interdit de recommander
 * la candidature ; un critere simple non respecte la place "a arbitrer".
 *
 * Deux natures de criteres :
 * - "text" : formule librement, evalue par le modele a partir des pieces du DCE
 *   et de la base entreprise, avec ses sources ;
 * - "min_prep_days" : delai de preparation minimum, calcule par l'application
 *   a partir de la date limite du dossier, sans interpretation possible.
 */

export const RuleSchema = z.object({
  id: z.string().min(1).max(40),
  kind: z.enum(["text", "min_prep_days"]),
  text: z.string().trim().max(300),
  days: z.number().int().min(1).max(365).optional(),
  blocking: z.boolean(),
});

export type QualificationRule = z.infer<typeof RuleSchema>;

export type RuleStatus = "RESPECTED" | "VIOLATED" | "UNKNOWN";

export type RuleCheck = {
  ruleId: string;
  text: string;
  blocking: boolean;
  status: RuleStatus;
  justification: string;
  sources: CitedSource[];
  /** Verifie par l'application (calcul), et non par le modele. */
  automatic: boolean;
};

export type Recommendation = "GO" | "VIGILANCE" | "NO_GO";

/** Nombre maximal de criteres : au-dela, la grille n'est plus une grille. */
export const MAX_RULES = 15;

/**
 * Lecture tolerante de la colonne jsonb : une entree invalide est ecartee
 * plutot que de faire echouer toute l'evaluation.
 */
export function parseRules(raw: unknown): QualificationRule[] {
  if (!Array.isArray(raw)) return [];
  const rules: QualificationRule[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const parsed = RuleSchema.safeParse(item);
    if (!parsed.success) continue;
    const rule = parsed.data;
    if (seen.has(rule.id)) continue;
    if (rule.kind === "min_prep_days" && !rule.days) continue;
    if (rule.kind === "text" && rule.text.length === 0) continue;
    seen.add(rule.id);
    rules.push(rule);
    if (rules.length >= MAX_RULES) break;
  }
  return rules;
}

/** Formulation lisible d'un critere, identique partout ou il s'affiche. */
export function ruleLabel(rule: QualificationRule): string {
  if (rule.kind === "min_prep_days") {
    return `Au moins ${rule.days} jour${(rule.days ?? 0) > 1 ? "s" : ""} pour préparer l'offre`;
  }
  return rule.text;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Delai de preparation : nombre de jours entre la date d'evaluation et la date
 * limite de remise. Sans date limite, on ne conclut pas.
 */
export function checkPrepDays(
  rule: QualificationRule,
  deadline: string | null,
  now: Date = new Date(),
): RuleCheck {
  const base = {
    ruleId: rule.id,
    text: ruleLabel(rule),
    blocking: rule.blocking,
    sources: [],
    automatic: true,
  };

  const due = deadline ? new Date(deadline) : null;
  if (!due || Number.isNaN(due.getTime())) {
    return {
      ...base,
      status: "UNKNOWN",
      justification:
        "Aucune date limite de remise n'est renseignée sur le dossier : le délai de préparation ne peut pas être calculé.",
    };
  }

  // Meme decompte que "jours restants" dans l'en-tete du dossier (daysUntil) :
  // depuis le debut de la journee, arrondi au jour superieur. Sinon l'ecran
  // afficherait 28 jours et le critere en compterait 27.
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - startOfDay.getTime()) / DAY_MS);
  const needed = rule.days ?? 0;

  if (days < 0) {
    return {
      ...base,
      status: "VIOLATED",
      justification: "La date limite de remise est dépassée.",
    };
  }

  return {
    ...base,
    status: days >= needed ? "RESPECTED" : "VIOLATED",
    justification: `Il reste ${days} jour${days > 1 ? "s" : ""} avant la date limite de remise, pour ${needed} requis.`,
  };
}

/**
 * Effet des criteres sur la recommandation.
 *
 * - un critere eliminatoire non respecte : NO-GO ;
 * - un critere eliminatoire impossible a verifier, ou un critere simple non
 *   respecte : au mieux "sous reserve", pour que le point soit tranche par
 *   quelqu'un avant de s'engager.
 *
 * La note ne change pas : elle mesure l'opportunite, les criteres mesurent la
 * conformite a la politique de l'entreprise. Les deux restent lisibles.
 */
export function applyRules(
  recommendation: Recommendation,
  checks: RuleCheck[],
): { recommendation: Recommendation; decisive: RuleCheck[] } {
  const eliminating = checks.filter((c) => c.blocking && c.status === "VIOLATED");
  if (eliminating.length > 0) {
    return { recommendation: "NO_GO", decisive: eliminating };
  }

  const reserving = checks.filter(
    (c) =>
      (c.blocking && c.status === "UNKNOWN") ||
      (!c.blocking && c.status === "VIOLATED"),
  );
  if (reserving.length > 0 && recommendation === "GO") {
    return { recommendation: "VIGILANCE", decisive: reserving };
  }

  return { recommendation, decisive: [] };
}

/**
 * Exemples proposes a l'ajout, a adapter par l'entreprise. Ce sont des
 * formulations types, pas des valeurs presumees : chaque chiffre est a revoir.
 */
export function rulePresets(interventionArea: string | null): Array<
  Omit<QualificationRule, "id">
> {
  return [
    {
      kind: "text",
      text: "Montant estimé du marché d'au moins 50 000 € HT",
      blocking: false,
    },
    {
      kind: "text",
      text: interventionArea
        ? `Chantier situé dans notre zone d'intervention : ${interventionArea}`
        : "Chantier situé dans notre zone d'intervention",
      blocking: true,
    },
    {
      kind: "text",
      text: "Qualifications et certifications exigées toutes détenues par l'entreprise",
      blocking: true,
    },
    {
      kind: "text",
      text: "Pénalités de retard plafonnées, ou inférieures à 1 000 € par jour",
      blocking: false,
    },
    {
      kind: "text",
      text: "Pas de garantie à première demande exigée",
      blocking: false,
    },
    { kind: "min_prep_days", text: "", days: 10, blocking: false },
  ];
}
