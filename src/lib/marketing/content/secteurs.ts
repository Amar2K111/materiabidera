import type { ModulePage } from "./types";

export const secteurPages: Record<string, ModulePage> = {
  "btp-travaux-publics": {
    slug: "btp-travaux-publics",
    eyebrow: "BTP & Travaux publics",
    title: "Le logiciel d'appel d'offres BTP : des mémoires techniques au niveau des grands donneurs d'ordre",
    description:
      "Le logiciel d'appel d'offres pensé pour le BTP : DCE décrypté, dérogations au CCAG signalées, mémoires techniques rédigés depuis vos chantiers de référence.",
    intro:
      "Marchés publics de travaux, consultations privées, accords-cadres : le BTP vit au rythme des appels d'offres. MateriaBTP industrialise la réponse sans sacrifier ce qui fait gagner — la précision technique et la preuve par les références chantiers.",
    challenges: [
      "Des DCE volumineux (RC, CCAP, CCTP, plans, annexes) à éplucher sous pression",
      "Des dérogations au CCAG Travaux qui passent inaperçues jusqu'à la signature",
      "Les mêmes méthodologies réécrites à chaque mémoire, chantier après chantier",
      "Des références et certifications dispersées entre services et agences",
    ],
    benefits: [
      {
        title: "Le DCE décrypté avant d'engager le bureau d'études",
        description: "Dates clés, pénalités, garanties, visite obligatoire : la Fiche Synthèse GoNoGo sécurise la décision de répondre.",
      },
      {
        title: "Vos chantiers de référence mobilisés au bon endroit",
        description:
          "Références par typologie de travaux, moyens matériels et humains, organigrammes d'exécution : la bonne preuve pour chaque exigence du CCTP.",
      },
      {
        title: "Certifications et engagements toujours à jour",
        description: "Qualibat, ISO 9001, ISO 14001, MASE, RSE et insertion : centralisés et intégrés automatiquement aux mémoires.",
      },
    ],
  },
};

export const secteurSlugs = Object.keys(secteurPages);
