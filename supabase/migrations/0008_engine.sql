-- =============================================================================
-- 0008 — Moteur de memoires techniques
--
-- Migration strictement additive : aucune colonne ni donnee existante n'est
-- modifiee ou supprimee. L'application fonctionne sans elle (mode degrade) ;
-- avec elle, la matrice de couverture, les affirmations controlees, les
-- criteres detailles et l'historique des chapitres sont conserves.
--
-- A executer une fois : Supabase > SQL Editor > coller ce fichier > Run.
-- =============================================================================

-- --- Analyse du DCE : format de reponse impose et contexte du marche ---------
alter table public.dce_analyses
  add column if not exists response_format jsonb,
  add column if not exists market_context  jsonb;

-- --- Exigences : lien au critere, caractere obligatoire, couverture ----------
alter table public.requirements
  add column if not exists mandatory     boolean,
  add column if not exists criterion_ref text,
  -- Attente implicite de l'acheteur : une interpretation, jamais une exigence.
  add column if not exists buyer_intent  text,
  -- Resultat du dernier controle : statut, chapitres, elements manquants.
  add column if not exists coverage      jsonb;

-- --- Strategie : informations a demander a l'entreprise ----------------------
alter table public.tender_strategies
  add column if not exists information_requests jsonb;

-- --- Chapitres : critere traite et preuves retenues ---------------------------
alter table public.memory_sections
  add column if not exists criterion_ref text,
  add column if not exists evidence      jsonb;

-- --- Controle : matrice, affirmations, criteres, preparation -----------------
alter table public.quality_checks
  add column if not exists matrix          jsonb,
  add column if not exists claims          jsonb,
  add column if not exists criteria_review jsonb,
  add column if not exists missing_info    jsonb,
  add column if not exists readiness       jsonb;

-- --- Nouveaux types de problemes ----------------------------------------------
alter type public.issue_kind add value if not exists 'PARTIAL_COVERAGE';
alter type public.issue_kind add value if not exists 'CONSISTENCY';
alter type public.issue_kind add value if not exists 'MISSING_COMPANY_INFO';
alter type public.issue_kind add value if not exists 'IRRELEVANT_CONTENT';

-- --- Historique des chapitres -------------------------------------------------
-- Une regeneration ne detruit jamais un texte : la version precedente est
-- conservee et peut etre restauree.
create table if not exists public.memory_section_versions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  section_id      uuid not null references public.memory_sections (id) on delete cascade,
  content         text not null,
  -- Origine de la version sauvegardee : "generation", "edition", "restauration".
  origin          text not null default 'generation',
  created_at      timestamptz not null default now()
);

create index if not exists memory_section_versions_section_idx
  on public.memory_section_versions (section_id, created_at desc);

alter table public.memory_section_versions enable row level security;

drop policy if exists memory_section_versions_member on public.memory_section_versions;
create policy memory_section_versions_member on public.memory_section_versions
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- PostgREST recharge son schema pour exposer les nouvelles colonnes.
notify pgrst, 'reload schema';
