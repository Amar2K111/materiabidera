# BIDERA

Plateforme d'aide à la réponse aux appels d'offres pour les entreprises du BTP.

Du DCE au mémoire technique exporté : analyse des pièces, extraction des
exigences avec leur source, décision Go/No-Go argumentée, stratégie de réponse,
rédaction assistée et contrôle avant remise.

---

## Mise en service

### 1. Dépendances

```bash
npm install
```

### 2. Base de données

Créez un projet sur [supabase.com](https://supabase.com), puis exécutez les
migrations **dans l'ordre**, depuis l'éditeur SQL du tableau de bord :

```
supabase/migrations/0001_foundation.sql
supabase/migrations/0002_projects.sql
supabase/migrations/0003_analysis.sql
supabase/migrations/0004_company.sql
supabase/migrations/0005_decision.sql
supabase/migrations/0006_memory.sql
supabase/migrations/0007_quality.sql
```

Ces migrations créent aussi trois buckets de stockage privés : `dce` pour les
pièces des consultations, `entreprise` pour vos documents, `exports` pour les
mémoires produits. Aucun fichier déposé n'est lisible en dehors de son
organisation.

### 3. Variables d'environnement

```bash
cp .env.example .env.local
```

Renseignez au minimum :

| Variable | Où la trouver |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project Settings, API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase, Project Settings, API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase, Project Settings, API |

La clé de service contourne les règles de sécurité de la base. Elle ne doit
jamais porter le préfixe `NEXT_PUBLIC_` ni être exposée au navigateur.

Pour activer l'analyse des documents, ajoutez un moteur :

```bash
AI_PROVIDER=anthropic      # ou "gemini"
ANTHROPIC_API_KEY=...      # ou GEMINI_API_KEY=...
```

Sans moteur configuré, l'application fonctionne : dépôt, classement et gestion
des dossiers restent disponibles. Les écrans d'analyse affichent alors un état
« non configuré » explicite. Rien n'est simulé.

### 4. Lancement

```bash
npm run dev
```

- `/` sert la landing page.
- `/signup` crée un compte, puis l'application démarre sur `/app`.

---

## Organisation du code

```
src/app/page.tsx             Landing page Next.js (/)
public/landing.html          Copie statique de secours
src/app/                     Routes Next.js
  app/                       Application authentifiée (/app)
  api/projects/[id]/         Pipeline d'ingestion et d'analyse
src/components/ui/           Socle d'interface
src/components/app/          Composants métier
src/lib/ai/                  Couche fournisseur IA et prompts
src/lib/extraction/          Lecture des PDF, DOCX et tableurs
src/lib/services/            Ingestion et analyse
src/lib/data/                Requêtes serveur
supabase/migrations/         Schéma et règles de sécurité
```

---

## Principes tenus dans le code

**Rien n'est simulé.** Une fonction non configurée affiche son état réel. Les
compteurs valent zéro quand ils valent zéro, et un tiret quand la mesure n'a pas
encore eu lieu.

**Tout est traçable.** Le texte est extrait page par page. Le moteur d'analyse
ne manipule que des identifiants d'extraits, jamais des numéros de page : une
citation ne peut donc pas être fabriquée. Un identifiant inconnu est ignoré.

**Rien n'est inventé.** Les prompts interdisent explicitement toute invention de
chiffre, référence, qualification ou délai. Une information absente est
signalée comme absente.

**L'isolation est portée par la base.** Chaque table métier porte une colonne
`organization_id` et une règle d'accès. Le seul chemin privilégié passe par une
vérification d'appartenance préalable.

**L'humain décide.** Statuts, exigences et informations restent modifiables. Les
exigences ajoutées à la main survivent à une nouvelle analyse.

---

## Vérifications

```bash
npm run typecheck
npm run build
```
