# BIDERA — PROMPT MAÎTRE CLAUDE CODE

## Construction complète du SaaS V1 commercial

Tu es un **Senior Full-Stack Engineer, Product Designer SaaS B2B, Architecte logiciel et AI Engineer spécialisé dans les applications professionnelles**.

Tu travailles sur un projet existant nommé **BIDERA**.

Ta mission est de transformer le projet actuel en un **véritable SaaS B2B commercial spécialisé dans les entreprises du BTP qui répondent aux appels d'offres**, et non en simple prototype ou landing page.

---

# 0. RÈGLE ABSOLUE

Avant de modifier quoi que ce soit :

1. Analyse intégralement le projet existant.
2. Analyse son architecture.
3. Analyse package.json.
4. Analyse les routes existantes.
5. Analyse les composants.
6. Analyse les styles.
7. Analyse les variables d'environnement attendues.
8. Analyse la landing page existante.
9. Identifie ce qui peut être réutilisé.
10. Identifie ce qui doit être amélioré.
11. Ne détruis jamais inutilement ce qui fonctionne déjà.
12. Ne remplace pas toute l'architecture simplement parce qu'une autre architecture te paraît plus élégante.

La landing page BIDERA existante doit être **préservée et améliorée uniquement si nécessaire**.

Le logiciel doit devenir une application séparée et clairement accessible depuis le CTA principal de la landing page.

---

# 1. VISION PRODUIT

BIDERA n'est PAS :

* un simple chatbot ;
* un simple générateur de texte ;
* un simple lecteur de PDF ;
* un clone générique de ChatGPT ;
* un générateur automatique de mémoire sans vérification.

BIDERA est :

> **La plateforme IA spécialisée BTP qui transforme un DCE complexe en une stratégie de réponse, un mémoire technique personnalisé et une réponse vérifiée avant remise.**

Le produit doit accompagner l'utilisateur de :

DCE

↓

ANALYSE

↓

GO / NO-GO

↓

EXIGENCES

↓

STRATÉGIE

↓

BASE ENTREPRISE

↓

MÉMOIRE TECHNIQUE

↓

CONTRÔLE

↓

EXPORT WORD / PDF

---

# 2. POSITIONNEMENT

Le logiciel cible principalement :

* entreprises de BTP ;
* PME du bâtiment ;
* entreprises de travaux publics ;
* entreprises générales ;
* entreprises spécialisées par lot ;
* entreprises répondant aux marchés publics ou privés ;
* responsables appels d'offres ;
* chargés d'études ;
* dirigeants de PME BTP.

Le produit doit comprendre le vocabulaire et les besoins du BTP français.

Exemples de documents :

* RC
* règlement de consultation
* CCTP
* CCAP
* acte d'engagement
* DPGF
* BPU
* plans
* annexes
* cadres de mémoire
* pièces administratives
* documents techniques
* anciens mémoires techniques
* références chantier
* CV
* certifications
* qualifications
* documents QSE

---

# 3. STACK TECHNIQUE

Utilise en priorité :

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui ou composants équivalents
* Lucide Icons

## Backend

* Next.js
* Server Actions lorsque pertinent
* API routes lorsque nécessaire

## Auth

Supabase Auth.

Prévoir :

* email/password ;
* connexion Google si facilement intégrable ;
* gestion de session ;
* logout ;
* protection des routes privées.

## Database

Supabase PostgreSQL.

## Storage

Supabase Storage.

Les fichiers DCE et documents entreprise doivent être stockés de manière sécurisée.

## Vector search

pgvector si disponible.

Préparer l'architecture pour du RAG.

## IA

Construire une couche AI provider abstraite.

NE PAS hardcoder toute l'application autour d'un seul fournisseur.

Prévoir une architecture permettant d'utiliser un modèle Gemini ou autre LLM compatible.

Les clés API doivent uniquement être côté serveur.

## Paiement

Préparer l'architecture Stripe, mais ne bloque pas le développement V1 si les clés Stripe ne sont pas encore configurées.

## Export

Prévoir :

* DOCX
* PDF

---

# 4. ARCHITECTURE MULTI-TENANT

BIDERA est un SaaS B2B.

Une entreprise = une organisation.

Architecture :

organization

↓

members

↓

projects

↓

documents

↓

requirements

↓

analysis

↓

strategy

↓

memory

↓

quality checks

↓

exports

Toutes les données doivent être isolées par organization_id.

Utiliser les Row Level Security policies de Supabase.

Un utilisateur ne doit JAMAIS pouvoir accéder aux données d'une autre organisation.

La sécurité des données entreprise est une priorité absolue.

---

# 5. NAVIGATION DE L'APPLICATION

Créer une vraie application SaaS avec une sidebar.

Navigation principale :

* Dashboard
* Dossiers
* Base entreprise
* Bibliothèque
* Paramètres

Dans un dossier :

* Vue d'ensemble
* Documents
* Analyse
* Go / No-Go
* Exigences
* Stratégie
* Mémoire technique
* Contrôle qualité
* Checklist
* Export

La navigation doit être cohérente et persistante.

---

# 6. DESIGN SYSTEM

Le design doit être **premium SaaS B2B**, comparable au niveau de finition de produits modernes comme Tenderbolt, mais sans copier leur identité graphique ou leurs textes.

Design BIDERA :

* majorité blanc ;
* noir pour le texte ;
* bleu comme couleur principale d'action ;
* très peu de couleurs ;
* beaucoup d'espace blanc ;
* cartes propres ;
* bordures fines ;
* ombres très légères ;
* typographie moderne ;
* hiérarchie visuelle forte ;
* aucune interface surchargée.

Couleur principale :

#0035A9

Utiliser les couleurs de statut uniquement lorsque nécessaire :

* vert = validé / bon ;
* orange = attention ;
* rouge = problème.

Éviter les gradients excessifs.

Éviter les effets "AI gimmick".

L'application doit ressembler à un **outil professionnel utilisé quotidiennement par une entreprise de BTP**.

---

# 7. DASHBOARD

Créer un dashboard professionnel.

Afficher :

## Header

Bonjour, [Nom entreprise]

Sous-titre :

> Voici l'état de vos réponses aux appels d'offres.

CTA :

**+ Nouveau dossier**

## Statistiques

* Dossiers actifs
* Dossiers à traiter
* Mémoires en cours
* Échéances proches

## Dossiers récents

Chaque dossier affiche :

* nom du marché ;
* acheteur ;
* lot ;
* deadline ;
* statut ;
* score Go/No-Go ;
* progression du mémoire ;
* dernière activité.

Exemple :

Réhabilitation du groupe scolaire

Lot 03 — Enveloppe

GO — 82/100

Mémoire 64 %

18 jours restants

---

# 8. CRÉATION D'UN DOSSIER

Créer un workflow simple.

Étape 1 :

Nom du projet

Référence

Acheteur / maître d'ouvrage

Lot

Date limite

Étape 2 :

Upload DCE.

Formats :

* PDF
* DOCX
* XLSX
* ZIP

Interface drag & drop premium.

Après upload :

Afficher une progression réelle.

Exemple :

Analyse du DCE...

✓ Fichiers reçus

✓ Documents identifiés

✓ Texte extrait

✓ Documents classifiés

✓ Exigences détectées

✓ Critères analysés

✓ Risques détectés

✓ Analyse terminée

NE PAS simuler une progression si aucune analyse n'est réellement effectuée.

---

# 9. PIPELINE D'INGESTION DES DOCUMENTS

Créer une architecture robuste.

Pipeline :

Upload

↓

Storage sécurisé

↓

Identification du fichier

↓

Extraction texte

↓

OCR si nécessaire

↓

Détection des pages

↓

Classification du document

↓

Chunking intelligent

↓

Indexation

↓

Embeddings

↓

Recherche RAG

Les documents doivent conserver leurs métadonnées :

* nom ;
* type ;
* page ;
* section ;
* source ;
* projet ;
* organization_id.

Chaque information extraite doit pouvoir être reliée à sa source.

Exemple :

RC.pdf — page 18.

---

# 10. VUE D'ENSEMBLE DU DCE

Après analyse :

Afficher :

## Résumé

* nombre de documents ;
* nombre de pages ;
* nombre d'exigences ;
* nombre de risques ;
* nombre de jours avant remise.

Puis :

### Informations clés

* objet du marché ;
* montant si identifiable ;
* acheteur ;
* lot ;
* date limite ;
* durée ;
* critères d'attribution ;
* variantes ;
* visite obligatoire ;
* exigences importantes.

Puis :

### Points de vigilance

Exemples :

* attestation manquante ;
* exigence inhabituelle ;
* pénalité importante ;
* délai court ;
* référence spécifique demandée ;
* interface technique importante.

Toutes les informations importantes doivent être accompagnées de leurs sources lorsque possible.

---

# 11. GO / NO-GO

Créer une page premium dédiée.

Afficher un score :

# 82 / 100

Statut :

# GO

Mais le score doit être EXPLICABLE.

Facteurs :

* adéquation technique ;
* capacités de l'entreprise ;
* expérience ;
* critères gagnables ;
* délai ;
* risques contractuels ;
* exigences administratives ;
* contraintes chantier.

Chaque facteur doit avoir :

* score ;
* justification ;
* sources ;
* niveau de confiance.

Exemple :

### Adéquation technique

91/100

> L'entreprise dispose de 4 références similaires au projet.

Sources :

Référence entreprise X

Ancien mémoire Y

---

# 12. IMPORTANT — PAS DE SCORE MAGIQUE

Ne jamais présenter une note IA comme une vérité objective.

Afficher clairement :

> Analyse indicative générée par BIDERA à partir des documents disponibles.

Les utilisateurs doivent pouvoir comprendre et modifier les éléments ayant conduit au score.

---

# 13. MATRICE DES EXIGENCES

Créer une interface table professionnelle.

Colonnes :

* Exigence
* Catégorie
* Source
* Réponse
* Statut
* Priorité

Statuts :

🟢 Couvert

🟠 À traiter

🔴 Manquant

Chaque exigence doit avoir :

* texte ;
* source ;
* page ;
* catégorie ;
* réponse attendue ;
* réponse actuelle ;
* statut.

Cliquer sur une exigence ouvre un panneau latéral.

Exemple :

> Le candidat devra présenter trois références similaires.

Source :

RC.pdf — page 21.

BIDERA trouve :

✓ Référence 1

✓ Référence 2

⚠ Référence 3 manquante

---

# 14. BASE ENTREPRISE

Créer une section majeure :

# Base entreprise

Cette section est le cerveau permanent de BIDERA.

Catégories :

## Présentation

* présentation ;
* histoire ;
* positionnement ;
* zones d'intervention.

## Références

Pour chaque référence :

* nom ;
* client ;
* année ;
* montant ;
* type de travaux ;
* lot ;
* contraintes ;
* description ;
* documents associés.

## Équipe

* nom ;
* fonction ;
* expérience ;
* compétences ;
* certifications ;
* CV.

## Matériel

* type ;
* quantité ;
* caractéristiques ;
* disponibilité.

## Certifications

* certification ;
* numéro si pertinent ;
* date ;
* document justificatif.

## Qualifications

* qualification ;
* domaine ;
* justificatif.

## Méthodes

* méthodologies chantier ;
* procédures ;
* qualité ;
* sécurité ;
* environnement.

## Documents

Permettre l'import d'anciens documents.

---

# 15. BIBLIOTHÈQUE

Créer une bibliothèque de connaissances.

Filtres :

* Références
* Mémoires
* Méthodes
* CV
* Certifications
* QSE
* Matériel
* Documents entreprise

Chaque document doit pouvoir être utilisé comme source par l'IA.

---

# 16. MATCHING ENTRE DCE ET ENTREPRISE

Fonction essentielle.

Quand BIDERA analyse un DCE :

il doit chercher automatiquement dans la base entreprise :

* références similaires ;
* compétences ;
* certifications ;
* moyens humains ;
* moyens matériels ;
* méthodes ;
* documents pertinents.

Exemple :

DCE demande :

> Réalisation d'une réhabilitation en site occupé.

BIDERA trouve :

> Référence : École Jean Moulin — 2025.

Puis propose cette référence dans le mémoire.

---

# 17. STRATÉGIE DE RÉPONSE

Avant de générer le mémoire, créer une stratégie.

Afficher :

## Critères d'attribution

Exemple :

Valeur technique — 60 %

Prix — 40 %

Puis analyser le sous-découpage lorsque disponible.

Créer :

### Priorités de réponse

1. Méthodologie
2. Organisation
3. Gestion des interfaces
4. Sécurité
5. Environnement

Puis :

### Recommandations BIDERA

Exemple :

> Le site étant occupé pendant les travaux, la réponse doit mettre fortement en avant la maîtrise des flux, la sécurisation des zones de travaux et la continuité d'exploitation.

Chaque recommandation doit être reliée aux éléments du DCE.

---

# 18. PLAN DU MÉMOIRE

Ne jamais utiliser un template fixe pour tous les appels d'offres.

Le plan doit être généré en fonction :

* du RC ;
* du CCTP ;
* des critères de notation ;
* du cadre de mémoire fourni ;
* des exigences ;
* des spécificités du marché.

Exemple :

01 — Compréhension du projet

02 — Méthodologie d'intervention

03 — Organisation du chantier

04 — Moyens humains

05 — Moyens matériels

06 — Gestion des interfaces

07 — Qualité

08 — Sécurité

09 — Environnement

10 — Planning

Mais le plan doit changer lorsque le DCE le nécessite.

---

# 19. ÉDITEUR DU MÉMOIRE

Créer un vrai espace d'édition.

Layout :

SIDEBAR GAUCHE

Plan du mémoire.

CENTRE

Éditeur.

SIDEBAR DROITE

Sources + outils IA.

Fonctions :

* modifier texte ;
* ajouter section ;
* supprimer section ;
* déplacer section ;
* générer section ;
* régénérer ;
* améliorer ;
* raccourcir ;
* développer ;
* rendre plus concret ;
* vérifier ;
* afficher les sources.

---

# 20. SOURCES

Chaque section générée doit pouvoir afficher les sources utilisées.

Exemple :

### Sources

CCTP.pdf — p.43

RC.pdf — p.18

Référence entreprise — École Jean Moulin

Ancien mémoire — section 4

Cliquer sur une source doit afficher les informations pertinentes.

---

# 21. RÈGLE ANTI-HALLUCINATION

L'IA ne doit jamais inventer :

* chiffre ;
* qualification ;
* certification ;
* effectif ;
* matériel ;
* référence ;
* expérience ;
* délai ;
* client ;
* chantier ;
* résultat.

Si une information n'est pas trouvée :

dire :

> Information non trouvée dans les sources disponibles.

Ou :

> Information à confirmer.

Ne jamais remplir automatiquement avec une invention.

---

# 22. CONTRÔLE QUALITÉ

Créer une page :

# Contrôle qualité

Score global :

91/100

Sous-scores :

* couverture des exigences ;
* alignement aux critères ;
* personnalisation ;
* précision ;
* traçabilité ;
* informations vérifiées.

Puis :

## Problèmes détectés

Exemple :

🔴 Exigence non traitée

RC.pdf — page 21

🟠 Réponse trop générique

CCTP.pdf — page 43

🟠 Source insuffisante

Chapitre 6

🔴 Information non vérifiée

Chapitre 8

Chaque problème doit avoir une action :

**Corriger**

---

# 23. CHECKLIST FINALE

Créer :

# Checklist avant remise

Sections :

### Administratif

* acte d'engagement ;
* attestations ;
* assurances ;
* qualifications.

### Technique

* mémoire ;
* références ;
* moyens humains ;
* moyens matériels ;
* méthodologie ;
* planning ;
* environnement ;
* sécurité.

### Contrôle

* exigences couvertes ;
* informations vérifiées ;
* sources présentes ;
* documents obligatoires.

Afficher :

# PRÊT À DÉPOSER

uniquement lorsque les contrôles définis sont satisfaits.

Sinon :

# 3 POINTS À CORRIGER

---

# 24. EXPORT WORD / PDF

Créer un export professionnel.

Word :

* couverture ;
* logo ;
* titre ;
* sommaire ;
* titres hiérarchisés ;
* tableaux ;
* pagination ;
* en-têtes ;
* pieds de page ;
* styles cohérents.

PDF doit reprendre le même rendu.

Permettre :

**Télécharger Word**

**Télécharger PDF**

---

# 25. ÉTATS D'UN DOSSIER

Utiliser un système clair :

DRAFT

ANALYZING

ANALYZED

GO

NO_GO

STRATEGY_READY

WRITING

REVIEW

READY

EXPORTED

Les statuts doivent être persistés en base.

---

# 26. GESTION DES ERREURS

Une vraie application commerciale doit gérer :

* upload échoué ;
* PDF illisible ;
* document vide ;
* OCR impossible ;
* API IA indisponible ;
* timeout ;
* export impossible ;
* session expirée ;
* permissions insuffisantes.

Ne jamais afficher une erreur technique brute à l'utilisateur.

Afficher des messages compréhensibles.

---

# 27. LOADING STATES

Chaque action longue doit avoir un état visuel.

Exemples :

Analyse du DCE...

Génération du plan...

Recherche dans votre base entreprise...

Rédaction du chapitre...

Contrôle des exigences...

Préparation du document...

Ne pas bloquer toute l'interface inutilement.

---

# 28. RESPONSIVE

Desktop-first car cible B2B.

Mais l'application doit rester utilisable :

* tablette ;
* mobile.

Sur mobile, simplifier les tableaux et sidebars.

---

# 29. DATABASE

Créer les tables nécessaires.

Minimum :

organizations

organization_members

projects

project_documents

document_pages

document_chunks

requirements

requirement_sources

go_no_go_analyses

go_no_go_factors

company_profiles

company_references

company_employees

company_equipment

company_certifications

company_qualifications

company_methods

company_documents

memory_projects

memory_sections

memory_sources

quality_checks

quality_issues

checklists

exports

subscriptions

ai_runs

Créer les foreign keys.

Créer les indexes nécessaires.

Créer les RLS policies.

---

# 30. AI RUNS

Chaque opération IA importante doit être traçable.

Exemple :

ai_runs

* organization_id
* project_id
* operation
* model
* status
* input metadata
* output metadata
* created_at
* duration

Ne pas stocker inutilement des données sensibles dans les logs.

---

# 31. ARCHITECTURE IA

Créer des services séparés logiquement.

Exemple :

DocumentAnalyzer

RequirementExtractor

GoNoGoAnalyzer

CompanyMatcher

TenderStrategist

MemoryPlanner

MemoryWriter

ComplianceChecker

HallucinationChecker

FinalReviewer

Ils peuvent utiliser le même LLM.

Le but est de séparer les responsabilités.

---

# 32. RAG

Le RAG doit pouvoir chercher dans :

1. DCE du projet actuel ;
2. Base entreprise ;
3. références ;
4. anciens mémoires ;
5. documents techniques autorisés.

Chaque résultat doit conserver :

* source ;
* page ;
* document ;
* score de pertinence.

Ne pas permettre à une entreprise d'utiliser accidentellement les documents d'une autre organisation.

---

# 33. PROMPTS IA

Ne pas mettre tous les prompts directement dans les composants React.

Créer une architecture claire pour les prompts.

Chaque prompt doit avoir :

* rôle ;
* objectif ;
* contexte ;
* sources ;
* règles ;
* format de sortie ;
* interdiction d'invention.

Favoriser des sorties structurées JSON lorsque nécessaire.

Valider les sorties avant de les sauvegarder.

---

# 34. SÉCURITÉ

Priorité absolue.

* secrets uniquement serveur ;
* RLS ;
* validation des fichiers ;
* limites de taille ;
* validation MIME ;
* noms de fichiers sécurisés ;
* protection des routes ;
* permissions organisationnelles ;
* aucune clé API exposée côté client.

---

# 35. UX

L'utilisateur doit toujours savoir :

1. Où il se trouve.
2. Ce que BIDERA est en train de faire.
3. Ce qui a été trouvé.
4. Ce qui est fiable.
5. Ce qui nécessite son intervention.
6. Quelle est la prochaine action.

Ne jamais créer une interface où l'utilisateur ne comprend pas quoi faire.

---

# 36. PRINCIPLE "HUMAN IN THE LOOP"

BIDERA assiste l'entreprise.

BIDERA ne décide pas à sa place.

L'utilisateur doit pouvoir :

* modifier le Go/No-Go ;
* modifier les exigences ;
* corriger les informations ;
* choisir les références ;
* modifier le plan ;
* modifier le mémoire ;
* valider les corrections ;
* exporter.

L'IA propose.

L'humain valide.

---

# 37. NE PAS FAIRE SEMBLANT

Règle critique :

NE JAMAIS créer de fausses fonctionnalités.

Si une API n'est pas configurée :

afficher un état propre et prévoir l'intégration.

Ne pas simuler :

* une vraie analyse ;
* un vrai score ;
* un vrai export ;
* un vrai upload ;
* un vrai RAG.

Les données de démonstration peuvent exister uniquement dans un mode explicitement identifiable comme démo.

---

# 38. DONNÉES DE DÉMONSTRATION

Pour rendre l'application belle immédiatement après installation, créer éventuellement un dossier exemple :

"Réhabilitation du groupe scolaire Jean Moulin"

Mais indiquer clairement :

**Dossier exemple**

Ne jamais mélanger données de démonstration et données utilisateur réelles.

---

# 39. ONBOARDING

À la première connexion :

Étape 1 :

Nom de l'entreprise

Étape 2 :

Type d'activité BTP

Étape 3 :

Présentation

Étape 4 :

Importer les premiers documents entreprise

Étape 5 :

Ajouter quelques références

Puis :

> Votre base entreprise est prête.

---

# 40. PREMIER DOSSIER

Après onboarding :

CTA principal :

**Analyser mon premier DCE**

Le produit doit immédiatement guider l'utilisateur vers :

Upload DCE

↓

Analyse

↓

Résultat.

---

# 41. LANDING PAGE → APP

Le CTA principal de la landing page :

**Analyser mon prochain DCE**

doit conduire vers l'inscription / connexion puis l'application.

Préserver le design existant.

Ne pas créer une deuxième identité visuelle.

---

# 42. EMPTY STATES

Chaque page vide doit expliquer :

* ce qu'elle contient ;
* pourquoi c'est utile ;
* comment commencer.

Exemple Base entreprise :

> Ajoutez vos références, certifications, méthodes et documents pour permettre à BIDERA de produire des réponses réellement adaptées à votre entreprise.

CTA :

**Ajouter un document**

---

# 43. TOASTS ET FEEDBACK

Utiliser des notifications discrètes :

✓ Dossier créé

✓ Document importé

✓ Analyse terminée

✓ Référence ajoutée

✓ Chapitre généré

✓ Export terminé

---

# 44. PERFORMANCE

Ne pas charger inutilement :

* gros documents ;
* listes complètes ;
* données inutilisées.

Utiliser :

* pagination ;
* lazy loading ;
* streaming lorsque pertinent ;
* traitement asynchrone pour les analyses longues.

---

# 45. ARCHITECTURE DE CODE

Je préfère une architecture simple et maintenable.

Éviter :

* abstraction inutile ;
* dizaines de fichiers pour une petite fonctionnalité ;
* dépendances inutiles ;
* architecture enterprise disproportionnée.

Mais ne pas tout mettre dans un seul fichier.

Chaque module doit avoir une responsabilité claire.

---

# 46. PRIORITÉ DE DÉVELOPPEMENT

Construis dans cet ordre :

## PHASE 1

Foundation

* architecture ;
* Supabase ;
* auth ;
* organizations ;
* navigation ;
* design system.

## PHASE 2

Dossiers

* dashboard ;
* création dossier ;
* upload ;
* documents.

## PHASE 3

Analyse

* extraction ;
* classification ;
* analyse DCE ;
* exigences ;
* sources.

## PHASE 4

Go / No-Go

* score ;
* facteurs ;
* justification ;
* sources.

## PHASE 5

Base entreprise

* profil ;
* références ;
* équipe ;
* matériel ;
* certifications ;
* documents.

## PHASE 6

IA

* matching ;
* stratégie ;
* plan ;
* génération mémoire.

## PHASE 7

Éditeur

* plan ;
* édition ;
* sources ;
* actions IA.

## PHASE 8

Contrôle

* exigences ;
* qualité ;
* hallucinations ;
* problèmes.

## PHASE 9

Finalisation

* checklist ;
* Word ;
* PDF.

## PHASE 10

Polish

* responsive ;
* loading ;
* erreurs ;
* empty states ;
* UX ;
* performance ;
* sécurité.

---

# 47. IMPORTANT — TRAVAILLER PAR ÉTAPES

Ne tente pas de générer tout le projet en une seule modification gigantesque.

Travaille par phases.

Après chaque phase :

1. Vérifie le build.
2. Vérifie TypeScript.
3. Vérifie les imports.
4. Vérifie les routes.
5. Vérifie les données.
6. Vérifie les erreurs.
7. Corrige les problèmes.
8. Puis passe à la phase suivante.

Commande mentale :

> Build → Test → Fix → Continue.

---

# 48. QUALITÉ VISUELLE

Chaque écran doit être suffisamment travaillé pour pouvoir être montré à un prospect.

Je veux :

* alignements parfaits ;
* spacing cohérent ;
* boutons cohérents ;
* typographie cohérente ;
* tableaux lisibles ;
* cartes élégantes ;
* sidebar premium ;
* états de chargement ;
* feedback utilisateur ;
* responsive.

Aucun écran ne doit donner l'impression d'être une page générée automatiquement.

---

# 49. COPYWRITING

L'interface doit utiliser un langage B2B professionnel français.

Éviter :

"✨ Magic AI"

"Generate amazing stuff"

"Super intelligent AI"

Préférer :

"Analyser le DCE"

"Identifier les exigences"

"Évaluer l'opportunité"

"Construire la stratégie"

"Générer le mémoire"

"Contrôler la conformité"

"Exporter la réponse"

---

# 50. MÉTRIQUES À AFFICHER

Les métriques doivent être utiles.

Exemples :

24 documents

487 pages

86 exigences

12 points de vigilance

82/100 Go/No-Go

96 % exigences couvertes

91/100 qualité du mémoire

64 % progression

18 jours avant remise

Ne pas inventer les données sur les vrais dossiers.

---

# 51. PRODUIT FINAL ATTENDU

À la fin du développement, un utilisateur doit pouvoir faire réellement :

Créer son compte

↓

Créer son entreprise

↓

Ajouter ses références/documents

↓

Créer un appel d'offres

↓

Uploader un DCE

↓

Lancer l'analyse

↓

Voir le résumé

↓

Voir les exigences

↓

Obtenir un Go/No-Go explicable

↓

Voir les risques

↓

Voir les éléments de sa base entreprise pertinents

↓

Obtenir une stratégie

↓

Obtenir un plan de mémoire

↓

Générer son mémoire

↓

Modifier son mémoire

↓

Voir les sources

↓

Lancer le contrôle qualité

↓

Corriger les problèmes

↓

Valider la checklist

↓

Télécharger Word

↓

Télécharger PDF

C'est le cœur de BIDERA V1.

---

# 52. CE QUI FAIT LA VALEUR DE BIDERA

Le produit doit donner cette impression :

> "BIDERA comprend mon appel d'offres, comprend mon entreprise et m'aide à construire une réponse vérifiable."

Pas :

> "BIDERA écrit du texte avec une IA."

La différence est fondamentale.

---

# 53. AVANT DE CODER

Commence par inspecter le repository.

Puis donne-moi un court rapport :

1. Architecture actuelle.
2. Stack actuelle.
3. Ce qui est déjà fonctionnel.
4. Ce qui doit être conservé.
5. Ce qui doit être créé.
6. Risques techniques.
7. Plan de migration.

NE MODIFIE PAS encore le code si tu détectes une architecture importante que tu dois comprendre.

Après cette analyse, commence l'implémentation.

---

# 54. RÈGLE FINALE

À chaque décision technique, pose-toi cette question :

> "Est-ce que cette décision rapproche BIDERA d'un SaaS BTP professionnel réellement vendable ?"

Si oui → fais-le.

Si c'est seulement de la complexité technique inutile → ne le fais pas.

Si une fonctionnalité n'est pas nécessaire à la V1 → reporte-la.

Priorités absolues :

1. Fiabilité.
2. Sécurité.
3. UX.
4. Traçabilité.
5. Qualité des réponses.
6. Performance.
7. Design premium.
8. Simplicité.

Construis **BIDERA V1 comme un véritable produit SaaS commercial**, pas comme une démonstration technique.
