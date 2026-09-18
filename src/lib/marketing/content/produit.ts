import type { ModulePage } from "./types";

export const produitPages: Record<string, ModulePage> = {
  "analyse-go-no-go": {
    slug: "analyse-go-no-go",
    eyebrow: "Analyse & Go/No-Go",
    title: "Fiabilisez chaque Go/No-Go, en quelques minutes",
    description:
      "MateriaBTP lit le RC, le CCAP et le CCTP : dates clés, pénalités, garanties et points de vigilance dans une Fiche Synthèse GoNoGo éditable.",
    intro:
      "Déposez les pièces du DCE. MateriaBTP en extrait l'essentiel — dates clés, pénalités, garanties, points de vigilance — et le confronte à vos critères de qualification. Vous décidez de répondre en connaissance de cause, plus au feeling.",
    benefits: [
      {
        title: "Une synthèse complète du DCE",
        description:
          "RC, CCAP, CCTP et annexes sont analysés en profondeur : date limite de remise, début d'exécution, durée du marché, pénalités, garanties demandées et critères d'attribution remontent automatiquement.",
      },
      {
        title: "Les pièges détectés avant d'engager vos équipes",
        description:
          "Clauses de pénalités atypiques, garanties inhabituelles, visite obligatoire, variante autorisée : les points de vigilance sont signalés explicitement, pièce par pièce.",
      },
      {
        title: "Vos critères de qualification, appliqués systématiquement",
        description:
          "Seuils de montant, secteurs, zones géographiques, certifications requises : vos règles internes de Go/No-Go sont paramétrées une fois et appliquées à chaque consultation.",
      },
      {
        title: "Une traçabilité totale",
        description:
          "Chaque information reconstituée par l'IA — un montant estimé, une durée implicite — est marquée d'une étoile. Vous savez toujours ce qui vient du document et ce qui a été déduit.",
      },
    ],
    features: [
      "Analyse du RC, CCAP, CCTP et des annexes du DCE",
      "Extraction des dates clés : remise des offres, démarrage, durée du marché",
      "Extraction des clauses de pénalités et des garanties demandées",
      "Mention « variante autorisée » remontée dans la synthèse",
      "Règles de qualification paramétrables par entreprise",
      "Fiche Synthèse GoNoGo éditable et partageable",
      "Marquage ⭐ des montants et durées reconstitués par l'IA",
    ],
    faq: [
      {
        q: "Quels documents puis-je analyser ?",
        a: "Toutes les pièces d'un DCE : règlement de consultation (RC), CCAP, CCTP, annexes techniques et administratives, au format PDF ou Word. MateriaBTP couvre les marchés publics comme les consultations privées.",
      },
      {
        q: "Comment être sûr de la fiabilité des informations extraites ?",
        a: "Chaque élément de la Fiche Synthèse GoNoGo est relié à sa source dans le document. Les informations reconstituées par l'IA sont signalées par une étoile pour que votre relecture se concentre dessus.",
      },
      {
        q: "Peut-on adapter l'analyse à nos critères internes ?",
        a: "Oui. Vos règles de qualification — seuils, certifications exigées, zones d'intervention, typologies de marché — sont paramétrées avec notre équipe et appliquées automatiquement à chaque nouvelle consultation.",
      },
    ],
  },
  "memoire-technique": {
    slug: "memoire-technique",
    eyebrow: "Mémoire technique",
    title: "Des mémoires techniques convaincants, sans page blanche",
    description:
      "Générez un mémoire technique structuré sur les critères de l'AO, à partir de votre base de connaissances. Vos équipes affinent au lieu de partir de zéro.",
    intro:
      "MateriaBTP analyse les critères d'évaluation de l'AO, construit le sommaire qui y répond point par point, puis rédige chaque section à partir de votre savoir-faire : méthodologies, références, certifications, moyens. Vos rédacteurs partent d'un premier jet solide, pas d'une page blanche.",
    benefits: [
      {
        title: "Structuré sur les critères de l'acheteur",
        description:
          "Le sommaire est construit à partir de la pondération et des attentes du règlement de consultation. Chaque exigence trouve sa réponse, rien n'est oublié, rien n'est hors sujet.",
      },
      {
        title: "Rédigé avec votre matière, pas du générique",
        description:
          "Les sections s'appuient sur votre base de connaissances : vos méthodologies, vos chantiers de référence, vos certifications. Le résultat vous ressemble et reste différenciant.",
      },
      {
        title: "Un premier jet en minutes, pas en jours",
        description:
          "La première version d'une réponse est générée en quelques minutes. Vos équipes consacrent leur temps à ce qui fait gagner : l'ajustement au contexte, les variantes, la relecture critique.",
      },
      {
        title: "Sources vérifiables en un clic",
        description:
          "Chaque passage rédigé pointe vers les documents de votre base qui l'ont alimenté. La relecture est rapide et le risque d'approximation maîtrisé.",
      },
    ],
    features: [
      "Sommaire généré à partir des critères d'évaluation et de leur pondération",
      "Rédaction section par section à partir de votre base de connaissances",
      "Édition collaborative : chaque section peut être affinée, réécrite, validée",
      "Traçabilité des sources pour chaque passage généré",
      "Export Word et PDF conforme à vos gabarits",
      "Couvre mémoires techniques, RFP, RFI, DDQ et questionnaires de sécurité",
    ],
    faq: [
      {
        q: "Le mémoire généré est-il prêt à déposer ?",
        a: "Non, et c'est volontaire : MateriaBTP produit un premier jet structuré et documenté que vos experts affinent. L'outil assiste vos équipes, il ne remplace pas leur expertise.",
      },
      {
        q: "Comment l'outil évite-t-il les réponses génériques ?",
        a: "La rédaction s'appuie exclusivement sur votre base de connaissances : vos méthodologies, vos références chantiers ou projets, vos moyens humains et matériels.",
      },
      {
        q: "Gérez-vous aussi les questionnaires type RFP ou DDQ ?",
        a: "Oui. Les questionnaires sont traités question par question, avec réponses sourcées depuis votre base et suivi du taux de couverture.",
      },
    ],
  },
  questionnaires: {
    slug: "questionnaires",
    eyebrow: "Questionnaires & DDQ",
    title: "Vos questionnaires de 400 lignes, traités en heures",
    description:
      "Répondez aux questionnaires RFP, RFI, DDQ, sécurité, RSE et RGPD : réponses sourcées depuis votre base, suivi du taux de couverture, export Excel.",
    intro:
      "RFP grands comptes, RFI, due diligence, questionnaires de sécurité, RSE ou RGPD : des centaines de questions, largement récurrentes d'un client à l'autre. MateriaBTP propose une réponse sourcée pour chaque ligne à partir de votre base de connaissances. Vos experts vérifient au lieu de réécrire.",
    benefits: [
      {
        title: "Une réponse proposée pour chaque question",
        description:
          "À partir de vos questionnaires passés et de votre documentation, PSSI, politiques, certifications, procédures, l'IA propose une réponse sourcée à chaque ligne.",
      },
      {
        title: "Le taux de couverture en temps réel",
        description:
          "Sur une grille de 400 lignes, vous savez à tout moment ce qui est traité, sourcé, validé, et ce qui attend un expert.",
      },
      {
        title: "Les experts sollicités au bon moment",
        description:
          "Les questions sans réponse fiable sont assignées au bon profil : RSSI, juridique, RSE. Sa réponse validée enrichit la base.",
      },
      {
        title: "Une mémoire qui se consolide",
        description:
          "Chaque campagne enrichit votre base de connaissances. Le prochain DDQ part de plus haut.",
      },
    ],
    features: [
      "Réponse sourcée à chaque question, vérifiable en un clic",
      "Couvre RFP, RFI, DDQ, questionnaires de sécurité, RSE et conformité RGPD",
      "Import des grilles au format Excel et restitution au même format",
      "Suivi du taux de couverture : traité, sourcé, validé, manquant",
      "Assignation des questions ouvertes aux bons experts",
      "Enrichissement continu de la base à partir des réponses validées",
    ],
    faq: [
      {
        q: "Quels types de questionnaires sont couverts ?",
        a: "RFP, RFI, DDQ, questionnaires de sécurité, évaluations fournisseurs, questionnaires RSE et conformité RGPD, au format Excel comme en document structuré.",
      },
      {
        q: "Comment garantir l'exactitude sur des sujets sensibles ?",
        a: "Chaque réponse proposée cite le document source de votre base. Rien ne part sans la validation de vos experts.",
      },
      {
        q: "Nos politiques évoluent, comment rester à jour ?",
        a: "Votre base de connaissances est la source unique : mettez à jour la politique une fois, et toutes les prochaines réponses s'appuient sur la version à jour.",
      },
    ],
  },
  "base-de-connaissances": {
    slug: "base-de-connaissances",
    eyebrow: "Base de connaissances",
    title: "Votre savoir-faire, centralisé et retrouvé en un clic",
    description:
      "Centralisez méthodologies, références, certifications et anciennes réponses dans une base unique, interrogeable par recherche sémantique en un clic.",
    intro:
      "Mémoires passés, méthodologies, fiches techniques, certifications, questions-réponses : tout ce que votre entreprise a déjà produit devient une base vivante, organisée et interrogeable. C'est elle qui alimente chaque nouvelle réponse.",
    benefits: [
      {
        title: "Une source unique de vérité",
        description: "Fini les réponses dispersées entre serveurs, boîtes mail et disques personnels. Toute la matière de l'entreprise est réunie.",
      },
      {
        title: "La recherche qui comprend la question",
        description:
          "La recherche sémantique retrouve le bon paragraphe même formulé autrement : posez la question comme un acheteur la poserait.",
      },
      {
        title: "Une base qui s'enrichit à chaque réponse",
        description: "Chaque nouvelle réponse validée vient nourrir la base. Plus vous répondez, plus la qualité augmente.",
      },
      {
        title: "Opérationnelle en 48 heures",
        description: "Déposez vos documents dans tous les formats, notre équipe structure la base avec vous.",
      },
    ],
    features: [
      "Dossiers et sous-dossiers personnalisables selon votre organisation",
      "Import de tous formats : Word, PDF, Excel, anciennes réponses complètes",
      "Recherche sémantique avec remontée de la source exacte",
      "Centralisation des certifications, méthodologies, références et Q/R",
      "Alimentation continue à partir des réponses validées",
      "Droits d'accès par équipe et par dossier",
    ],
    faq: [
      {
        q: "Combien de temps faut-il pour structurer notre base ?",
        a: "Deux jours dans la plupart des cas. Jour 1 : dépôt et structuration. Jour 2 : première réponse générée.",
      },
      {
        q: "Quels types de documents peut-on importer ?",
        a: "Mémoires techniques passés, réponses à questionnaires, méthodologies, fiches techniques, attestations et certifications, politiques RSE.",
      },
      {
        q: "Où sont hébergées nos données ?",
        a: "En France, sur des serveurs qualifiés SecNumCloud, 100 % conformes RGPD et souverains.",
      },
    ],
  },
  collaboration: {
    slug: "collaboration",
    eyebrow: "Collaboration & pilotage",
    title: "Pilotez chaque réponse, du Go/No-Go au dépôt",
    description:
      "Assignez les sections, suivez l'avancement par appel d'offres et par contributeur en temps réel, et déposez chaque dossier à l'heure, complet et conforme.",
    intro:
      "Une réponse à un AO mobilise toujours plusieurs personnes, internes et parfois externes. MateriaBTP orchestre ce travail : chacun sait ce qu'il doit produire, vous voyez où en est chaque dossier, et plus rien ne part à la dernière minute.",
    benefits: [
      {
        title: "Chaque section a un responsable",
        description:
          "Assignez les sections du mémoire ou les questions du RFP à des contributeurs internes ou externes.",
      },
      {
        title: "L'avancement visible en temps réel",
        description:
          "Le dashboard montre l'état de chaque réponse en cours : sections rédigées, en attente, validées, taux de couverture.",
      },
      {
        title: "Le suivi par exigence",
        description: "Chaque exigence du cahier des charges est tracée individuellement jusqu'à sa réponse.",
      },
      {
        title: "Des échéances tenues",
        description: "Dates limites, jalons internes de relecture, alertes sur les sections en retard.",
      },
    ],
    features: [
      "Assignation de sections à des contributeurs internes ou externes",
      "Accès restreint pour les intervenants extérieurs",
      "Dashboard temps réel : avancement par AO, RFP, RFI et par contributeur",
      "Suivi exigence par exigence avec taux de couverture",
      "Commentaires et validation section par section",
      "Historique des versions et des contributions",
    ],
    faq: [
      {
        q: "Peut-on faire intervenir un sous-traitant ou un partenaire ?",
        a: "Oui. Vous pouvez inviter un contributeur externe sur une ou plusieurs sections précises : il ne voit que ce qui lui est assigné.",
      },
      {
        q: "Comment suivre plusieurs réponses en parallèle ?",
        a: "Le dashboard agrège toutes les consultations en cours : échéances, avancement, contributeurs mobilisés.",
      },
      {
        q: "Est-ce adapté à une petite équipe ?",
        a: "Oui. Même à deux ou trois, le suivi par exigence évite les oublis et les doubles saisies.",
      },
    ],
  },
};

export const produitSlugs = Object.keys(produitPages);
