-- =============================================================================
-- BIDERA — Migration 0004 : base entreprise
--
-- La base entreprise est la memoire permanente de l'entreprise : references
-- de chantiers, equipe, materiel, certifications, qualifications, methodes et
-- documents. C'est elle qui permet a une reponse d'etre reellement adaptee,
-- et non generique.
--
-- La presentation et les zones d'intervention restent portees par la table
-- organizations : elles y ont ete creees des l'inscription, et une table
-- dediee n'apporterait qu'une jointure supplementaire.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- References de chantiers
-- -----------------------------------------------------------------------------
create table if not exists public.company_references (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  name            text not null,
  client          text,
  year            integer,
  amount          text,
  work_type       text,
  lot             text,
  location        text,
  constraints     text,
  description     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_references_org_idx
  on public.company_references (organization_id, year desc nulls last);

-- -----------------------------------------------------------------------------
-- Equipe
-- -----------------------------------------------------------------------------
create table if not exists public.company_employees (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  full_name       text not null,
  role            text,
  experience      text,
  skills          text,
  certifications  text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_employees_org_idx
  on public.company_employees (organization_id);

-- -----------------------------------------------------------------------------
-- Materiel
-- -----------------------------------------------------------------------------
create table if not exists public.company_equipment (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  name            text not null,
  category        text,
  quantity        text,
  specifications  text,
  availability    text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_equipment_org_idx
  on public.company_equipment (organization_id);

-- -----------------------------------------------------------------------------
-- Certifications
-- -----------------------------------------------------------------------------
create table if not exists public.company_certifications (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  name            text not null,
  reference       text,
  issued_on       date,
  valid_until     date,
  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_certifications_org_idx
  on public.company_certifications (organization_id);

-- -----------------------------------------------------------------------------
-- Qualifications (Qualibat, RGE, etc.)
-- -----------------------------------------------------------------------------
create table if not exists public.company_qualifications (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  name            text not null,
  domain          text,
  reference       text,
  valid_until     date,
  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_qualifications_org_idx
  on public.company_qualifications (organization_id);

-- -----------------------------------------------------------------------------
-- Methodes et procedures
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.method_domain as enum (
    'CHANTIER',
    'QUALITE',
    'SECURITE',
    'ENVIRONNEMENT',
    'ORGANISATION',
    'AUTRE'
  );
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.company_methods (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  title           text not null,
  domain          public.method_domain not null default 'AUTRE',
  content         text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_methods_org_idx
  on public.company_methods (organization_id);

-- -----------------------------------------------------------------------------
-- Documents d'entreprise (bibliotheque)
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.company_document_kind as enum (
    'REFERENCE',
    'MEMOIRE',
    'METHODE',
    'CV',
    'CERTIFICATION',
    'QSE',
    'MATERIEL',
    'AUTRE'
  );
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.company_documents (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  storage_path    text not null unique,
  file_name       text not null,
  mime_type       text,
  size_bytes      bigint,
  kind            public.company_document_kind not null default 'AUTRE',
  status          public.document_status not null default 'UPLOADED',
  page_count      integer,
  failure_reason  text,

  -- Rattachements facultatifs, pour relier un justificatif a sa fiche.
  reference_id     uuid references public.company_references (id) on delete set null,
  employee_id      uuid references public.company_employees (id) on delete set null,
  certification_id uuid references public.company_certifications (id) on delete set null,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists company_documents_org_idx
  on public.company_documents (organization_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Texte extrait des documents d'entreprise
-- -----------------------------------------------------------------------------
create table if not exists public.company_document_pages (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id     uuid not null references public.company_documents (id) on delete cascade,
  page_number     integer,
  label           text not null,
  content         text not null,
  char_count      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists company_document_pages_document_idx
  on public.company_document_pages (document_id, page_number);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
do $do$
declare
  t text;
begin
  foreach t in array array[
    'company_references',
    'company_employees',
    'company_equipment',
    'company_certifications',
    'company_qualifications',
    'company_methods',
    'company_documents'
  ]
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format(
      'create trigger %I_touch before update on public.%I
         for each row execute function public.touch_updated_at()', t, t);
  end loop;
end
$do$;

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- Meme regle pour toutes ces tables : lecture et ecriture reservees aux
-- membres de l'organisation proprietaire.
-- =============================================================================
do $do$
declare
  t text;
begin
  foreach t in array array[
    'company_references',
    'company_employees',
    'company_equipment',
    'company_certifications',
    'company_qualifications',
    'company_methods',
    'company_documents'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_member on public.%I', t, t);
    execute format(
      'create policy %I_member on public.%I
         for all using (public.is_org_member(organization_id))
         with check (public.is_org_member(organization_id))', t, t);
  end loop;
end
$do$;

-- Le texte extrait se lit, mais n'est ecrit que par le pipeline serveur.
alter table public.company_document_pages enable row level security;

drop policy if exists company_document_pages_select on public.company_document_pages;
create policy company_document_pages_select on public.company_document_pages
  for select using (public.is_org_member(organization_id));

-- =============================================================================
-- STOCKAGE : bucket prive des documents d'entreprise
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('entreprise', 'entreprise', false)
on conflict (id) do nothing;

drop policy if exists entreprise_read on storage.objects;
create policy entreprise_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'entreprise'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists entreprise_insert on storage.objects;
create policy entreprise_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'entreprise'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists entreprise_update on storage.objects;
create policy entreprise_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'entreprise'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists entreprise_delete on storage.objects;
create policy entreprise_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'entreprise'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
