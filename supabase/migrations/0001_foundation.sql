-- =============================================================================
-- BIDERA — Migration 0001 : fondation multi-tenant
--
-- Principe directeur : l'isolation entre organisations est appliquee par la
-- base de donnees, jamais par le code applicatif. Toute table metier porte
-- une colonne organization_id et une policy RLS qui s'y adosse.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Profils utilisateurs
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Organisations : une entreprise du BTP = une organisation
-- -----------------------------------------------------------------------------
create table if not exists public.organizations (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  activity_type           text,
  presentation            text,
  intervention_area       text,
  created_by              uuid references auth.users (id) on delete set null,
  onboarding_completed_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Membres
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.member_role as enum ('owner', 'admin', 'member');
exception
  when duplicate_object then null;
end
$do$;

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            public.member_role not null default 'member',
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id);

-- -----------------------------------------------------------------------------
-- Fonctions d'appartenance
--
-- SECURITY DEFINER volontaire : sans cela, une policy posee sur
-- organization_members qui interroge organization_members provoque une
-- recursion infinie. Le search_path est fige pour eviter tout detournement.
-- -----------------------------------------------------------------------------
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$fn$;

create or replace function public.is_org_admin(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$fn$;

-- -----------------------------------------------------------------------------
-- Creation automatique du profil a l'inscription
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Horodatage de mise a jour
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists organizations_touch on public.organizations;
create trigger organizations_touch before update on public.organizations
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;

-- Profils : chacun ne voit et ne modifie que le sien.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Organisations : visibles par leurs membres uniquement.
drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member on public.organizations
  for select using (public.is_org_member(id));

-- La creation passe par la fonction create_organization, qui rattache
-- immediatement le createur comme proprietaire.
drop policy if exists organizations_insert_self on public.organizations;
create policy organizations_insert_self on public.organizations
  for insert with check (created_by = auth.uid());

drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin on public.organizations
  for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- Membres : visibles par les membres de la meme organisation.
drop policy if exists members_select_same_org on public.organization_members;
create policy members_select_same_org on public.organization_members
  for select using (public.is_org_member(organization_id));

drop policy if exists members_write_admin on public.organization_members;
create policy members_write_admin on public.organization_members
  for all using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- =============================================================================
-- Creation d'une organisation et rattachement du createur, en une transaction.
-- =============================================================================
create or replace function public.create_organization(
  org_name text,
  org_activity_type text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentification requise';
  end if;

  if org_name is null or length(btrim(org_name)) = 0 then
    raise exception 'nom d organisation requis';
  end if;

  insert into public.organizations (name, activity_type, created_by)
  values (btrim(org_name), org_activity_type, auth.uid())
  returning id into new_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_id, auth.uid(), 'owner');

  return new_id;
end;
$fn$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;
