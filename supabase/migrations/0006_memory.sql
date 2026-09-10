-- =============================================================================
-- BIDERA — Migration 0006 : plan et redaction du memoire technique
--
-- Le plan n'est jamais un modele fige : il est construit pour chaque
-- consultation, a partir du reglement, des criteres de jugement et du cadre de
-- memoire lorsqu'il en existe un. Chaque chapitre garde la trace de ce sur
-- quoi il s'appuie.
-- =============================================================================

do $do$
begin
  create type public.section_status as enum (
    'EMPTY',
    'GENERATED',
    'EDITED',
    'VALIDATED'
  );
exception
  when duplicate_object then null;
end
$do$;

-- -----------------------------------------------------------------------------
-- Chapitres du memoire
-- -----------------------------------------------------------------------------
create table if not exists public.memory_sections (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,

  position        integer not null default 0,
  -- Numerotation affichee, du type "03" ou "03.2".
  number          text,
  title           text not null,
  -- Ce que le chapitre doit couvrir, etabli au moment du plan.
  brief           text,
  content         text,
  status          public.section_status not null default 'EMPTY',

  -- Exigences que ce chapitre est cense traiter.
  requirement_ids uuid[] not null default '{}',

  word_target     integer,
  provider        text,
  model           text,
  generated_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists memory_sections_project_idx
  on public.memory_sections (project_id, position);

-- -----------------------------------------------------------------------------
-- Sources d'un chapitre
--
-- Une source vient soit du DCE, soit de la base entreprise. Les deux colonnes
-- de rattachement sont donc facultatives, et le libelle reste toujours
-- renseigne pour rester affichable meme si la fiche d'origine disparait.
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.source_origin as enum ('DCE', 'ENTREPRISE');
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.memory_sources (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  section_id       uuid not null references public.memory_sections (id) on delete cascade,

  origin           public.source_origin not null,
  document_id      uuid references public.project_documents (id) on delete set null,
  company_table    text,
  company_record_id uuid,

  page_number      integer,
  label            text not null,
  quote            text,

  created_at       timestamptz not null default now()
);

create index if not exists memory_sources_section_idx
  on public.memory_sources (section_id);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
drop trigger if exists memory_sections_touch on public.memory_sections;
create trigger memory_sections_touch before update on public.memory_sections
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- L'utilisateur doit pouvoir reorganiser son plan et reecrire son texte :
-- l'ecriture lui est donc ouverte, contrairement aux tables produites par le
-- seul pipeline d'analyse.
-- =============================================================================
alter table public.memory_sections enable row level security;
alter table public.memory_sources  enable row level security;

drop policy if exists memory_sections_member on public.memory_sections;
create policy memory_sections_member on public.memory_sections
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists memory_sources_select on public.memory_sources;
create policy memory_sources_select on public.memory_sources
  for select using (public.is_org_member(organization_id));
