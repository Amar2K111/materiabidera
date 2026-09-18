import type { StaticPage } from "./types";
import { CONTACT_EMAIL } from "@/lib/marketing/config/contact";

export const staticPages: Record<string, StaticPage> = {
  "logiciel-reponse-appels-offres": {
    slug: "logiciel-reponse-appels-offres",
    title: "Logiciel de réponse aux appels d'offres",
    description:
      "MateriaBTP est le logiciel IA de réponse aux appels d'offres : analyse DCE, Go/No-Go, mémoire technique et questionnaires, sourcés depuis votre base de connaissances.",
    eyebrow: "Produit",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP est la plateforme d'AI Bid Intelligence qui transforme vos appels d'offres en levier de croissance. L'IA analyse vos DCE, fiabilise vos Go/No-Go et rédige vos mémoires techniques à partir de votre savoir-faire : elle produit, vos experts décident.",
          "De l'analyse du règlement de consultation à l'export Word du mémoire technique, chaque étape de la réponse est couverte par des agents IA spécialisés, orchestrés dans un workflow que vos équipes pilotent.",
        ],
      },
      {
        type: "cards",
        title: "Les modules MateriaBTP",
        items: [
          { title: "Analyse & Go/No-Go", description: "Synthèse du DCE et décision fiable en quelques minutes.", href: "/produit/analyse-go-no-go" },
          { title: "Mémoire technique", description: "Rédaction structurée sur les critères de l'AO.", href: "/produit/memoire-technique" },
          { title: "Questionnaires & DDQ", description: "RFP, RFI, sécurité, RSE, RGPD : répondus en heures.", href: "/produit/questionnaires" },
          { title: "Base de connaissances", description: "Votre savoir-faire centralisé, retrouvé en un clic.", href: "/produit/base-de-connaissances" },
          { title: "Collaboration & pilotage", description: "Assignation, suivi temps réel, dépôt à l'heure.", href: "/produit/collaboration" },
        ],
      },
    ],
  },
  tarifs: {
    slug: "tarifs",
    title: "Tarifs",
    description: "Licence annuelle SaaS. La démo chiffre le ROI sur vos propres appels d'offres avant tout engagement.",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP est proposé en licence annuelle, adaptée à la taille de votre équipe bid et au volume de consultations traitées. Pas de surprise : la démo de 30 minutes sur l'un de vos vrais AO chiffre le ROI avant tout engagement.",
        ],
      },
      {
        type: "pricing",
        plans: [
          {
            name: "Essentiel",
            price: "Sur devis",
            description: "Pour les équipes qui démarrent l'industrialisation de leurs réponses.",
            features: [
              "Analyse DCE et Fiche Synthèse GoNoGo",
              "Mémoire technique (5 réponses / mois)",
              "Base de connaissances (50 Go)",
              "Support email",
            ],
          },
          {
            name: "Pro",
            price: "Sur devis",
            description: "Pour les équipes bid qui traitent plusieurs dossiers en parallèle.",
            features: [
              "Tous les modules Essentiel",
              "Questionnaires & DDQ illimités",
              "Collaboration multi-contributeurs",
              "Base de connaissances illimitée",
              "Customer Success dédié",
            ],
            highlighted: true,
          },
          {
            name: "Entreprise",
            price: "Sur devis",
            description: "Pour les groupes multi-entités et les volumes importants.",
            features: [
              "Tous les modules Pro",
              "Multi-entités et droits avancés",
              "SSO et API",
              "SLA prioritaire",
              "Accompagnement onboarding sur mesure",
            ],
          },
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    description: `Parlez à un humain. Nous répondons vite : ${CONTACT_EMAIL}`,
    sections: [
      {
        type: "prose",
        content: [
          "Une question sur MateriaBTP, un projet de déploiement, un partenariat ? Écrivez-nous ou réservez directement une démo de 30 minutes sur l'un de vos appels d'offres.",
        ],
      },
      { type: "form", form: "contact" },
    ],
  },
  "a-propos": {
    slug: "a-propos",
    title: "À propos de MateriaBTP",
    description: "MateriaBTP, l'AI Bid Intelligence qui fait des appels d'offres un levier de croissance.",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP est née d'un constat simple : les équipes qui répondent aux appels d'offres passent 70 % de leur temps à chercher de l'information et à réécrire ce qu'elles ont déjà produit. L'IA peut éliminer cette friction — à condition de s'appuyer sur le savoir-faire réel de l'entreprise, pas sur du contenu générique.",
          "Notre mission : faire des appels d'offres un levier de croissance pour les entreprises du BTP et des travaux publics, sans sacrifier la qualité technique des mémoires.",
          "Conçu, développé et hébergé en France. Données sur serveurs SecNumCloud, conformes RGPD, jamais utilisées pour entraîner des modèles tiers.",
        ],
      },
      {
        type: "team",
        members: [
          { name: "Équipe Produit", role: "Agents IA & expérience utilisateur", bio: "Des agents spécialisés pour chaque étape de la réponse : analyse, extraction, structuration, rédaction, relecture, conformité." },
          { name: "Équipe Customer Success", role: "Onboarding & accompagnement", bio: "Structuration de votre base de connaissances en 48 heures, formation de vos équipes, suivi des premiers dossiers." },
          { name: "Équipe Sécurité", role: "Infrastructure & conformité", bio: "Hébergement souverain, qualification SecNumCloud, audits réguliers et conformité RGPD par conception." },
        ],
      },
    ],
  },
  recrutement: {
    slug: "recrutement",
    title: "Recrutement",
    description: "Rejoignez l'aventure MateriaBTP. Nous recrutons des talents passionnés par l'IA appliquée aux appels d'offres.",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP grandit. Nous cherchons des profils qui veulent transformer un métier exigeant avec l'IA — en gardant l'humain au centre de la décision.",
        ],
      },
      {
        type: "jobs",
        items: [
          {
            title: "Ingénieur IA / LLM",
            location: "Lille / Remote",
            type: "CDI",
            description: "Concevoir et améliorer les agents IA spécialisés dans l'analyse documentaire et la rédaction de mémoires techniques.",
          },
          {
            title: "Customer Success Manager",
            location: "France",
            type: "CDI",
            description: "Accompagner les clients dans le déploiement de MateriaBTP : structuration de la base, formation, suivi des premiers dossiers.",
          },
          {
            title: "Business Developer",
            location: "France",
            type: "CDI",
            description: "Développer le portefeuille clients auprès des entreprises qui répondent aux appels d'offres publics et privés.",
          },
        ],
      },
    ],
  },
  securite: {
    slug: "securite",
    title: "Sécurité & souveraineté",
    description: "Hébergement en France, qualifié SecNumCloud, conforme RGPD.",
    sections: [
      {
        type: "prose",
        content: [
          "Méthodologies, références, prix, organisation : ce que vous confiez à MateriaBTP est ce que vos concurrents aimeraient lire. Notre infrastructure est conçue pour que cela n'arrive jamais.",
        ],
      },
      {
        type: "security",
        items: [
          { title: "Hébergement 100 % en France", description: "Vos données restent sur le territoire, dans des datacenters souverains." },
          { title: "Serveurs qualifiés SecNumCloud", description: "Le référentiel de sécurité le plus exigeant de l'ANSSI." },
          { title: "Conforme RGPD, par conception", description: "Vos documents n'entraînent jamais de modèles tiers. Jamais." },
          { title: "Chiffrement et contrôle d'accès", description: "Données chiffrées au repos et en transit. Droits d'accès granulaires par équipe et par dossier." },
          { title: "Traçabilité des accès", description: "Journalisation des accès et des modifications pour audit et conformité." },
          { title: "Sauvegardes et continuité", description: "Sauvegardes régulières et plan de continuité d'activité testé." },
        ],
      },
    ],
  },
  glossaire: {
    slug: "glossaire",
    title: "Glossaire des appels d'offres",
    description: "Définitions des termes clés des appels d'offres et marchés publics : DCE, RC, CCAP, CCTP, RFP, RFI, DDQ, MAPA, DUME…",
    sections: [{ type: "glossary", entries: [] }],
  },
  "calculateur-roi": {
    slug: "calculateur-roi",
    title: "Calculateur ROI",
    description: "Estimez le coût réel de vos réponses aux appels d'offres et le gain potentiel avec MateriaBTP.",
    sections: [
      {
        type: "prose",
        content: [
          "Combien vous coûte réellement chaque réponse à un appel d'offres ? Temps des commerciaux, des experts techniques, des relectures de dernière minute… Le calculateur ci-dessous estime votre coût actuel et le gain potentiel avec MateriaBTP.",
        ],
      },
      { type: "roi-calculator" },
    ],
  },
  podcast: {
    slug: "podcast",
    title: "Masters of Tenders",
    description: "Le podcast MateriaBTP sur les appels d'offres : méthodes, retours de terrain et interviews d'experts.",
    sections: [
      {
        type: "prose",
        content: [
          "Masters of Tenders explore les coulisses des appels d'offres : stratégies de réponse, erreurs à éviter, retours d'expérience de dirigeants et responsables commerciaux.",
        ],
      },
      {
        type: "podcast",
        episodes: [
          {
            title: "Comment industrialiser ses réponses aux AO sans perdre en qualité",
            guest: "Thomas D., BSE Ambulances",
            date: "Août 2026",
            description: "Retour d'expérience sur la réduction de 50 % du temps de traitement et l'automatisation de 70 % des mémoires techniques.",
          },
          {
            title: "Go/No-Go : arrêter de répondre au feeling",
            guest: "Équipe MateriaBTP",
            date: "Juillet 2026",
            description: "Les 17 critères d'une décision Go/No-Go fiable, et comment l'IA accélère l'analyse du DCE.",
          },
          {
            title: "BTP et marchés publics : le formalisme comme avantage compétitif",
            guest: "Directeur travaux, PME BTP",
            date: "Juin 2026",
            description: "Comment les dérogations au CCAG et les points de vigilance du DCE conditionnent la rentabilité du marché.",
          },
        ],
      },
    ],
  },
  "cas-clients": {
    slug: "cas-clients",
    title: "Programme pilote",
    description: "MateriaBTP est en lancement. Rejoignez les premières entreprises qui testent l'outil sur leurs vrais appels d'offres.",
    sections: [
      {
        type: "prose",
        content: [
          "Nous n'avons pas encore d'études de cas publiées — MateriaBTP est en phase de lancement. C'est normal, et c'est honnête.",
          "Nous ouvrons un programme pilote avec des entreprises du BTP qui veulent tester l'analyse DCE, le Go/No-Go et la rédaction de mémoires techniques sur leurs propres dossiers. En échange, vous bénéficiez d'un accompagnement renforcé et d'une influence directe sur la roadmap produit.",
          "Les premières études de cas seront publiées ici dès que nos partenaires pilotes auront validé le partage de leurs résultats.",
        ],
      },
      {
        type: "cards",
        title: "Ce que nous mesurerons ensemble",
        items: [
          { title: "Temps gagné sur l'analyse du DCE", description: "De la réception du RC à la Fiche Synthèse GoNoGo prête pour arbitrage." },
          { title: "Temps gagné sur le mémoire technique", description: "Du sommaire calé sur les critères du RC au premier jet sourcé depuis votre base." },
          { title: "Dossiers traités à effectif constant", description: "Capacité à répondre à plus d'AO sans embaucher ni sacrifier la qualité." },
        ],
      },
    ],
  },
  "mentions-legales": {
    slug: "mentions-legales",
    title: "Mentions légales",
    description: "Mentions légales du site MateriaBTP.",
    sections: [
      {
        type: "prose",
        content: [
          `Éditeur du site : MateriaBTP. Contact : ${CONTACT_EMAIL}`,
          "Directeur de la publication : MateriaBTP.",
          "Hébergement : infrastructure hébergée en France, serveurs qualifiés SecNumCloud.",
          "Propriété intellectuelle : l'ensemble du contenu de ce site (textes, images, logos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.",
        ],
      },
    ],
  },
  confidentialite: {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    description: "Comment MateriaBTP collecte, utilise et protège vos données personnelles.",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).",
          "Données collectées : lors de l'utilisation du site (formulaires de contact, démo), nous collectons les informations que vous nous communiquez volontairement (nom, email, entreprise, message).",
          "Finalité : ces données sont utilisées pour répondre à vos demandes, organiser des démonstrations et vous informer de nos services si vous y avez consenti.",
          "Hébergement : vos données sont hébergées en France sur des serveurs qualifiés SecNumCloud. Elles ne sont jamais vendues ni utilisées pour entraîner des modèles tiers.",
          `Vos droits : vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Contact : ${CONTACT_EMAIL}`,
        ],
      },
    ],
  },
  cgu: {
    slug: "cgu",
    title: "Conditions d'utilisation",
    description: "Conditions générales d'utilisation de la plateforme MateriaBTP.",
    sections: [
      {
        type: "prose",
        content: [
          "Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme MateriaBTP.",
          "Accès au service : l'accès à MateriaBTP est réservé aux clients disposant d'un contrat de licence en cours de validité. Les identifiants sont personnels et ne doivent pas être partagés.",
          "Utilisation des données : les documents que vous déposez sur MateriaBTP restent votre propriété. MateriaBTP ne les utilise pas pour entraîner des modèles tiers.",
          "Responsabilité : MateriaBTP produit des premiers jets assistés par IA que vos experts doivent relire et valider avant tout dépôt. La responsabilité du contenu final déposé reste celle du client.",
          `Pour toute question : ${CONTACT_EMAIL}`,
        ],
      },
    ],
  },
};

export const staticSlugs = Object.keys(staticPages);
