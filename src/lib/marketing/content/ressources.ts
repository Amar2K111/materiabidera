import type { ResourcePage } from "./types";

export const resourcePages: Record<string, ResourcePage> = {
  "grille-go-no-go": {
    slug: "grille-go-no-go",
    title: "Grille de décision Go/No-Go",
    description: "Une grille prête à l'emploi pour décider de répondre, ou non, à un appel d'offres.",
    format: "Excel",
    intro:
      "17 critères pondérés, score automatique et verdict Go/No-Go : cette grille vous aide à décider en quelques minutes si un appel d'offres mérite votre réponse, sur des bases objectives plutôt qu'au feeling.",
    highlights: [
      "17 critères pondérés couvrant technique, financier, risques et charge",
      "Score automatique et verdict Go/No-Go calculé",
      "Modifiable selon vos règles internes de qualification",
      "Compatible marchés publics et consultations privées",
    ],
    cta: "Télécharger la grille Go/No-Go",
  },
  "matrice-conformite": {
    slug: "matrice-conformite",
    title: "Matrice de conformité",
    description: "Une ligne par exigence du DCE, rien qui passe à travers.",
    format: "Excel",
    intro:
      "Cette matrice vous permet de tracer chaque exigence du DCE jusqu'à sa réponse dans votre dossier. Idéale pour les mémoires techniques et les grilles d'évaluation exigeantes.",
    highlights: [
      "Une ligne par exigence extraite du RC, CCAP ou CCTP",
      "Statut : couvert, partiel, manquant, à valider",
      "Assignation par contributeur et suivi d'avancement",
      "Exportable pour relecture avant dépôt",
    ],
    cta: "Télécharger la matrice",
  },
  "trame-memoire-technique": {
    slug: "trame-memoire-technique",
    title: "Trame de mémoire technique",
    description: "10 sections calées sur les critères de l'acheteur, avec un rappel de ce que l'évaluateur note.",
    format: "Word",
    intro:
      "Cette trame Word structure votre mémoire technique en 10 sections alignées sur les critères d'évaluation les plus courants des marchés publics et privés.",
    highlights: [
      "10 sections : compréhension, méthodologie, moyens, planning, RSE…",
      "Rappel de ce que l'évaluateur note dans chaque section",
      "Espace pour pondération et critères spécifiques du RC",
      "Format Word modifiable selon vos gabarits",
    ],
    cta: "Télécharger la trame",
  },
  "exemple-memoire-technique": {
    slug: "exemple-memoire-technique",
    title: "Exemple de mémoire technique",
    description: "Un mémoire rempli et commenté, le niveau à viser.",
    format: "Word",
    intro:
      "Un exemple complet de mémoire technique, commenté section par section, pour calibrer le niveau de détail attendu par les acheteurs publics et privés.",
    highlights: [
      "Mémoire complet sur un cas réaliste (rénovation éclairage public)",
      "Commentaires sur ce que l'évaluateur attend dans chaque section",
      "Bonnes pratiques de structuration et de preuve",
      "Niveau de rédaction à viser pour maximiser la note technique",
    ],
    cta: "Télécharger l'exemple",
  },
  "checklist-candidature": {
    slug: "checklist-candidature",
    title: "Checklist candidature",
    description: "Les 39 points de contrôle d'un dossier complet, avec leurs points de vigilance.",
    format: "Excel",
    intro:
      "DC1, DC2, DUME, attestations fiscales et sociales, dépôt dématérialisé : cette checklist recense les 39 points de contrôle d'un dossier de candidature complet.",
    highlights: [
      "39 points de contrôle couvrant candidature et offre",
      "Points de vigilance signalés pour chaque pièce",
      "Compatible DC1/DC2 et DUME",
      "Checklist à cocher avant chaque dépôt",
    ],
    cta: "Télécharger la checklist",
  },
  "bibliotheque-prompts-ia": {
    slug: "bibliotheque-prompts-ia",
    title: "56 prompts IA pour les appels d'offres",
    description: "Analyser, rédiger, relire : les prompts qui servent au quotidien des équipes bid.",
    format: "PDF",
    intro:
      "56 prompts prêts à l'emploi pour analyser un DCE, structurer un mémoire, rédiger une section ou relire une réponse. Un outil complémentaire en attendant d'industrialiser avec MateriaBTP.",
    highlights: [
      "Prompts d'analyse DCE et extraction des critères",
      "Prompts de structuration et rédaction de mémoire",
      "Prompts de relecture et conformité",
      "Organisés par étape du processus de réponse",
    ],
    cta: "Télécharger la bibliothèque",
  },
};

export const resourceSlugs = Object.keys(resourcePages);
