import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Detection de la migration 0011 (criteres de qualification, resultat des
 * consultations).
 *
 * Meme principe que pour 0008 : tant qu'elle n'est pas appliquee, les nouvelles
 * colonnes ne sont ni lues ni ecrites, et aucune requete ne peut echouer faute
 * de colonne. Le resultat est garde quelques minutes.
 */
const TTL_MS = 5 * 60 * 1000;
let cached: { ready: boolean; at: number } | null = null;

export async function isPipelineSchemaReady(): Promise<boolean> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.ready;

  try {
    const admin = createAdminClient();
    const [org, decision, project] = await Promise.all([
      admin.from("organizations").select("qualification_rules").limit(1),
      admin.from("go_no_go_analyses").select("rule_checks").limit(1),
      admin.from("projects").select("outcome, outcome_at, outcome_note").limit(1),
    ]);
    const ready = !org.error && !decision.error && !project.error;
    // Une migration absente ne doit pas etre memorisee longtemps : l'utilisateur
    // l'applique justement pour voir la fonctionnalite apparaitre.
    cached = { ready, at: ready ? Date.now() : Date.now() - TTL_MS + 30_000 };
    return ready;
  } catch {
    cached = { ready: false, at: Date.now() - TTL_MS + 30_000 };
    return false;
  }
}
