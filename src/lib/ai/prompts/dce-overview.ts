import { z } from "zod";
import { NO_INVENTION_RULES, renderExcerpts, type Excerpt } from "./shared";

/** Valeur retournee lorsqu'une information ne figure pas dans les sources. */
export const NOT_FOUND = "Information non trouvée dans les sources disponibles.";

const Cited = z.object({
  value: z.string().max(600),
  sourceIds: z.array(z.string()),
});

const Subcriterion = z.object({
  label: z.string().max(200),
  /** Ponderation telle qu'ecrite, ou "Non precisee". */
  weight: z.string().max(60),
  /** Valeur numerique en points ou en pourcentage, uniquement si ecrite. */
  weightValue: z.number().min(0).max(1000).nullable(),
  detail: z.string().max(600),
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
      /** Valeur numerique, uniquement si elle est ecrite dans le document. */
      weightValue: z.number().min(0).max(1000).nullable(),
      detail: z.string().max(600),
      /** Elements que le document dit explicitement evaluer pour ce critere. */
      expectedElements: z.array(z.string().max(200)),
      subcriteria: z.array(Subcriterion),
      sourceIds: z.array(z.string()),
    }),
  ),

  responseFormat: z.object({
    /** Vrai si le dossier impose un cadre de reponse ou un plan de memoire. */
    imposedFramework: z.boolean(),
    /** Intitules des parties imposees, dans l'ordre, s'il y en a. */
    structure: z.array(z.string().max(200)),
    /** Limite de pages ou de volume, telle qu'ecrite, sinon null. */
    pageLimit: z.string().max(200).nullable(),
    /** Contraintes de forme ecrites : format, police, pieces a joindre. */
    constraints: z.array(z.string().max(300)),
    sourceIds: z.array(z.string()),
  }),

  /** Contraintes d'execution propres a ce marche, relevees dans le dossier. */
  marketConstraints: z.array(
    z.object({
      type: z.enum([
        "SITE_OCCUPE",
        "ACCES",
        "COACTIVITE",
        "HORAIRES",
        "NUISANCES",
        "SECURITE",
        "ENVIRONNEMENT",
        "DECHETS",
        "PLANNING",
        "PHASAGE",
        "INTERFACES",
        "AUTRE",
      ]),
      label: z.string().max(200),
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
Tu es charge d'etudes en entreprise de BTP, expert des marches publics. Tu
prends connaissance d'un dossier de consultation et tu en restitues les
elements structurants a ton dirigeant.

OBJECTIF
Produire la fiche d'identite de la consultation : criteres et sous-criteres de
jugement, cadre de reponse impose, contraintes d'execution et points de
vigilance. Chaque element est rattache a sa source.

CRITERES ET SOUS-CRITERES
- Tu cherches dans le reglement de consultation, et dans toute piece qui en
  parle, les criteres de jugement, leurs sous-criteres, leurs ponderations,
  coefficients ou baremes, et les elements que l'acheteur dit evaluer.
- "weight" recopie la ponderation telle qu'ecrite ("50 %", "20 points"). Si
  aucune n'est ecrite, "weight" vaut "Non precisee" et "weightValue" vaut null.
- "weightValue" n'est rempli que si le nombre figure dans le document. Tu ne
  calcules jamais une ponderation manquante, meme par soustraction.
- "expectedElements" liste ce que le document dit explicitement apprecier pour
  ce critere (par exemple "qualite de la methodologie", "moyens humains"). Liste
  vide si le document ne detaille rien.

CADRE DE REPONSE
- "imposedFramework" est vrai seulement si le dossier impose un cadre de
  memoire, un plan ou une trame. Une liste de themes "a traiter
  obligatoirement" dans le memoire compte comme une structure imposee : tu la
  recopies dans "structure".
- "pageLimit" recopie une limite de pages ou de volume ecrite, sinon null.

CONTRAINTES D'EXECUTION
Une contrainte est une condition du chantier qui pese sur l'organisation :
site occupe, acces, coactivite, horaires, nuisances, securite, environnement,
dechets, planning, phasage, interfaces. Tu ne releves que celles ecrites.

POINTS DE VIGILANCE
Un point de vigilance est un element du dossier susceptible de couter cher a
l'entreprise s'il passe inapercu : delai court, penalite elevee, visite
obligatoire, qualification exigee, reference imposee, piece inhabituelle.
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
- Des listes vides sont des reponses acceptables. Tu n'en fabriques pas.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function overviewPrompt(input: {
  projectName: string;
  excerpts: Excerpt[];
}): string {
  return `Consultation : ${input.projectName}

Extraits du dossier de consultation :

${renderExcerpts(input.excerpts)}

Etablis la fiche d'identite de cette consultation.`;
}
