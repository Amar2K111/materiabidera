-- =============================================================================
-- 0010 — Integrite entre organisations
--
-- Les politiques RLS verifient que la ligne ecrite appartient a l'une des
-- organisations de l'utilisateur. Elles ne verifiaient pas que le PARENT
-- reference (dossier, chapitre, exigence, piece...) appartient a cette meme
-- organisation : un membre de B pouvait rattacher une ligne de B a un dossier
-- de A. Cette ligne restait invisible pour A, mais aurait pu etre lue par les
-- traitements serveur de A, qui travaillent par dossier.
--
-- Cette migration impose, pour chaque relation, que parent et enfant
-- appartiennent a la meme organisation, et que les fichiers references se
-- trouvent dans le dossier de stockage de l'organisation.
--
-- Aucune donnee metier n'est supprimee. Seules les references de chapitres
-- vers des exigences inexistantes ou d'un autre dossier sont nettoyees.
--
-- A executer une fois : Supabase > SQL Editor > coller ce fichier > Run.
-- =============================================================================

-- --- Parent et enfant dans la meme organisation -------------------------------
-- security definer : le parent doit etre lu meme s'il est masque par la RLS
-- (c'est precisement le cas d'un parent d'une autre organisation).
create or replace function public.enforce_parent_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  parent_table text := tg_argv[0];
  fk_column    text := tg_argv[1];
  parent_id    uuid;
  parent_org   uuid;
begin
  parent_id := nullif(to_jsonb(new) ->> fk_column, '')::uuid;
  if parent_id is null then
    return new;
  end if;

  execute format('select organization_id from public.%I where id = $1', parent_table)
    into parent_org
    using parent_id;

  if parent_org is null or parent_org <> new.organization_id then
    raise exception 'Reference hors de l''organisation (%.%)', tg_table_name, fk_column
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

revoke all on function public.enforce_parent_organization() from public;

do $do$
declare
  rel record;
begin
  for rel in
    select * from (values
      ('project_documents',       'project_id',     'projects'),
      ('document_pages',          'project_id',     'projects'),
      ('document_pages',          'document_id',    'project_documents'),
      ('dce_analyses',            'project_id',     'projects'),
      ('requirements',            'project_id',     'projects'),
      ('requirement_sources',     'requirement_id', 'requirements'),
      ('requirement_sources',     'document_id',    'project_documents'),
      ('go_no_go_analyses',       'project_id',     'projects'),
      ('go_no_go_factors',        'analysis_id',    'go_no_go_analyses'),
      ('tender_strategies',       'project_id',     'projects'),
      ('memory_sections',         'project_id',     'projects'),
      ('memory_sources',          'section_id',     'memory_sections'),
      ('memory_sources',          'document_id',    'project_documents'),
      ('memory_section_versions', 'section_id',     'memory_sections'),
      ('quality_checks',          'project_id',     'projects'),
      ('quality_issues',          'check_id',       'quality_checks'),
      ('quality_issues',          'section_id',     'memory_sections'),
      ('quality_issues',          'requirement_id', 'requirements'),
      ('checklist_items',         'project_id',     'projects'),
      ('exports',                 'project_id',     'projects'),
      ('ai_runs',                 'project_id',     'projects'),
      ('company_document_pages',  'document_id',    'company_documents'),
      ('company_documents',       'certification_id', 'company_certifications'),
      ('company_documents',       'employee_id',    'company_employees'),
      ('company_documents',       'reference_id',   'company_references')
    ) as t(child, fk, parent)
  loop
    execute format('drop trigger if exists %I on public.%I', rel.child || '_' || rel.fk || '_same_org', rel.child);
    execute format(
      'create trigger %I before insert or update of %I, organization_id on public.%I
         for each row execute function public.enforce_parent_organization(%L, %L)',
      rel.child || '_' || rel.fk || '_same_org', rel.fk, rel.child, rel.parent, rel.fk
    );
  end loop;
end;
$do$;

-- --- Exigences referencees par un chapitre : uniquement celles du dossier ------
-- requirement_ids est un tableau (sans cle etrangere) : les references
-- etrangeres au dossier sont retirees plutot que refusees, pour qu'une mise a
-- jour legitime ne bloque jamais sur une reference devenue obsolete.
create or replace function public.sanitize_section_requirements()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.requirement_ids is not null then
    new.requirement_ids := coalesce(
      array(
        select rid
        from unnest(new.requirement_ids) with ordinality as u(rid, pos)
        where exists (
          select 1 from public.requirements r
          where r.id = u.rid and r.project_id = new.project_id
        )
        order by pos
      ),
      '{}'::uuid[]
    );
  end if;
  return new;
end;
$fn$;

revoke all on function public.sanitize_section_requirements() from public;

drop trigger if exists memory_sections_requirement_ids_scope on public.memory_sections;
create trigger memory_sections_requirement_ids_scope
  before insert or update of requirement_ids, project_id on public.memory_sections
  for each row execute function public.sanitize_section_requirements();

-- Nettoyage des references existantes vers des exigences disparues.
update public.memory_sections s
set requirement_ids = coalesce(
  array(
    select rid
    from unnest(s.requirement_ids) with ordinality as u(rid, pos)
    where exists (
      select 1 from public.requirements r where r.id = u.rid and r.project_id = s.project_id
    )
    order by pos
  ),
  '{}'::uuid[]
)
where exists (
  select 1 from unnest(s.requirement_ids) as u(rid)
  where not exists (
    select 1 from public.requirements r where r.id = u.rid and r.project_id = s.project_id
  )
);

-- --- Fichiers : toujours dans le dossier de stockage de l'organisation --------
-- "not valid" : controle applique a toute nouvelle ecriture, sans bloquer la
-- migration si une ancienne ligne ne respectait pas ce format.
alter table public.project_documents
  drop constraint if exists project_documents_storage_path_org;
alter table public.project_documents
  add constraint project_documents_storage_path_org
  check (split_part(storage_path, '/', 1) = organization_id::text and storage_path not like '%..%')
  not valid;

alter table public.company_documents
  drop constraint if exists company_documents_storage_path_org;
alter table public.company_documents
  add constraint company_documents_storage_path_org
  check (split_part(storage_path, '/', 1) = organization_id::text and storage_path not like '%..%')
  not valid;

alter table public.exports
  drop constraint if exists exports_storage_path_org;
alter table public.exports
  add constraint exports_storage_path_org
  check (split_part(storage_path, '/', 1) = organization_id::text and storage_path not like '%..%')
  not valid;

notify pgrst, 'reload schema';
