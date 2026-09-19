import type { ModulePage } from "./types";

export const secteurPages: Record<string, ModulePage> = {
  "btp-travaux-publics": {
    slug: "btp-travaux-publics",
    eyebrow: "BTP & Travaux publics",
    title: "Un outil de réponse aux appels d'offres pensé pour les entreprises de travaux",
    description:
      "DCE lu pièce par pièce, clauses du CCAP signalées, évaluation fondée sur vos références chantiers, mémoire technique rédigé à partir de vos moyens et de vos méthodes.",
    intro:
      "Marchés publics de travaux, consultations privées, accords-cadres : une entreprise de travaux répond à de nombreuses consultations, souvent avec une petite équipe. MateriaBTP prend en charge la lecture, la recherche d'information et le premier jet, pour que votre équipe se concentre sur la précision technique et la preuve.",
    challenges: [
      "Des DCE volumineux (RC, CCAP, CCTP, annexes) à lire sous pression",
      "Des clauses du CCAP qui s'écartent du CCAG Travaux et passent inaperçues",
      "Les mêmes méthodologies réécrites d'un mémoire à l'autre",
      "Des références et certifications dispersées entre services",
    ],
    benefits: [
      {
        title: "Le DCE lu avant d'engager le bureau d'études",
        description:
          "Date limite, visite de site, pénalités, critères pondérés, exigences : relevés avec leur source, pour décider sur pièces.",
      },
      {
        title: "Vos chantiers de référence mobilisés au bon endroit",
        description:
          "Références, moyens humains et matériels, méthodes : l'évaluation et la rédaction s'appuient sur ce que votre base contient réellement.",
      },
      {
        title: "Qualifications et certifications prises en compte",
        description:
          "Qualibat, ISO, MASE ou RGE : saisies une fois dans votre base, elles sont confrontées aux exigences de chaque consultation et citées dans vos mémoires.",
      },
    ],
  },
};

export const secteurSlugs = Object.keys(secteurPages);
