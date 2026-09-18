import type { ModulePage } from "./types";

export const solutionPages: Record<string, ModulePage> = {
  "marches-publics": {
    slug: "marches-publics",
    eyebrow: "Marchés publics",
    title: "Répondez aux marchés publics avec méthode, et à l'heure",
    description:
      "Répondez aux marchés publics avec méthode : analyse du DCE, points de vigilance signalés, mémoire technique structuré sur les critères du RC.",
    intro:
      "Le marché public ne pardonne pas l'à-peu-près : un DCE dense, des délais impératifs, un formalisme éliminatoire et un mémoire technique noté à la pondération près. MateriaBTP transforme ce formalisme en avantage.",
    challenges: [
      "Des DCE de plusieurs centaines de pages à analyser en quelques jours",
      "Une offre irrégulière ou hors délai est éliminée, sans seconde chance",
      "Des dérogations au CCAG et des pénalités qui passent inaperçues jusqu'à la signature",
      "Un mémoire technique décisif quand les prix se tiennent, mais réécrit dans l'urgence",
    ],
    how: [
      {
        title: "Le DCE analysé pièce par pièce",
        description:
          "RC, CCAP, CCTP et annexes sont lus en quelques minutes : dates clés, pénalités, garanties, visite obligatoire, variantes et points de vigilance remontent dans la Fiche Synthèse GoNoGo.",
      },
      {
        title: "Un mémoire construit sur les critères du RC",
        description:
          "Le sommaire suit les critères d'attribution et leur pondération. Chaque exigence du CCTP trouve sa réponse, rédigée à partir de vos méthodologies et certifications.",
      },
      {
        title: "La preuve administrative toujours prête",
        description:
          "Certifications, attestations, références par typologie de marché, engagements RSE : centralisés, datés, intégrés au bon endroit.",
      },
      {
        title: "Le dépôt à l'heure, sans nuit blanche",
        description:
          "Suivi exigence par exigence, assignation des sections, jalons internes de relecture : le dossier part complet, conforme, avant l'échéance.",
      },
    ],
    faq: [
      {
        q: "Couvrez-vous les MAPA comme les procédures formalisées ?",
        a: "Oui. De la procédure adaptée à l'appel d'offres ouvert, MateriaBTP analyse le DCE quelle que soit la procédure.",
      },
      {
        q: "Comment gérez-vous la co-traitance et la sous-traitance ?",
        a: "Vous pouvez inviter un co-traitant ou un sous-traitant comme contributeur externe sur les sections qui le concernent.",
      },
      {
        q: "Le mémoire correspond-il aux attentes des acheteurs publics ?",
        a: "Le sommaire est construit sur les critères d'attribution du règlement de consultation et leur pondération.",
      },
    ],
  },
  "rfp-consultations-privees": {
    slug: "rfp-consultations-privees",
    eyebrow: "RFP & consultations privées",
    title: "Gagnez vos RFP grands comptes, sans nuits blanches",
    description:
      "Grands comptes, grilles d'évaluation, avant-vente : MateriaBTP structure vos réponses RFP et consultations privées sur vos critères et votre savoir-faire.",
    intro:
      "Les RFP grands comptes imposent des grilles d'évaluation exigeantes, des délais serrés et des questionnaires techniques denses. MateriaBTP industrialise la réponse tout en préservant la différenciation de votre offre.",
    challenges: [
      "Des grilles RFP de plusieurs centaines de questions, souvent récurrentes",
      "Des critères d'évaluation pondérés qui exigent une réponse point par point",
      "Des équipes avant-vente mobilisées sur plusieurs dossiers en parallèle",
      "Un formalisme moins codifié que le public, mais tout aussi exigeant",
    ],
    how: [
      {
        title: "Grilles RFP traitées question par question",
        description: "Chaque ligne reçoit une réponse sourcée depuis votre base, avec suivi du taux de couverture en temps réel.",
      },
      {
        title: "Sommaire calé sur la grille d'évaluation",
        description: "Le mémoire ou la proposition technique suit la pondération de l'acheteur, rien n'est oublié.",
      },
      {
        title: "Votre différenciation préservée",
        description: "La rédaction s'appuie sur vos références, méthodologies et certifications — pas du contenu générique.",
      },
      {
        title: "Pilotage multi-dossiers",
        description: "Dashboard temps réel, assignation par section, jalons de relecture avant la remise.",
      },
    ],
    faq: [
      {
        q: "Couvrez-vous les RFI en amont des RFP ?",
        a: "Oui. Les RFI sont traités comme des questionnaires structurés, avec réponses sourcées et enrichissement de la base.",
      },
      {
        q: "Peut-on adapter le format de restitution ?",
        a: "Oui. Export Word, PDF ou Excel selon le gabarit imposé par l'acheteur.",
      },
      {
        q: "Comment gérer la confidentialité sur des appels d'offres privés ?",
        a: "Hébergement France SecNumCloud, accès restreints par dossier, aucune utilisation de vos données pour entraîner des modèles tiers.",
      },
    ],
  },
  "questionnaires-rfi-ddq": {
    slug: "questionnaires-rfi-ddq",
    eyebrow: "Questionnaires RFI, DDQ & sécurité",
    title: "Due diligence, cyber, RSE : répondez vite et juste",
    description:
      "Questionnaires RFI, DDQ, sécurité et conformité : réponses sourcées, assignation aux bons experts, taux de couverture en temps réel.",
    intro:
      "Les questionnaires de due diligence, de sécurité ou de conformité arrivent sans prévenir, souvent en centaines de lignes. MateriaBTP propose une réponse sourcée pour chaque question et mobilise les bons experts sur les sujets ouverts.",
    challenges: [
      "Des centaines de questions récurrentes mais jamais centralisées",
      "Des sujets sensibles (cyber, RGPD, RSE) nécessitant la validation d'experts",
      "Des délais courts imposés par les grands comptes",
      "Des versions de politiques internes difficiles à retrouver",
    ],
    how: [
      {
        title: "Réponse proposée pour chaque ligne",
        description: "L'IA propose une réponse sourcée depuis votre PSSI, politiques RGPD, certifications et procédures.",
      },
      {
        title: "Experts mobilisés au bon moment",
        description: "Les questions ouvertes sont assignées au RSSI, au juridique ou à la RSE. Leur réponse enrichit la base.",
      },
      {
        title: "Taux de couverture visible",
        description: "Traité, sourcé, validé, manquant : vous voyez l'état de la grille en temps réel.",
      },
      {
        title: "Base qui se consolide",
        description: "Chaque campagne validée enrichit votre base. Le prochain DDQ part de plus haut.",
      },
    ],
    faq: [
      {
        q: "Quels formats de grilles acceptez-vous ?",
        a: "Principalement Excel, mais aussi documents structurés Word ou PDF selon le client.",
      },
      {
        q: "Comment garantir l'exactitude sur la cybersécurité ?",
        a: "Chaque réponse cite sa source (PSSI, certifications ISO 27001, rapports d'audit). Rien ne part sans validation expert.",
      },
      {
        q: "Nos politiques changent souvent, comment rester à jour ?",
        a: "Mettez à jour le document source une fois dans la base : toutes les futures réponses s'appuient sur la version courante.",
      },
    ],
  },
};

export const solutionSlugs = Object.keys(solutionPages);
