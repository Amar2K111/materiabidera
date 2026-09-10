-- =============================================================================
-- BIDERA — Migration 0007 : controle qualite, checklist et exports
--
-- Certains indicateurs se calculent, d'autres s'apprecient. Les premiers sont
-- produits par l'application a partir des donnees enregistrees ; les seconds
-- proviennent d'une relecture par le moteur d'analyse. La colonne "computed"
-- dit lequel des deux, pour que l'utilisateur sache ce qu'il lit.
-- =============================================================================

do $do$
begin
  create type public.issue_severity as enum ('BLOCKING', 'IMPORTANT', 'MINOR');
exception
  when duplicate_object then null;
end
$do$;

do $do$
begin
  create type public.issue_kind as enum (
    'REQUIREMENT_UNCOVERED',
    'TOO_GENERIC',
    'WEAK_SOURCING',
    'UNVERIFIED_CLAIM',
    'CRITERIA_MISALIGNED',
    'MISSING_SECTION'
  );
exception
  when duplicate_object then null;
end
$do$;

-- -----------------------------------------------------------------------------
-- Controle qualite
-- -----------------------------------------------------------------------------
create table if not exists public.quality_checks (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade unique,

  score           integer not null check (score between 0 and 100),
  -- Sous-scores : [{ key, label, score, computed, detail }]
  subscores       jsonb not null default '[]'::jsonb,
  summary         text,

  provider        text,
  model           text,
  generated_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Problemes releves
-- -----------------------------------------------------------------------------
create table if not exists public.quality_issues (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  check_id        uuid not null references public.quality_checks (id) on delete cascade,

  kind            public.issue_kind not null,
  severity        public.issue_severity not null default 'IMPORTANT',
  title           text not null,
  detail          text,

  -- Ou corriger : chapitre du memoire, ou exigence concernee.
  section_id      uuid references public.memory_sections (id) on delete set null,
  requirement_id  uuid references public.requirements (id) on delete set null,
  sources         jsonb not null default '[]'::jsonb,

  resolved_at     timestamptz,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists quality_issues_check_idx
  on public.quality_issues (check_id, position);

-- -----------------------------------------------------------------------------
-- Checklist avant remise
--
-- Les points sont crees par l'application a partir de l'etat reel du dossier,
-- puis l'utilisateur coche ce qu'il a verifie lui-meme.
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.checklist_group as enum (
    'ADMINISTRATIF',
    'TECHNIQUE',
    'CONTROLE'
  );
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.checklist_items (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,

  group_name      public.checklist_group not null,
  label           text not null,
  detail          text,

  -- Un point verifie automatiquement porte son resultat ; un point a la charge
  -- de l'utilisateur attend sa case.
  is_automatic    boolean not null default false,
  auto_key        text,
  checked         boolean not null default false,
  position        integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists checklist_items_project_idx
  on public.checklist_items (project_id, position);

create unique index if not exists checklist_items_auto_unique
  on public.checklist_items (project_id, auto_key)
  where auto_key is not null;

-- -----------------------------------------------------------------------------
-- Exports produits
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.export_format as enum ('DOCX', 'PDF');
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.exports (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade,

  format          public.export_format not null,
  file_name       text not null,
  storage_path    text not null unique,
  size_bytes      bigint,
  section_count   integer,

  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists exports_project_idx
  on public.exports (project_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
drop trigger if exists quality_checks_touch on public.quality_checks;
create trigger quality_checks_touch before update on public.quality_checks
  for each row execute function public.touch_updated_at();

drop trigger if exists checklist_items_touch on public.checklist_items;
create trigger checklist_items_touch before update on public.checklist_items
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.quality_checks  enable row level security;
alter table public.quality_issues  enable row level security;
alter table public.checklist_items enable row level security;
alter table public.exports         enable row level security;

drop policy if exists quality_checks_select on public.quality_checks;
create policy quality_checks_select on public.quality_checks
  for select using (public.is_org_member(organization_id));

drop policy if exists quality_issues_select on public.quality_issues;
create policy quality_issues_select on public.quality_issues
  for select using (public.is_org_member(organization_id));

-- L'utilisateur marque lui-meme un probleme comme traite.
drop policy if exists quality_issues_update on public.quality_issues;
create policy quality_issues_update on public.quality_issues
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- La checklist est cochee par l'utilisateur, et complete par ses propres points.
drop policy if exists checklist_items_member on public.checklist_items;
create policy checklist_items_member on public.checklist_items
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists exports_select on public.exports;
create policy exports_select on public.exports
  for select using (public.is_org_member(organization_id));

-- =============================================================================
-- STOCKAGE : bucket prive des documents exportes
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('exports', 'exports', false)
on conflict (id) do nothing;

drop policy if exists exports_read on storage.objects;
create policy exports_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exports'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists exports_delete on storage.objects;
create policy exports_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exports'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
