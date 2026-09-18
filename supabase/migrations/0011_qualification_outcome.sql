-- =============================================================================
-- 0011 · Criteres de qualification et resultat des consultations
--
-- Migration strictement additive : aucune colonne ni donnee n'est supprimee.
-- Tant qu'elle n'est pas appliquee, l'application ignore ces colonnes (voir
-- src/lib/engine/pipeline-schema.ts).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Criteres de qualification de l'entreprise
--
-- Les regles internes de Go/No-Go, fixees une fois et appliquees a chaque
-- consultation : [{ id, kind, text, days?, blocking }].
-- Modifiables par les administrateurs (politique organizations_update_admin).
-- -----------------------------------------------------------------------------
alter table public.organizations
  add column if not exists qualification_rules jsonb not null default '[]'::jsonb;

-- Verdict de chaque regle pour une consultation donnee :
-- [{ ruleId, text, blocking, status, justification, sources }].
alter table public.go_no_go_analyses
  add column if not exists rule_checks jsonb not null default '[]'::jsonb;

-- -----------------------------------------------------------------------------
-- Resultat de la consultation, saisi par l'entreprise apres le depot
-- -----------------------------------------------------------------------------
do $do$
begin
  create type public.project_outcome as enum (
    'WON',            -- marche attribue a l'entreprise
    'LOST',           -- marche attribue a un concurrent
    'CANCELLED',      -- procedure declaree sans suite ou infructueuse
    'NOT_SUBMITTED'   -- l'offre n'a finalement pas ete deposee
  );
exception
  when duplicate_object then null;
end
$do$;

alter table public.projects
  add column if not exists outcome      public.project_outcome,
  add column if not exists outcome_at   timestamptz,
  add column if not exists outcome_note text;

create index if not exists projects_outcome_idx
  on public.projects (organization_id, outcome)
  where outcome is not null;
