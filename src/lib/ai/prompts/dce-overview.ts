import { z } from "zod";
import { NO_INVENTION_RULES, renderExcerpts, type Excerpt } from "./shared";

/** Valeur retournee lorsqu'une information ne figure pas dans les sources. */
export const NOT_FOUND = "Information non trouvee dans les sources disponibles.";

const Cited = z.object({
  value: z.string().max(600),
  sourceIds: z.array(z.string()),
});

export const DceOverviewSchema = z.object({
  subject: Cited,
  buyer: Cited,
  lot: Cited,
  amount: Cited,
  duration: Cited,
  submissionDate: Cited,
  variants: Cited,
  siteVisit: Cited,

  awardCriteria: z.array(
    z.object({
      label: z.string().max(200),
      /** Ponderation telle qu'ecrite dans le document, par exemple "60 %". */
      weight: z.string().max(60),
      detail: z.string().max(600),
      sourceIds: z.array(z.string()),
    }),
  ),

  vigilancePoints: z.array(
    z.object({
      title: z.string().max(200),
      detail: z.string().max(800),
      severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
      sourceIds: z.array(z.string()),
    }),
  ),
});

export type DceOverview = z.infer<typeof DceOverviewSchema>;

export const OVERVIEW_SYSTEM = `ROLE
Tu es charge d'etudes en entreprise de BTP. Tu prends connaissance d'un dossier
de consultation et tu en restitues les elements structurants a ton dirigeant.

OBJECTIF
Produire la fiche d'identite de la consultation et la liste des points de
vigilance, chaque element etant rattache a sa source.

POINTS DE VIGILANCE
Un point de vigilance est un element du dossier susceptible de couter cher a
l'entreprise s'il passe inapercu. Par exemple : un delai particulierement
court, une penalite elevee, une visite de site obligatoire, une qualification
exigee, une reference imposee, une contrainte de site occupe, une interface
technique lourde, une piece administrative inhabituelle.
- HIGH : peut entrainer le rejet de l'offre ou un risque financier majeur.
- MEDIUM : demande une organisation particuliere.
- LOW : merite d'etre signale sans plus.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Pour chaque champ de la fiche d'identite, si l'information ne figure pas
  dans les extraits, tu mets exactement cette valeur :
  "${NOT_FOUND}"
  et tu laisses "sourceIds" vide.
- Tu ne convertis pas, tu ne calcules pas, tu ne completes pas un montant, une
  duree ou une date. Tu recopies ce qui est ecrit.
- Les ponderations des criteres sont recopiees telles qu'elles figurent au
  document. Si aucune ponderation n'est indiquee, tu ecris "Non precisee".
- Tu ne signales que des points de vigilance reellement fondes sur les
  extraits. Une liste vide est une reponse acceptable.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function overviewPrompt(input: {
  projectName: string;
  excerpts: Excerpt[];
}): string {
  return `Consultation : ${input.projectName}

Extraits du dossier de consultation :

${renderExcerpts(input.excerpts)}

Etablis la fiche d'identite de cette consultation et ses points de vigilance.`;
}
