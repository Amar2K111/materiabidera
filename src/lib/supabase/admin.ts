import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getServiceRoleKey,
  isSupabaseConfigured,
  supabaseConfig,
} from "@/lib/env";
import { createClient as createUserClient } from "./server";

/**
 * Client de service, utilise uniquement par le pipeline d'ingestion et
 * d'analyse pour ecrire des tables que l'utilisateur ne doit pas ecrire
 * directement (texte extrait, resultats d'analyse, traces).
 *
 * Ce client CONTOURNE les policies RLS. Toute requete qui l'emploie doit donc
 * filtrer explicitement sur organization_id, et n'etre atteinte qu'apres un
 * appel a requireProjectAccess ci-dessous.
 */
export function createAdminClient() {
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY absente");
  }

  return createSupabaseClient(supabaseConfig.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type ProjectAccess = {
  userId: string;
  organizationId: string;
  projectId: string;
};

/**
 * Verifie, avec la session de l'utilisateur et donc sous RLS, qu'il a bien
 * acces au dossier demande. Retourne null sinon.
 *
 * C'est le seul point de controle avant tout travail en cle de service :
 * il ne doit jamais etre contourne.
 */
export async function requireProjectAccess(
  projectId: string,
): Promise<ProjectAccess | null> {
  // Sans configuration, aucun acces n'est verifiable. On refuse proprement
  // plutot que de laisser remonter une erreur technique (section 26).
  if (!isSupabaseConfigured || !getServiceRoleKey()) return null;

  const supabase = await createUserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // La lecture passe sous RLS : un dossier d'une autre organisation
  // ne remonte tout simplement pas.
  const { data } = await supabase
    .from("projects")
    .select("id, organization_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!data) return null;

  return {
    userId: user.id,
    organizationId: data.organization_id as string,
    projectId: data.id as string,
  };
}
