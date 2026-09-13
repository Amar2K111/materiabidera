import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectStatus } from "@/lib/projects";

/**
 * Rang de chaque statut dans le parcours de reponse.
 *
 * GO et NO_GO occupent le meme rang : c'est une decision, pas une avancee.
 */
const RANK: Record<ProjectStatus, number> = {
  DRAFT: 0,
  ANALYZING: 1,
  ANALYZED: 2,
  GO: 3,
  NO_GO: 3,
  STRATEGY_READY: 4,
  WRITING: 5,
  REVIEW: 6,
  READY: 7,
  EXPORTED: 8,
};

/**
 * Fait avancer le dossier sans jamais le faire reculer.
 *
 * Relancer une evaluation ou une strategie sur un dossier deja en redaction ne
 * doit pas le renvoyer a une etape anterieure. Seule exception : entre GO et
 * NO_GO, la derniere decision l'emporte tant que la redaction n'a pas commence.
 */
export async function advanceProjectStatus(
  admin: SupabaseClient,
  projectId: string,
  next: ProjectStatus,
): Promise<void> {
  const { data: project } = await admin
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();

  const current = (project?.status as ProjectStatus | undefined) ?? "DRAFT";
  if (current === next) return;

  // Un dossier ecarte n'avance que par une nouvelle decision GO.
  if (current === "NO_GO" && next !== "GO" && RANK[next] > RANK.NO_GO) return;

  if (RANK[next] < RANK[current]) return;

  await admin.from("projects").update({ status: next }).eq("id", projectId);
}
