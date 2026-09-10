import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

/** Facteurs imposes. Le modele ne peut ni en ajouter, ni en retirer. */
export const GO_FACTORS = [
  {
    key: "technical_fit",
    label: "Adequation technique",
    guidance:
      "Les travaux demandes correspondent-ils a ce que l'entreprise sait faire, au vu de ses references et de son activite ?",
  },
  {
    key: "capacity",
    label: "Capacites disponibles",
    guidance:
      "L'entreprise dispose-t-elle des moyens humains et materiels exiges par la consultation ?",
  },
  {
    key: "experience",
    label: "Experience comparable",
    guidance:
      "L'entreprise possede-t-elle des references reellement comparables a ce marche ?",
  },
  {
    key: "criteria",
    label: "Criteres gagnables",
    guidance:
      "Les criteres de jugement avantagent-ils l'entreprise, ou la desavantagent-ils ?",
  },
  {
    key: "schedule",
    label: "Delai",
    guidance:
      "Le delai de remise et le delai d'execution sont-ils tenables ?",
  },
  {
    key: "contract_risk",
    label: "Risques contractuels",
    guidance:
      "Penalites, garanties, retenues et clauses de resiliation font-ils peser un risque particulier ?",
  },
  {
    key: "administrative",
    label: "Exigences administratives",
    guidance:
      "Les qualifications, certifications et pieces exigees sont-elles detenues par l'entreprise ?",
  },
  {
    key: "site",
    label: "Contraintes de chantier",
    guidance:
      "Site occupe, coactivite, acces, horaires, nuisances : ces contraintes sont-elles maitrisables ?",
  },
] as const;

const FACTOR_KEYS = GO_FACTORS.map((f) => f.key) as [string, ...string[]];

export const GoNoGoSchema = z.object({
  factors: z.array(
    z.object({
      key: z.enum(FACTOR_KEYS),
      score: z.number().int().min(0).max(100),
      justification: z.string().min(10).max(800),
      confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
      /** Identifiants d'extraits du DCE et de fiches de la base entreprise. */
      sourceIds: z.array(z.string()),
    }),
  ),
  summary: z.string().min(20).max(1200),
});

export type GoNoGoResult = z.infer<typeof GoNoGoSchema>;

export const GO_NO_GO_SYSTEM = `ROLE
Tu es directeur d'une entreprise de BTP. Tu evalues s'il est pertinent de
repondre a une consultation, au vu de ce que le dossier exige et de ce que
l'entreprise sait reellement faire.

OBJECTIF
Noter huit facteurs, chacun de 0 a 100, et justifier chaque note.

FACTEURS A NOTER
${GO_FACTORS.map((f) => `- ${f.key} (${f.label}) : ${f.guidance}`).join("\n")}

ECHELLE
- 80 a 100 : element clairement favorable, etaye par les sources.
- 55 a 79 : element plutot favorable, avec des reserves.
- 35 a 54 : element incertain ou partiellement couvert.
- 0 a 34 : element defavorable ou non couvert par l'entreprise.

NIVEAU DE CONFIANCE
- HIGH : les sources traitent directement du sujet.
- MEDIUM : les sources sont partielles.
- LOW : les sources ne permettent pas de se prononcer. Dans ce cas, la note
  reflete l'incertitude et la justification le dit explicitement.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu ne prets a l'entreprise aucune reference, qualification, certification,
  personne ou machine qui ne figure pas dans sa base. Son absence est en
  elle-meme une information : tu la signales.
- Une base entreprise vide ou incomplete conduit a des notes basses et a une
  confiance LOW sur les facteurs concernes. Tu ne compenses pas en supposant
  que l'entreprise dispose de ce qui n'est pas renseigne.
- Chaque justification cite les identifiants sur lesquels elle s'appuie. Si
  aucun ne s'applique, tu laisses "sourceIds" vide et tu mets une confiance
  LOW.
- Le resume expose la decision en quelques phrases : ce qui joue en faveur de
  la candidature, ce qui joue contre, et ce qu'il faudrait verifier.
- Tu ne calcules aucun score global : c'est l'application qui s'en charge.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function goNoGoPrompt(input: {
  projectName: string;
  deadline: string;
  dceSummary: string;
  requirements: string;
  companyBase: string;
}): string {
  return `Consultation : ${input.projectName}
Date limite de remise : ${input.deadline}

=== ANALYSE DU DOSSIER DE CONSULTATION ===
${input.dceSummary}

=== EXIGENCES RELEVEES ===
${input.requirements}

=== BASE DE L'ENTREPRISE ===
${input.companyBase}

Evalue les huit facteurs et redige le resume de decision.`;
}
