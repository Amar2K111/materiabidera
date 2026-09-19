import type { StaticPage } from "./types";
import { CONTACT_EMAIL, CONTACT_NAME, CONTACT_ROLE } from "@/lib/marketing/config/contact";

/**
 * Pages fixes du site.
 *
 * Regle : n'affirmer que ce qui est verifiable aujourd'hui. Hebergement,
 * sous-traitants, fonctions, delais : chaque mention doit correspondre a la
 * realite du service. Les sous-traitants techniques cites ici sont ceux que
 * l'application utilise effectivement (voir .env et vercel.json).
 */
export const staticPages: Record<string, StaticPage> = {
  "logiciel-reponse-appels-offres": {
    slug: "logiciel-reponse-appels-offres",
    title: "Logiciel de réponse aux appels d'offres BTP",
    description:
      "MateriaBTP aide les entreprises de travaux à répondre aux appels d'offres : analyse du DCE, évaluation Go/No-Go, mémoire technique sourcé, contrôle avant dépôt et export Word ou PDF.",
    eyebrow: "Produit",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP accompagne une réponse à un appel d'offres de bout en bout : lecture des pièces du DCE, décision de répondre, construction et rédaction du mémoire technique, contrôle, puis export du document à déposer.",
          "L'outil s'appuie sur deux sources seulement : les pièces de la consultation et la base de votre entreprise. Chaque élément produit indique d'où il vient, et ce qui manque est signalé plutôt que complété au hasard. Vos équipes relisent, ajustent et décident.",
        ],
      },
      {
        type: "cards",
        title: "Ce que fait MateriaBTP",
        items: [
          { title: "Analyse & Go/No-Go", description: "Exigences, critères, points de vigilance et évaluation de l'opportunité, sources à l'appui.", href: "/produit/analyse-go-no-go" },
          { title: "Mémoire technique", description: "Plan sur les critères de l'acheteur, rédaction à partir de votre base, contrôle et export.", href: "/produit/memoire-technique" },
          { title: "Base entreprise", description: "Références, moyens, certifications, méthodes et anciens mémoires, avec une recherche par le sens.", href: "/produit/base-de-connaissances" },
        ],
      },
    ],
  },
  tarifs: {
    slug: "tarifs",
    title: "Tarifs",
    description: "MateriaBTP est en phase de lancement. Les conditions sont établies sur devis, après une démonstration sur l'un de vos dossiers.",
    sections: [
      {
        type: "prose",
        content: [
          "MateriaBTP est en phase de lancement, ouvert à un programme pilote. Le tarif est établi sur devis, selon le nombre de dossiers que vous traitez, après une démonstration de 30 minutes sur l'un de vos appels d'offres.",
          "Le devis détaille ce qui est inclus. Aucune formule n'est engagée avant que vous l'ayez acceptée.",
        ],
      },
      {
        type: "pricing",
        plans: [
          {
            name: "Programme pilote",
            price: "Sur devis",
            description: "L'ensemble des fonctions disponibles aujourd'hui, pour les entreprises de travaux.",
            features: [
              "Analyse du DCE : exigences, critères, points de vigilance",
              "Évaluation Go/No-Go et critères de qualification",
              "Mémoire technique rédigé à partir de votre base",
              "Contrôle qualité et checklist avant dépôt",
              "Export Word et PDF",
              "Base entreprise et recherche",
              "Échanges directs avec le fondateur",
            ],
            highlighted: true,
          },
        ],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    description: `Une question sur MateriaBTP ? Écrivez-nous : ${CONTACT_EMAIL}`,
    sections: [
      {
        type: "prose",
        content: [
          "Une question sur MateriaBTP, un dossier à tester, une demande de devis ? Écrivez-nous, ou réservez directement une démonstration de 30 minutes sur l'un de vos appels d'offres.",
        ],
      },
      { type: "form", form: "contact" },
    ],
  },
  "a-propos": {
    slug: "a-propos",
    title: "À propos de MateriaBTP",
    description: "MateriaBTP aide les entreprises de travaux à répondre aux appels d'offres avec méthode, à partir de leur savoir-faire réel.",
    sections: [
      {
        type: "prose",
        content: [
          "Répondre à un appel d'offres de travaux, c'est lire un DCE volumineux, décider vite, puis rédiger un mémoire précis, souvent avec une petite équipe et une échéance fixe. Une grande partie de ce temps passe à chercher l'information et à réécrire ce qui a déjà été écrit.",
          "MateriaBTP prend en charge cette part : lire les pièces, retrouver la bonne preuve dans votre base, préparer un premier jet et le contrôler. Avec une règle constante : rien n'est affirmé sans source, et la décision reste celle de vos équipes.",
          `MateriaBTP est en phase de lancement. ${CONTACT_NAME}, ${CONTACT_ROLE}, échange directement avec les entreprises du programme pilote : ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  securite: {
    slug: "securite",
    title: "Sécurité et confidentialité",
    description: "Comment MateriaBTP isole et protège les données de chaque entreprise, et quels prestataires techniques interviennent.",
    sections: [
      {
        type: "prose",
        content: [
          "Méthodes, références, prix : ce que vous déposez dans MateriaBTP est sensible. Voici, concrètement, comment ces données sont traitées. Cette page décrit l'état actuel du service ; elle n'annonce pas de certification que nous ne détenons pas.",
        ],
      },
      {
        type: "security",
        items: [
          {
            title: "Isolation par entreprise",
            description:
              "Chaque entreprise ne voit que ses propres dossiers, documents et base. Ce cloisonnement est appliqué directement dans la base de données, et testé.",
          },
          {
            title: "Chiffrement en transit et au repos",
            description:
              "Les échanges passent par HTTPS. La base de données et les fichiers sont stockés chez Supabase, qui les chiffre au repos.",
          },
          {
            title: "Traitement par un fournisseur d'IA",
            description:
              "Pour être analysés, les documents sont transmis au fournisseur d'IA utilisé par le service (Google Gemini ou Anthropic). MateriaBTP n'entraîne aucun modèle sur vos documents.",
          },
          {
            title: "Vos documents restent les vôtres",
            description:
              "Vous pouvez supprimer un dossier et ses fichiers à tout moment depuis l'application. Nous ne revendons aucune donnée.",
          },
        ],
      },
    ],
  },
  glossaire: {
    slug: "glossaire",
    title: "Glossaire des appels d'offres",
    description: "Définitions des termes clés des appels d'offres et marchés publics : DCE, RC, CCAP, CCTP, MAPA, DUME…",
    sections: [{ type: "glossary", entries: [] }],
  },
  "cas-clients": {
    slug: "cas-clients",
    title: "Programme pilote",
    description: "MateriaBTP est en lancement. Rejoignez les premières entreprises qui testent l'outil sur leurs vrais appels d'offres.",
    sections: [
      {
        type: "prose",
        content: [
          "Nous n'avons pas encore d'études de cas publiées : MateriaBTP est en phase de lancement.",
          "Nous ouvrons un programme pilote avec des entreprises du BTP qui veulent tester l'analyse du DCE, l'évaluation Go/No-Go et la rédaction de mémoires techniques sur leurs propres dossiers, avec un échange direct sur les évolutions de l'outil.",
          "Des études de cas seront publiées ici uniquement avec l'accord écrit des entreprises concernées, et avec des chiffres qu'elles auront mesurés elles-mêmes.",
        ],
      },
      {
        type: "cards",
        title: "Ce que nous mesurerons ensemble",
        items: [
          { title: "Temps passé sur l'analyse du DCE", description: "De la réception des pièces à la décision de répondre." },
          { title: "Temps passé sur le mémoire technique", description: "Du plan calé sur les critères au document prêt à relire." },
          { title: "Dossiers traités à effectif constant", description: "La capacité à répondre à plus de consultations sans dégrader la qualité." },
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
          // A COMPLETER avant la mise en ligne : forme juridique, adresse du siege,
          // SIREN / RCS et, le cas echeant, capital social (loi du 21 juin 2004, art. 6).
          `Éditeur du site : MateriaBTP. Responsable : ${CONTACT_NAME}, ${CONTACT_ROLE}. Contact : ${CONTACT_EMAIL}.`,
          `Directeur de la publication : ${CONTACT_NAME}.`,
          "Hébergement du site : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.",
          "Base de données et fichiers de l'application : Supabase Inc.",
          "Propriété intellectuelle : les textes et visuels propres à MateriaBTP sont protégés par le droit d'auteur. Les marques et sigles cités appartiennent à leurs titulaires respectifs.",
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
          "MateriaBTP traite vos données personnelles conformément au Règlement général sur la protection des données (RGPD).",
          "Données collectées sur le site : les informations que vous nous transmettez volontairement par e-mail ou lors de la réservation d'une démonstration (nom, e-mail, entreprise, message). La réservation de démonstration passe par le service Calendly.",
          "Données de l'application : les informations de votre compte et les documents que vous déposez, utilisés uniquement pour fournir le service.",
          "Prestataires techniques : Vercel (hébergement du site), Supabase (base de données et fichiers) et le fournisseur d'IA utilisé pour l'analyse des documents (Google Gemini ou Anthropic). Certains de ces prestataires peuvent traiter des données hors de l'Union européenne, dans le cadre de garanties contractuelles.",
          "MateriaBTP ne vend aucune donnée et n'entraîne aucun modèle d'IA sur vos documents.",
          `Vos droits : vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité. Pour les exercer : ${CONTACT_EMAIL}. Vous pouvez également saisir la CNIL.`,
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
          "Accès au service : l'accès est réservé aux entreprises ayant un accord en cours avec MateriaBTP. Les identifiants sont personnels et ne doivent pas être partagés.",
          "Vos documents : les documents que vous déposez restent votre propriété. Ils sont traités par le fournisseur d'IA du service pour produire les analyses, et ne servent pas à entraîner de modèle pour MateriaBTP.",
          "Responsabilité : MateriaBTP produit des analyses et des premiers jets assistés par l'IA, qui peuvent comporter des erreurs. Vos équipes doivent les relire et les valider avant tout dépôt. La responsabilité du contenu déposé reste celle du client.",
          `Pour toute question : ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
};

export const staticSlugs = Object.keys(staticPages);
