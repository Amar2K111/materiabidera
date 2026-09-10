-- =============================================================================
-- BIDERA — Migration 0002 : dossiers d'appels d'offres et documents du DCE
--
-- Toute table porte organization_id et une policy RLS adossee a
-- public.is_org_member. Un utilisateur ne peut jamais lire ni ecrire les
-- donnees d'une autre organisation, y compris dans le stockage de fichiers.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Etats d'un dossier (section 25 du cahier des charges)
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.project_status as enum (
    'DRAFT',
    'ANALYZING',
    'ANALYZED',
    'GO',
    'NO_GO',
    'STRATEGY_READY',
    'WRITING',
    'REVIEW',
    'READY',
    'EXPORTED'
  );
exception
  when duplicate_object then null;
end
$do$;

-- Nature d'une piece du DCE. 'UNKNOWN' tant que la classification n'a pas eu
-- lieu : on ne devine pas, on constate.
do $do$
begin
  create type public.document_kind as enum (
    'RC',
    'CCTP',
    'CCAP',
    'ACTE_ENGAGEMENT',
    'DPGF',
    'BPU',
    'PLAN',
    'CADRE_MEMOIRE',
    'ANNEXE',
    'ADMINISTRATIF',
    'AUTRE',
    'UNKNOWN'
  );
exception
  when duplicate_object then null;
end
$do$;

-- Etat du traitement d'un fichier dans le pipeline d'ingestion.
do $do$
begin
  create type public.document_status as enum (
    'UPLOADED',
    'EXTRACTING',
    'EXTRACTED',
    'FAILED'
  );
exception
  when duplicate_object then null;
end
$do$;

-- -----------------------------------------------------------------------------
-- Dossiers
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  reference       text,
  buyer           text,
  lot             text,
  deadline        timestamptz,
  status          public.project_status not null default 'DRAFT',
  -- Un dossier de demonstration reste identifiable et n'est jamais melange
  -- aux dossiers reels (section 38).
  is_demo         boolean not null default false,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_org_idx
  on public.projects (organization_id, created_at desc);
create index if not exists projects_deadline_idx
  on public.projects (organization_id, deadline)
  where deadline is not null;

-- -----------------------------------------------------------------------------
-- Documents du DCE
-- -----------------------------------------------------------------------------
create table if not exists public.project_documents (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  project_id       uuid not null references public.projects (id) on delete cascade,
  -- Chemin dans le bucket prive "dce" : <organization_id>/<project_id>/<fichier>
  storage_path     text not null unique,
  file_name        text not null,
  mime_type        text,
  size_bytes       bigint,
  kind             public.document_kind not null default 'UNKNOWN',
  status           public.document_status not null default 'UPLOADED',
  page_count       integer,
  -- Message lisible en cas d'echec d'extraction, jamais une trace technique.
  failure_reason   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists project_documents_project_idx
  on public.project_documents (project_id, created_at);
create index if not exists project_documents_org_idx
  on public.project_documents (organization_id);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists project_documents_touch on public.project_documents;
create trigger project_documents_touch before update on public.project_documents
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.projects          enable row level security;
alter table public.project_documents enable row level security;

drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
  for select using (public.is_org_member(organization_id));

drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects
  for insert with check (public.is_org_member(organization_id));

drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects
  for delete using (public.is_org_admin(organization_id));

drop policy if exists project_documents_select on public.project_documents;
create policy project_documents_select on public.project_documents
  for select using (public.is_org_member(organization_id));

drop policy if exists project_documents_insert on public.project_documents;
create policy project_documents_insert on public.project_documents
  for insert with check (public.is_org_member(organization_id));

drop policy if exists project_documents_update on public.project_documents;
create policy project_documents_update on public.project_documents
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists project_documents_delete on public.project_documents;
create policy project_documents_delete on public.project_documents
  for delete using (public.is_org_member(organization_id));

-- =============================================================================
-- STOCKAGE
--
-- Bucket prive. Le premier segment du chemin est l'organization_id : les
-- policies s'y adossent, ce qui garantit qu'un fichier n'est jamais lisible
-- en dehors de son organisation, meme avec une URL devinee.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('dce', 'dce', false)
on conflict (id) do nothing;

drop policy if exists dce_read on storage.objects;
create policy dce_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dce'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists dce_insert on storage.objects;
create policy dce_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dce'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists dce_update on storage.objects;
create policy dce_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'dce'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists dce_delete on storage.objects;
create policy dce_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'dce'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
