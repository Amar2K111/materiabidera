import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const SectionDraftSchema = z.object({
  /** Texte du chapitre, en paragraphes separes par une ligne vide. */
  content: z.string().min(80),
  /** Identifiants des elements reellement utilises pour rediger. */
  sourceIds: z.array(z.string()),
  /**
   * Points que l'entreprise doit completer elle-meme, faute d'information
   * disponible. Vide si tout etait couvert.
   */
  toConfirm: z.array(z.string().max(300)),
});

export type SectionDraft = z.infer<typeof SectionDraftSchema>;

/** Retouches proposees a l'utilisateur sur un chapitre deja redige. */
export type SectionAction =
  | "generate"
  | "improve"
  | "shorten"
  | "expand"
  | "concrete";

export const SECTION_ACTION_LABELS: Record<SectionAction, string> = {
  generate: "Generer",
  improve: "Ameliorer",
  shorten: "Raccourcir",
  expand: "Developper",
  concrete: "Rendre plus concret",
};

const ACTION_INSTRUCTIONS: Record<SectionAction, string> = {
  generate: "Redige ce chapitre.",
  improve:
    "Reprends le texte existant pour le rendre plus clair et mieux structure, a longueur comparable. Tu ne changes aucun fait et tu n'en ajoutes aucun.",
  shorten:
    "Raccourcis le texte existant d'environ un tiers en supprimant les redites et les formules creuses. Tu conserves tous les faits et toutes les sources.",
  expand:
    "Developpe le texte existant en approfondissant ce qui est deja etaye par les sources. Tu n'introduis aucun fait nouveau : s'il n'y a rien a ajouter d'appuye, tu le signales dans toConfirm plutot que de meubler.",
  concrete:
    "Rends le texte plus concret en remplacant les affirmations generales par les elements precis presents dans les sources : references nommees, moyens identifies, procedures existantes. Tu n'inventes aucun detail.",
};

export const SECTION_SYSTEM = `ROLE
Tu rediges un chapitre de memoire technique pour une entreprise de BTP qui
repond a un appel d'offres. Tu ecris a la premiere personne du pluriel, au nom
de l'entreprise.

OBJECTIF
Produire un texte qui reponde precisement a ce que l'acheteur attend de ce
chapitre, en s'appuyant uniquement sur les elements fournis.

CE QUI DISTINGUE UN BON CHAPITRE
- Il traite les exigences qui lui sont rattachees, explicitement.
- Il cite des elements reels de l'entreprise : chantiers nommes, moyens
  identifies, procedures existantes.
- Il repond aux particularites du marche plutot qu'a un chantier generique.
- Il se lit sans effort par un jury qui depouille des dizaines d'offres.

CE QUI DISQUALIFIE UN CHAPITRE
- Les formules creuses : "nous mettrons tout en oeuvre", "une equipe rodee",
  "un savoir-faire reconnu", "dans le respect des regles de l'art", employees
  sans rien de precis derriere.
- Les chiffres, delais, effectifs ou references qui ne figurent nulle part dans
  les sources.
- Le recopiage du CCTP en guise de methodologie.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu n'ecris aucun chiffre, nom de client, nom de chantier, effectif, materiel,
  delai, qualification ou certification qui ne figure pas dans les sources.
- Lorsqu'il te manque une information pour traiter un point attendu, tu ne la
  remplaces pas par une formulation vague. Tu ecris le reste du chapitre, et tu
  listes ce point dans "toConfirm" pour que l'entreprise le complete.
- "sourceIds" ne contient que les identifiants effectivement utilises.
- Tu ecris en francais professionnel, en paragraphes. Pas de titre, pas de
  liste a puces sauf si le contenu l'exige vraiment. Le titre du chapitre est
  ajoute par l'application.
- Tu ne commences pas par annoncer ce que tu vas dire.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function sectionPrompt(input: {
  projectName: string;
  sectionNumber: string;
  sectionTitle: string;
  brief: string;
  wordTarget: number;
  requirements: string;
  strategy: string;
  dceExcerpts: string;
  companyBase: string;
  action: SectionAction;
  currentContent?: string;
}): string {
  const blocks = [
    `Consultation : ${input.projectName}`,
    "",
    `=== CHAPITRE A REDIGER ===`,
    `${input.sectionNumber} ${input.sectionTitle}`,
    `Volume indicatif : environ ${input.wordTarget} mots.`,
    "",
    `Ce que ce chapitre doit demontrer :`,
    input.brief,
    "",
    `=== EXIGENCES RATTACHEES A CE CHAPITRE ===`,
    input.requirements || "Aucune exigence n'est explicitement rattachee.",
    "",
    `=== STRATEGIE DE REPONSE RETENUE ===`,
    input.strategy,
    "",
    `=== EXTRAITS DU DOSSIER DE CONSULTATION ===`,
    input.dceExcerpts || "Aucun extrait disponible.",
    "",
    `=== BASE DE L'ENTREPRISE ===`,
    input.companyBase,
  ];

  if (input.currentContent && input.action !== "generate") {
    blocks.push("", "=== TEXTE ACTUEL DU CHAPITRE ===", input.currentContent);
  }

  blocks.push("", ACTION_INSTRUCTIONS[input.action]);

  return blocks.join("\n");
}
