import type { ModulePage } from "./types";

/**
 * Pages produit du site.
 *
 * Chaque phrase decrit une fonction qui existe dans l'application a ce jour.
 * Avant d'ajouter une promesse ici, verifier qu'elle est disponible pour un
 * client : une fonction annoncee mais absente est une pratique commerciale
 * trompeuse.
 */
export const produitPages: Record<string, ModulePage> = {
  "analyse-go-no-go": {
    slug: "analyse-go-no-go",
    eyebrow: "Analyse & Go/No-Go",
    title: "Décidez de répondre sur pièces, pas à l'intuition",
    description:
      "MateriaBTP lit les pièces de votre DCE, relève les exigences, les critères de jugement et les points de vigilance, puis évalue l'opportunité face à votre base entreprise et à vos propres critères.",
    intro:
      "Déposez le règlement de consultation, le CCAP, le CCTP et les annexes. MateriaBTP en tire les informations qui comptent pour décider, chacune rattachée à la pièce et à la page d'où elle vient, puis confronte le dossier à ce que votre entreprise sait réellement faire.",
    benefits: [
      {
        title: "L'essentiel du dossier, sourcé",
        description:
          "Objet, acheteur, lot, montant, durée d'exécution, date limite, variantes, visite de site, critères d'attribution et leur pondération : chaque élément indique sa pièce et sa page. Ce que les pièces ne disent pas est signalé comme tel, jamais deviné.",
      },
      {
        title: "Les points de vigilance, avant d'engager l'équipe",
        description:
          "Pénalités, garanties, contraintes de chantier, pièces exigées : les points à surveiller sont relevés avec leur niveau de criticité et l'extrait qui les fonde.",
      },
      {
        title: "Une évaluation justifiée, que vous tranchez",
        description:
          "Huit facteurs sont notés et justifiés à partir de vos références, moyens et qualifications : adéquation technique, capacités, expérience, critères, délai, risques contractuels, exigences administratives, contraintes de chantier. La note est calculée par l'application ; la décision reste la vôtre.",
      },
      {
        title: "Vos propres règles, appliquées à chaque dossier",
        description:
          "Zone d'intervention, montant, qualifications, délai de préparation : vous fixez vos critères de qualification, simples ou éliminatoires. Chacun reçoit un verdict sourcé à chaque évaluation.",
      },
    ],
    features: [
      "Lecture des pièces PDF, Word, Excel et ZIP, y compris les PDF scannés (jusqu'à 40 pages)",
      "Exigences extraites avec leur catégorie, leur priorité et leur source",
      "Critères et sous-critères d'attribution avec leur pondération",
      "Points de vigilance classés par criticité",
      "Évaluation Go/No-Go sur huit facteurs justifiés et sourcés",
      "Critères de qualification de l'entreprise, simples ou éliminatoires",
      "Décision et note de l'utilisateur, qui priment sur la recommandation",
    ],
    faq: [
      {
        q: "Quels documents puis-je déposer ?",
        a: "Les pièces du DCE aux formats PDF, Word, Excel ou dans une archive ZIP. Les PDF scannés sont lus par reconnaissance de caractères, jusqu'à 40 pages par document.",
      },
      {
        q: "Comment vérifier ce que l'outil a extrait ?",
        a: "Chaque exigence, critère ou point de vigilance est rattaché à sa pièce et à sa page, avec l'extrait concerné. Quand une information ne figure pas dans les pièces, l'outil l'indique plutôt que de la reconstituer.",
      },
      {
        q: "Peut-on appliquer nos règles internes de décision ?",
        a: "Oui. Vous saisissez vous-même vos critères de qualification dans les paramètres, et vous choisissez lesquels sont éliminatoires. Ils sont vérifiés à chaque évaluation.",
      },
    ],
  },
  "memoire-technique": {
    slug: "memoire-technique",
    eyebrow: "Mémoire technique",
    title: "Un mémoire construit sur les critères de l'acheteur, à partir de votre matière",
    description:
      "Plan établi sur les critères de jugement ou le cadre imposé, rédaction chapitre par chapitre à partir de votre base entreprise, contrôle avant dépôt et export Word ou PDF.",
    intro:
      "MateriaBTP construit le plan du mémoire à partir du cadre imposé par l'acheteur quand il existe, sinon des critères de jugement et des exigences relevées. Chaque chapitre est ensuite rédigé à partir de vos références, de vos moyens et de vos méthodes. Vos rédacteurs relisent, ajustent et valident.",
    benefits: [
      {
        title: "Un plan qui suit la notation",
        description:
          "Chaque chapitre est rattaché au critère qu'il traite et aux exigences qu'il doit couvrir. Aucun plan type n'est plaqué sur la consultation.",
      },
      {
        title: "Rédigé avec vos éléments réels",
        description:
          "La rédaction s'appuie sur votre base entreprise et sur les pièces du DCE. Les sources de chaque chapitre sont affichées ; l'outil n'attribue à votre entreprise ni référence ni moyen qui n'y figure pas.",
      },
      {
        title: "Tout le mémoire, ou un chapitre à la fois",
        description:
          "Lancez la rédaction de l'ensemble du mémoire en une fois, ou chapitre par chapitre. Améliorer, rendre concret, développer, raccourcir : chaque action conserve la version précédente.",
      },
      {
        title: "Contrôlé avant le dépôt",
        description:
          "Le contrôle qualité signale les exigences non couvertes, les affirmations sans source et les contradictions entre chapitres, avec un score de préparation — pas une probabilité de gagner.",
      },
    ],
    features: [
      "Plan fondé sur le cadre imposé ou sur les critères de jugement",
      "Rédaction de tout le mémoire en un clic, ou chapitre par chapitre",
      "Sources affichées pour chaque chapitre (DCE et base entreprise)",
      "Historique des versions de chaque chapitre",
      "Contrôle qualité et checklist avant dépôt",
      "Export Word et PDF mis en page : page de garde, sommaire, chapitres numérotés",
    ],
    faq: [
      {
        q: "Le mémoire rédigé est-il prêt à déposer ?",
        a: "Non. C'est un premier jet documenté que vos équipes relisent, complètent et valident. La responsabilité du contenu déposé reste la vôtre.",
      },
      {
        q: "Comment l'outil évite-t-il les réponses génériques ?",
        a: "Il rédige à partir de votre base entreprise : références, équipe, matériel, certifications, qualifications, méthodes et anciens mémoires. Plus votre base est complète, plus le texte est précis. Ce qui manque est signalé comme point à compléter.",
      },
      {
        q: "Peut-on réutiliser un chapitre d'un dossier à l'autre ?",
        a: "Oui. Un chapitre validé peut être ajouté à vos méthodes, avec la mention du dossier d'origine, pour servir aux prochains mémoires.",
      },
    ],
  },
  "base-de-connaissances": {
    slug: "base-de-connaissances",
    eyebrow: "Base entreprise",
    title: "Votre savoir-faire, rangé une fois, réutilisé à chaque réponse",
    description:
      "Références, équipe, matériel, certifications, qualifications, méthodes et anciens mémoires : la base qui alimente chaque analyse et chaque mémoire, avec une recherche par le sens.",
    intro:
      "Tout ce que votre entreprise sait prouver est réuni au même endroit : vos chantiers de référence, vos moyens humains et matériels, vos certifications et qualifications, vos méthodes et vos anciens mémoires. C'est cette base que MateriaBTP mobilise pour évaluer une opportunité et rédiger un mémoire.",
    benefits: [
      {
        title: "Des fiches structurées",
        description:
          "Références, équipe, matériel, certifications, qualifications et méthodes sont saisis sous forme de fiches, pour être cités précisément dans vos réponses.",
      },
      {
        title: "Vos documents existants exploités",
        description:
          "Déposez vos anciens mémoires, CV, fiches de référence, documents QSE : leur texte est extrait et devient citable.",
      },
      {
        title: "Une recherche qui comprend la question",
        description:
          "Cherchez « travaux en site occupé » ou « Qualibat » : la recherche combine les mots et le sens, et renvoie la fiche ou le passage d'origine.",
      },
      {
        title: "Une base qui s'enrichit",
        description:
          "Un chapitre de mémoire validé peut rejoindre vos méthodes en un clic. Les dossiers suivants partent de plus haut.",
      },
    ],
    features: [
      "Présentation de l'entreprise et zone d'intervention",
      "Fiches : références, équipe, matériel, certifications, qualifications, méthodes",
      "Bibliothèque de documents : anciens mémoires, CV, QSE, certifications",
      "Recherche par les mots et par le sens, avec la source",
      "Chapitres validés réutilisables comme méthodes",
      "Base propre à votre entreprise, isolée des autres comptes",
    ],
    faq: [
      {
        q: "Combien de temps pour être opérationnel ?",
        a: "Le temps de renseigner l'essentiel : quelques références, votre équipe, vos qualifications. Vous pouvez aussi déposer vos anciens mémoires. Une base incomplète fonctionne, mais l'évaluation et la rédaction le signalent.",
      },
      {
        q: "Quels documents peut-on déposer dans la bibliothèque ?",
        a: "Des fichiers PDF, Word (DOCX) ou Excel (XLSX) : anciens mémoires, fiches de référence, CV, certifications, documents QSE, fiches matériel.",
      },
      {
        q: "Qui peut voir notre base ?",
        a: "Uniquement les membres de votre entreprise. Chaque compte entreprise est isolé des autres, au niveau de la base de données.",
      },
    ],
  },
};

export const produitSlugs = Object.keys(produitPages);
