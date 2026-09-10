import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Journal des operations IA (section 30).
 *
 * On enregistre le deroulement d'une operation, jamais son contenu : ni le
 * texte des documents, ni les reponses du modele n'y figurent. Seules des
 * metadonnees non sensibles sont conservees.
 */
export type RunHandle = {
  id: string | null;
  startedAt: number;
};

export async function startRun(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    projectId: string | null;
    operation: string;
    provider?: string | null;
    model?: string | null;
    meta?: Record<string, number | string | boolean>;
  },
): Promise<RunHandle> {
  const { data } = await admin
    .from("ai_runs")
    .insert({
      organization_id: input.organizationId,
      project_id: input.projectId,
      operation: input.operation,
      provider: input.provider ?? null,
      model: input.model ?? null,
      status: "RUNNING",
      input_meta: input.meta ?? {},
    })
    .select("id")
    .single();

  return { id: (data?.id as string) ?? null, startedAt: Date.now() };
}

export async function finishRun(
  admin: SupabaseClient,
  run: RunHandle,
  outcome:
    | { status: "SUCCEEDED"; meta?: Record<string, number | string | boolean> }
    | { status: "FAILED"; reason: string },
): Promise<void> {
  if (!run.id) return;

  await admin
    .from("ai_runs")
    .update({
      status: outcome.status,
      duration_ms: Date.now() - run.startedAt,
      ...(outcome.status === "SUCCEEDED"
        ? { output_meta: outcome.meta ?? {} }
        : { failure_reason: outcome.reason.slice(0, 500) }),
    })
    .eq("id", run.id);
}
