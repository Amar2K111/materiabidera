import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Detection de la migration 0008 (moteur de memoires).
 *
 * Tant qu'elle n'est pas appliquee, l'application fonctionne en mode degrade :
 * les nouvelles colonnes ne sont ni lues ni ecrites, et une requete ne peut donc
 * jamais echouer faute de colonne. Le resultat est garde quelques minutes pour
 * ne pas interroger la base a chaque rendu.
 */
const TTL_MS = 5 * 60 * 1000;
let cached: { ready: boolean; at: number } | null = null;

export async function isEngineSchemaReady(): Promise<boolean> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.ready;

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("memory_section_versions")
      .select("id")
      .limit(1);
    const { error: columnError } = await admin
      .from("quality_checks")
      .select("matrix, readiness")
      .limit(1);
    const ready = !error && !columnError;
    cached = { ready, at: Date.now() };
    return ready;
  } catch {
    cached = { ready: false, at: Date.now() };
    return false;
  }
}

/** A appeler apres application de la migration, pour ne pas attendre le cache. */
export function resetEngineSchemaCache() {
  cached = null;
}
