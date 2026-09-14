-- =============================================================================
-- 0009 — Cache des vecteurs de recherche par le sens
--
-- Migration strictement additive. Chaque texte (fiche entreprise, passage de
-- bibliotheque, page du DCE, requete) n'est vectorise qu'une fois : le vecteur
-- est retrouve par l'empreinte du texte. Sans cette table, l'application
-- fonctionne encore (cache en memoire du serveur, puis recherche par mots-cles).
--
-- A executer une fois : Supabase > SQL Editor > coller ce fichier > Run.
-- =============================================================================

create table if not exists public.embeddings (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- SHA-256 de (modele, dimensions, usage, texte) : un texte modifie produit
  -- une nouvelle empreinte, l'ancien vecteur n'est simplement plus lu.
  content_hash    text not null,
  model           text not null,
  dimensions      integer not null,
  -- Vecteur float32 encode en base64 (768 dimensions : ~4 Ko).
  vector          text not null,
  created_at      timestamptz not null default now(),
  unique (organization_id, content_hash)
);

alter table public.embeddings enable row level security;

-- Lecture reservee aux membres ; l'ecriture passe par le serveur (cle de service).
drop policy if exists embeddings_select on public.embeddings;
create policy embeddings_select on public.embeddings
  for select using (public.is_org_member(organization_id));

notify pgrst, 'reload schema';
