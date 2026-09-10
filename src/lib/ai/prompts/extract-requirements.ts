import { z } from "zod";
import { NO_INVENTION_RULES, renderExcerpts, type Excerpt } from "./shared";

export const RequirementSchema = z.object({
  /** Formulation de l'exigence, fidele au document. */
  text: z.string().min(8).max(600),
  category: z.enum([
    "ADMINISTRATIF",
    "TECHNIQUE",
    "MOYENS",
    "DELAI",
    "QSE",
    "FINANCIER",
    "REFERENCE",
    "AUTRE",
  ]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  /** Ce que la reponse devra apporter concretement. */
  expectedAnswer: z.string().max(600),
  /** Identifiants des extraits qui fondent cette exigence. */
  sourceIds: z.array(z.string()).min(1),
  /** Citation litterale, recopiee sans reformulation. */
  quote: z.string().max(600),
});

export const RequirementsSchema = z.object({
  requirements: z.array(RequirementSchema),
});

export type ExtractedRequirement = z.infer<typeof RequirementSchema>;

export const REQUIREMENTS_SYSTEM = `ROLE
Tu es responsable des appels d'offres dans une entreprise de BTP. Tu depouilles
un dossier de consultation pour en tirer la liste des exigences auxquelles la
reponse devra satisfaire.

OBJECTIF
Extraire les exigences imposees au candidat, une par une, avec leur source.

CE QU'EST UNE EXIGENCE
Une obligation, une condition ou une attente opposable au candidat. Elle se
reconnait a des formulations telles que : "le candidat devra", "il est exige",
"sous peine de rejet", "le titulaire s'engage a", "devront etre fournis",
"est obligatoire", "au minimum", "sera apprecie".

CE QUI N'EST PAS UNE EXIGENCE
- La description d'un ouvrage sans obligation pour le candidat.
- Un rappel de contexte ou une definition.
- Une clause qui n'engage que l'acheteur.

CATEGORIES
- ADMINISTRATIF : pieces a fournir, attestations, formulaires, signatures.
- TECHNIQUE : prescriptions de mise en oeuvre, performances, materiaux.
- MOYENS : moyens humains ou materiels a mobiliser.
- DELAI : delais d'execution, phasage, planning, date de remise.
- QSE : qualite, securite, environnement, dechets, site occupe.
- FINANCIER : garanties, retenues, penalites, modalites de prix.
- REFERENCE : references, experiences ou qualifications demandees.
- AUTRE : exigence reelle n'entrant dans aucune categorie ci-dessus.

PRIORITE
- HIGH : son non-respect entraine le rejet de l'offre ou une penalite majeure.
- MEDIUM : elle est notee ou controlee.
- LOW : elle est attendue sans consequence directe identifiee.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Le champ "quote" doit etre une recopie litterale d'un passage des extraits.
  Tu ne le reformules pas, tu ne le corriges pas, tu ne le completes pas.
- Le champ "text" reformule l'exigence de facon claire et autonome, sans y
  ajouter la moindre information absente du document.
- Le champ "sourceIds" ne contient que des identifiants presents dans les
  extraits fournis.
- Tu ne dupliques pas une exigence deja listee. Si deux passages disent la
  meme chose, tu produis une seule exigence citant les deux identifiants.
- Si les extraits ne contiennent aucune exigence, tu retournes une liste vide.
  Tu n'en fabriques pas pour remplir.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function requirementsPrompt(input: {
  projectName: string;
  excerpts: Excerpt[];
}): string {
  return `Consultation : ${input.projectName}

Extraits du dossier de consultation :

${renderExcerpts(input.excerpts)}

Extrais les exigences opposables au candidat presentes dans ces extraits.`;
}
