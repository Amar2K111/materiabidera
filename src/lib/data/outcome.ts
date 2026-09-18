import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isPipelineSchemaReady } from "@/lib/engine/pipeline-schema";
import type { OutcomeRow, ProjectOutcome } from "@/lib/outcome";

export type ProjectOutcomeRecord = {
  outcome: ProjectOutcome | null;
  outcome_at: string | null;
  outcome_note: string | null;
};

/**
 * Resultats de tous les dossiers de l'entreprise, pour le pipeline.
 * Null tant que la migration 0011 n'est pas appliquee.
 */
export const listProjectOutcomes = cache(
  async (): Promise<Array<OutcomeRow & { id: string }> | null> => {
    if (!(await isPipelineSchemaReady())) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, status, outcome, is_demo, deadline")
      .limit(500);
    if (error) return null;
    return (data ?? []) as Array<OutcomeRow & { id: string }>;
  },
);

/** Resultat d'un dossier. Null tant que la migration 0011 n'est pas appliquee. */
export async function getProjectOutcome(
  projectId: string,
): Promise<ProjectOutcomeRecord | null> {
  if (!(await isPipelineSchemaReady())) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("outcome, outcome_at, outcome_note")
    .eq("id", projectId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProjectOutcomeRecord;
}
