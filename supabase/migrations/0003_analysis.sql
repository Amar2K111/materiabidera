-- =============================================================================
-- BIDERA — Migration 0003 : texte extrait, analyse du DCE, exigences, traces IA
--
-- Regle structurante : toute information produite par l'analyse doit pouvoir
-- remonter a un emplacement precis dans un document depose. C'est le role des
-- tables document_pages et requirement_sources.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Texte extrait, decoupe par unite citable
--
-- page_number n'est renseigne que lorsque le format est reellement pagine
-- (PDF). Pour un DOCX ou une feuille de tableur, il reste nul et seul le
-- libelle porte l'information : on ne fabrique jamais une pagination.
-- -----------------------------------------------------------------------------
create table if not exists public.document_pages (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,
  document_id     uuid not null references public.project_documents (id) on delete cascade,
  page_number     integer,
  label           text not null,
  content         text not null,
  char_count      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists document_pages_document_idx
  on public.document_pages (document_id, page_number);
create index if not exists document_pages_project_idx
  on public.document_pages (project_id);

-- -----------------------------------------------------------------------------
-- Analyse du DCE : une ligne par dossier
-- -----------------------------------------------------------------------------
create table if not exists public.dce_analyses (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  project_id       uuid not null references public.projects (id) on delete cascade unique,

  subject          text,
  buyer            text,
  lot              text,
  amount           text,
  duration         text,
  submission_date  text,
  variants         text,
  site_visit       text,

  -- Criteres d'attribution : [{ label, weight, detail, sources: [...] }]
  award_criteria   jsonb not null default '[]'::jsonb,
  -- Points de vigilance : [{ title, detail, severity, sources: [...] }]
  vigilance_points jsonb not null default '[]'::jsonb,

  provider         text,
  model            text,
  generated_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Exigences
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.requirement_category as enum (
    'ADMINISTRATIF',
    'TECHNIQUE',
    'MOYENS',
    'DELAI',
    'QSE',
    'FINANCIER',
    'REFERENCE',
    'AUTRE'
  );
exception
  when duplicate_object then null;
end
$do$;

do $do$
begin
  create type public.requirement_status as enum ('COVERED', 'TO_HANDLE', 'MISSING');
exception
  when duplicate_object then null;
end
$do$;

do $do$
begin
  create type public.requirement_priority as enum ('HIGH', 'MEDIUM', 'LOW');
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.requirements (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,

  text            text not null,
  category        public.requirement_category not null default 'AUTRE',
  priority        public.requirement_priority not null default 'MEDIUM',
  status          public.requirement_status not null default 'TO_HANDLE',

  -- Ce que la reponse doit apporter, et ce qui a effectivement ete repondu.
  expected_answer text,
  current_answer  text,

  -- Une exigence ajoutee a la main par l'utilisateur ne doit pas etre
  -- effacee par une nouvelle analyse (principe humain dans la boucle).
  is_manual       boolean not null default false,
  position        integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists requirements_project_idx
  on public.requirements (project_id, position);

-- -----------------------------------------------------------------------------
-- Sources d'une exigence : d'ou vient-elle exactement
-- -----------------------------------------------------------------------------
create table if not exists public.requirement_sources (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  requirement_id  uuid not null references public.requirements (id) on delete cascade,
  document_id     uuid references public.project_documents (id) on delete set null,
  page_number     integer,
  label           text,
  -- Extrait litteral du document, jamais une reformulation.
  quote           text,
  created_at      timestamptz not null default now()
);

create index if not exists requirement_sources_requirement_idx
  on public.requirement_sources (requirement_id);

-- -----------------------------------------------------------------------------
-- Traces des operations IA (section 30)
--
-- On enregistre le deroulement, pas le contenu : ni le texte des documents,
-- ni la reponse du modele n'y figurent.
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.ai_run_status as enum ('RUNNING', 'SUCCEEDED', 'FAILED');
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.ai_runs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid references public.projects (id) on delete cascade,

  operation       text not null,
  provider        text,
  model           text,
  status          public.ai_run_status not null default 'RUNNING',

  input_meta      jsonb not null default '{}'::jsonb,
  output_meta     jsonb not null default '{}'::jsonb,
  failure_reason  text,
  duration_ms     integer,

  created_at      timestamptz not null default now()
);

create index if not exists ai_runs_project_idx
  on public.ai_runs (project_id, created_at desc);
create index if not exists ai_runs_org_idx
  on public.ai_runs (organization_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
drop trigger if exists dce_analyses_touch on public.dce_analyses;
create trigger dce_analyses_touch before update on public.dce_analyses
  for each row execute function public.touch_updated_at();

drop trigger if exists requirements_touch on public.requirements;
create trigger requirements_touch before update on public.requirements
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.document_pages      enable row level security;
alter table public.dce_analyses        enable row level security;
alter table public.requirements        enable row level security;
alter table public.requirement_sources enable row level security;
alter table public.ai_runs             enable row level security;

-- Le texte extrait se lit, mais ne s'ecrit que cote serveur (pipeline).
drop policy if exists document_pages_select on public.document_pages;
create policy document_pages_select on public.document_pages
  for select using (public.is_org_member(organization_id));

drop policy if exists dce_analyses_select on public.dce_analyses;
create policy dce_analyses_select on public.dce_analyses
  for select using (public.is_org_member(organization_id));

-- L'utilisateur doit pouvoir corriger l'analyse (section 36).
drop policy if exists dce_analyses_update on public.dce_analyses;
create policy dce_analyses_update on public.dce_analyses
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists requirements_select on public.requirements;
create policy requirements_select on public.requirements
  for select using (public.is_org_member(organization_id));

drop policy if exists requirements_insert on public.requirements;
create policy requirements_insert on public.requirements
  for insert with check (public.is_org_member(organization_id));

drop policy if exists requirements_update on public.requirements;
create policy requirements_update on public.requirements
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists requirements_delete on public.requirements;
create policy requirements_delete on public.requirements
  for delete using (public.is_org_member(organization_id));

drop policy if exists requirement_sources_select on public.requirement_sources;
create policy requirement_sources_select on public.requirement_sources
  for select using (public.is_org_member(organization_id));

drop policy if exists ai_runs_select on public.ai_runs;
create policy ai_runs_select on public.ai_runs
  for select using (public.is_org_member(organization_id));
