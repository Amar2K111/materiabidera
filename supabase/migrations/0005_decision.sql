-- =============================================================================
-- BIDERA — Migration 0005 : decision Go/No-Go et strategie de reponse
--
-- Le score n'est jamais une verite : il se decompose en facteurs, chacun
-- portant sa justification, ses sources et son niveau de confiance. La
-- decision finale appartient a l'utilisateur, qui peut la modifier.
-- =============================================================================

do $do$
begin
  create type public.go_recommendation as enum ('GO', 'VIGILANCE', 'NO_GO');
exception
  when duplicate_object then null;
end
$do$;

do $do$
begin
  create type public.confidence_level as enum ('HIGH', 'MEDIUM', 'LOW');
exception
  when duplicate_object then null;
end
$do$;

-- -----------------------------------------------------------------------------
-- Analyse Go / No-Go
-- -----------------------------------------------------------------------------
create table if not exists public.go_no_go_analyses (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade unique,

  score           integer not null check (score between 0 and 100),
  recommendation  public.go_recommendation not null,
  summary         text,

  -- Decision de l'utilisateur, qui prime toujours sur la recommandation.
  user_decision   public.go_recommendation,
  user_note       text,
  decided_at      timestamptz,

  provider        text,
  model           text,
  generated_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Facteurs du score
-- -----------------------------------------------------------------------------
create table if not exists public.go_no_go_factors (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  analysis_id     uuid not null references public.go_no_go_analyses (id) on delete cascade,

  key             text not null,
  label           text not null,
  score           integer not null check (score between 0 and 100),
  justification   text,
  confidence      public.confidence_level not null default 'MEDIUM',
  -- Sources citees : extraits du DCE et elements de la base entreprise.
  sources         jsonb not null default '[]'::jsonb,
  position        integer not null default 0,

  created_at      timestamptz not null default now()
);

create index if not exists go_no_go_factors_analysis_idx
  on public.go_no_go_factors (analysis_id, position);

-- -----------------------------------------------------------------------------
-- Strategie de reponse
-- -----------------------------------------------------------------------------
create table if not exists public.tender_strategies (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id      uuid not null references public.projects (id) on delete cascade unique,

  -- Axes a privilegier : [{ rank, title, rationale, sources }]
  priorities      jsonb not null default '[]'::jsonb,
  -- Recommandations : [{ title, detail, sources }]
  recommendations jsonb not null default '[]'::jsonb,
  -- Elements de la base entreprise juges pertinents : [{ kind, id, label, why }]
  company_matches jsonb not null default '[]'::jsonb,

  provider        text,
  model           text,
  generated_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Horodatage
-- -----------------------------------------------------------------------------
drop trigger if exists go_no_go_analyses_touch on public.go_no_go_analyses;
create trigger go_no_go_analyses_touch before update on public.go_no_go_analyses
  for each row execute function public.touch_updated_at();

drop trigger if exists tender_strategies_touch on public.tender_strategies;
create trigger tender_strategies_touch before update on public.tender_strategies
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.go_no_go_analyses enable row level security;
alter table public.go_no_go_factors  enable row level security;
alter table public.tender_strategies enable row level security;

drop policy if exists go_no_go_analyses_select on public.go_no_go_analyses;
create policy go_no_go_analyses_select on public.go_no_go_analyses
  for select using (public.is_org_member(organization_id));

-- L'utilisateur doit pouvoir trancher lui-meme (section 36).
drop policy if exists go_no_go_analyses_update on public.go_no_go_analyses;
create policy go_no_go_analyses_update on public.go_no_go_analyses
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists go_no_go_factors_select on public.go_no_go_factors;
create policy go_no_go_factors_select on public.go_no_go_factors
  for select using (public.is_org_member(organization_id));

drop policy if exists tender_strategies_select on public.tender_strategies;
create policy tender_strategies_select on public.tender_strategies
  for select using (public.is_org_member(organization_id));

drop policy if exists tender_strategies_update on public.tender_strategies;
create policy tender_strategies_update on public.tender_strategies
  for update using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
