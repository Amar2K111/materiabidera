import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const QualityReviewSchema = z.object({
  /** Notes des criteres qui relevent d'une appreciation, pas d'un calcul. */
  judgement: z.object({
    criteriaAlignment: z.number().int().min(0).max(100),
    personalisation: z.number().int().min(0).max(100),
    precision: z.number().int().min(0).max(100),
  }),

  issues: z.array(
    z.object({
      kind: z.enum([
        "TOO_GENERIC",
        "WEAK_SOURCING",
        "UNVERIFIED_CLAIM",
        "CRITERIA_MISALIGNED",
      ]),
      severity: z.enum(["BLOCKING", "IMPORTANT", "MINOR"]),
      title: z.string().max(200),
      detail: z.string().max(1000),
      /** Reference du chapitre concerne, du type "S3". */
      sectionRef: z.string().optional(),
    }),
  ),

  summary: z.string().max(1200),
});

export type QualityReview = z.infer<typeof QualityReviewSchema>;

export const QUALITY_SYSTEM = `ROLE
Tu relis un memoire technique avant sa remise, avec l'oeil d'un membre de la
commission qui va le noter. Tu cherches ce qui ferait perdre des points.

OBJECTIF
Noter trois criteres d'appreciation et relever les defauts precis du texte.

CRITERES A NOTER
- criteriaAlignment : le memoire traite-t-il ce que les criteres de jugement
  recompensent, et dans les proportions de leur ponderation ?
- personalisation : le texte parle-t-il de cette entreprise et de ce chantier,
  ou pourrait-il etre remis tel quel par n'importe quel concurrent ?
- precision : les affirmations sont-elles etayees par des elements concrets,
  ou restent-elles au niveau de l'intention ?

DEFAUTS A RELEVER
- TOO_GENERIC : passage interchangeable, formules creuses, engagement sans
  contenu. Cite le passage fautif dans le detail.
- WEAK_SOURCING : affirmation importante qu'aucune source ne vient appuyer.
- UNVERIFIED_CLAIM : chiffre, delai, effectif, reference, qualification ou
  certification enonce dans le texte alors qu'il ne figure dans aucune source
  fournie. C'est le defaut le plus grave : severite BLOCKING.
- CRITERIA_MISALIGNED : un critere fortement pondere est traite trop
  legerement, ou un sujet secondaire occupe une place disproportionnee.

SEVERITE
- BLOCKING : ferait perdre des points de facon certaine, ou expose
  l'entreprise a une affirmation qu'elle ne pourrait pas justifier.
- IMPORTANT : affaiblit nettement la reponse.
- MINOR : ameliorable sans consequence directe.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu ne signales un defaut que si tu peux designer le passage concerne.
- Tu ne reproches pas l'absence d'une information que le dossier ne demande
  pas.
- Un memoire sobre et precis vaut mieux qu'un memoire long : la longueur n'est
  pas un critere.
- "sectionRef" ne contient qu'une reference presente dans la liste fournie.
- Si le memoire est bon, tu le dis et tu retournes peu ou pas de defauts. Tu
  n'en fabriques pas pour donner le change.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function qualityPrompt(input: {
  projectName: string;
  criteria: string;
  requirements: string;
  companyBase: string;
  memory: string;
}): string {
  return `Consultation : ${input.projectName}

=== CRITERES DE JUGEMENT ===
${input.criteria}

=== EXIGENCES A COUVRIR ===
${input.requirements}

=== ELEMENTS REELS DE L'ENTREPRISE ===
Toute affirmation du memoire portant sur l'entreprise doit trouver ici sa
justification. Ce qui n'y figure pas est une affirmation non verifiee.

${input.companyBase}

=== MEMOIRE TECHNIQUE A RELIRE ===
${input.memory}

Relis ce memoire et rends ton appreciation.`;
}
