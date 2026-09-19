import type { ModulePage } from "./types";

/**
 * Solutions par type de consultation. Seules figurent celles que l'application
 * traite reellement ; les questionnaires RFP, RFI ou DDQ n'en font pas partie.
 */
export const solutionPages: Record<string, ModulePage> = {
  "marches-publics": {
    slug: "marches-publics",
    eyebrow: "Marchés publics de travaux",
    title: "Le formalisme des marchés publics, traité pièce par pièce",
    description:
      "Analyse du DCE, exigences et critères sourcés, évaluation de l'opportunité, mémoire construit sur les critères du règlement de consultation et contrôle avant dépôt.",
    intro:
      "Un marché public de travaux se joue autant sur la forme que sur le fond : pièces exigées, critères pondérés, clauses du CCAP, mémoire noté. MateriaBTP vous aide à ne rien laisser passer, de la lecture du DCE à l'export du mémoire.",
    challenges: [
      "Des DCE volumineux à lire en quelques jours",
      "Une offre incomplète ou hors délai écartée sans examen",
      "Des pénalités et clauses particulières repérées trop tard",
      "Un mémoire technique rédigé dans l'urgence, loin des critères notés",
    ],
    how: [
      {
        title: "Le DCE lu pièce par pièce",
        description:
          "Exigences, critères et sous-critères pondérés, points de vigilance : chaque élément est rattaché à la pièce et à la page qui le fondent.",
      },
      {
        title: "Une décision argumentée",
        description:
          "Huit facteurs justifiés, vos critères de qualification vérifiés un par un, une recommandation que vous confirmez ou non.",
      },
      {
        title: "Un mémoire aligné sur la notation",
        description:
          "Le plan suit le cadre imposé ou les critères du règlement de consultation. Chaque chapitre est rédigé à partir de votre base entreprise.",
      },
      {
        title: "Un contrôle avant de déposer",
        description:
          "Exigences non couvertes, affirmations non sourcées, contradictions, checklist des pièces : les points à reprendre sont listés avant l'export.",
      },
    ],
    faq: [
      {
        q: "Traitez-vous les MAPA comme les procédures formalisées ?",
        a: "Oui : l'analyse porte sur les pièces du DCE, quelle que soit la procédure.",
      },
      {
        q: "Gérez-vous la co-traitance ?",
        a: "L'outil ne gère pas aujourd'hui de travail partagé avec un co-traitant ou un sous-traitant extérieur à votre entreprise. Seuls les membres de votre compte y ont accès.",
      },
      {
        q: "Le dépôt se fait-il depuis MateriaBTP ?",
        a: "Non. Vous exportez le mémoire en Word ou en PDF, puis vous le déposez vous-même sur la plateforme de l'acheteur.",
      },
    ],
  },
};

export const solutionSlugs = Object.keys(solutionPages);
