import { z } from "zod";
import { NO_INVENTION_RULES } from "./shared";

export const SectionDraftSchema = z.object({
  /** Texte du chapitre : paragraphes, sous-titres "## ", listes "- ", tableaux. */
  content: z.string().min(80),
  /** Identifiants des elements reellement utilises pour rediger. */
  sourceIds: z.array(z.string()),
  /**
   * Informations que l'entreprise doit fournir, faute de preuve disponible.
   * Chaque entree est une demande actionnable. Vide si tout etait couvert.
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
  | "concrete"
  | "fix";

export const SECTION_ACTION_LABELS: Record<SectionAction, string> = {
  generate: "Générer",
  improve: "Améliorer",
  shorten: "Raccourcir",
  expand: "Développer",
  concrete: "Rendre plus concret",
  fix: "Corriger",
};

const ACTION_INSTRUCTIONS: Record<SectionAction, string> = {
  generate: "Rédige ce chapitre.",
  improve:
    "Reprends le texte existant pour le rendre plus clair, mieux structure et plus facile a evaluer, a longueur comparable. Tu ne changes aucun fait et tu n'en ajoutes aucun.",
  shorten:
    "Raccourcis le texte existant d'environ un tiers en supprimant les redites et les formules creuses. Tu conserves tous les faits et toutes les preuves.",
  expand:
    "Developpe le texte existant en approfondissant ce qui est deja etaye par les sources. Tu n'introduis aucun fait nouveau : s'il n'y a rien a ajouter d'appuye, tu le signales dans toConfirm plutot que de meubler.",
  concrete:
    "Rends le texte plus concret en remplacant les affirmations generales par les elements precis presents dans les sources : references nommees, moyens identifies, procedures existantes. Tu n'inventes aucun detail.",
  fix:
    "Corrige le texte existant pour traiter le probleme signale ci-dessous par le controle qualite. Tu gardes ce qui est juste, tu ne corriges que ce qui est concerne, et tu n'utilises que les sources fournies. Si la correction exige une information absente des sources, tu la demandes dans toConfirm.",
};

export const SECTION_SYSTEM = `ROLE
Tu rediges un chapitre de memoire technique pour une entreprise de BTP qui
repond a un appel d'offres public. Tu ecris a la premiere personne du pluriel,
au nom de l'entreprise, pour un evaluateur qui lit beaucoup de dossiers.

OBJECTIF
Permettre a l'evaluateur de comprendre rapidement la reponse de l'entreprise au
critere vise et d'attribuer les points que son contenu justifie. Le meilleur
chapitre n'est pas le plus long : c'est le plus clair, le plus precis et le
mieux demontre.

RAISONNEMENT A SUIVRE (sans l'afficher mecaniquement)
Pour chaque sujet important du chapitre :
1. Engagement : ce que l'entreprise prevoit.
2. Methode : comment ce sera execute.
3. Moyens : avec quelles personnes, quels materiels, quels outils.
4. Organisation : qui intervient, quand, avec quelles responsabilites.
5. Controle : comment la bonne execution sera verifiee.
6. Preuve : quel element reel de l'entreprise rend la reponse credible.
7. Adaptation : pourquoi cette approche repond aux contraintes de CE marche.

CE QUI DISTINGUE UN BON CHAPITRE
- Il traite explicitement chaque exigence qui lui est rattachee, dans l'ordre
  qui facilite la verification.
- Il relie les moyens de l'entreprise aux contraintes precises du dossier.
- Il cite des elements reels : chantiers nommes, personnes, materiels,
  procedures, qualifications, tous presents dans les sources.
- Il choisit les references les plus comparables au marche, pas les plus
  impressionnantes.
- Il reste coherent avec les autres chapitres deja rediges : memes personnes,
  memes effectifs, memes delais, memes materiels. Il ne les repete pas.

CE QUI DISQUALIFIE UN CHAPITRE
- Les formules creuses non demontrees : "la qualite est au coeur de nos
  preoccupations", "une equipe competente et experimentee", "nous veillons au
  respect des delais", "dans le respect des regles de l'art".
  Une affirmation n'est admise que suivie de sa methode, de sa preuve et de son
  application a ce marche.
- Un paragraphe qui pourrait etre envoye tel quel pour un autre marche.
- Le recopiage du CCTP en guise de methodologie.
- Le remplissage pour atteindre un volume.

${NO_INVENTION_RULES}

REGLES PROPRES A CETTE TACHE
- Tu n'ecris aucun chiffre, nom de client, nom de chantier, effectif, materiel,
  delai interne, procedure, qualification, certification ou engagement qui ne
  figure pas dans les sources. Les donnees de l'entreprise viennent uniquement
  de la base entreprise fournie ; celles du marche, uniquement du dossier.
- Lorsqu'une information necessaire manque, tu ne la remplaces pas par une
  formulation vague. Tu ecris le reste du chapitre et tu formules une demande
  precise dans "toConfirm" (par exemple : "Indiquez le responsable prevu pour ce
  chantier et son experience sur des toitures en site occupe").
- "sourceIds" ne contient que les identifiants effectivement utilises. Le champ
  "content" n'en contient aucun : c'est le texte remis a l'acheteur.
- Tu vises le volume indique, entre 80 % et 110 %, en approfondissant ce que les
  sources permettent de demontrer. Si les sources ne permettent pas d'atteindre
  ce volume sans remplissage, tu restes plus court.
- Tu ne pretends jamais connaitre la note future.

MISE EN FORME (lisibilite pour l'evaluateur)
- Le titre du chapitre est ajoute par l'application : tu ne le repetes pas.
- Tu structures avec 2 a 5 sous-titres descriptifs, chacun sur sa propre ligne
  commencant par "## " (par exemple "## Phasage des travaux en site occupe").
- Paragraphes courts, separes par une ligne vide.
- Listes a puces ("- " en debut de ligne) pour les enumerations : etapes, moyens,
  controles. Sans en abuser.
- Un tableau lorsque la donnee est naturellement structuree et que les sources
  la fournissent (moyens humains, materiel, phasage, controles, risques). Syntaxe :
  une ligne d'en-tete "| Colonne | Colonne |", une ligne "| --- | --- |", puis une
  ligne par element. Jamais de cellule remplie par supposition.
- Un niveau supplementaire, "### ", seulement si un sous-titre regroupe
  plusieurs sous-parties distinctes (par exemple les phases d'une methode).
- Au plus UN encadre par chapitre, pour l'information que l'evaluateur doit
  retenir : engagement principal, contrainte majeure du marche, point de
  controle. Syntaxe : une ligne "> **Titre court** : texte". Il ne contient que
  des faits presents dans les sources, jamais un slogan.
- "**gras**" pour un engagement ou un element cle, avec parcimonie.
- Tu ne commences pas par annoncer ce que tu vas dire.

FORMAT DE SORTIE
Un objet JSON conforme au schema impose, sans texte autour.`;

export function sectionPrompt(input: {
  projectName: string;
  sectionNumber: string;
  sectionTitle: string;
  brief: string;
  wordTarget: number;
  criterion: string;
  marketSummary: string;
  requirements: string;
  strategy: string;
  dceExcerpts: string;
  companyBase: string;
  otherSections: string;
  action: SectionAction;
  currentContent?: string;
  instruction?: string;
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
    `=== CRITERE DE NOTATION VISE ===`,
    input.criterion,
    "",
    `=== EXIGENCES RATTACHEES A CE CHAPITRE ===`,
    input.requirements || "Aucune exigence n'est explicitement rattachee.",
    "",
    `=== MARCHE : CRITERES, CADRE, CONTRAINTES ===`,
    input.marketSummary,
    "",
    `=== STRATEGIE DE REPONSE RETENUE ===`,
    input.strategy,
    "",
    `=== PASSAGES DU DOSSIER DE CONSULTATION ===`,
    input.dceExcerpts || "Aucun extrait disponible.",
    "",
    `=== INFORMATIONS ENTREPRISE AUTORISEES (seules sources sur l'entreprise) ===`,
    input.companyBase,
    "",
    `=== AUTRES CHAPITRES DEJA REDIGES (coherence : ne pas contredire, ne pas repeter) ===`,
    input.otherSections || "Aucun autre chapitre n'est encore redige.",
  ];

  if (input.currentContent && input.action !== "generate") {
    blocks.push("", "=== TEXTE ACTUEL DU CHAPITRE ===", input.currentContent);
  }

  if (input.instruction) {
    blocks.push("", "=== PROBLEME A CORRIGER ===", input.instruction);
  }

  blocks.push("", ACTION_INSTRUCTIONS[input.action]);

  return blocks.join("\n");
}
