import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DceAnalysis, Requirement } from "@/lib/requirements";

export async function getDceAnalysis(
  projectId: string,
): Promise<DceAnalysis | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dce_analyses")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  return (data as DceAnalysis) ?? null;
}

export async function listRequirements(
  projectId: string,
): Promise<Requirement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requirements")
    .select(
      `id, text, category, priority, status, expected_answer, current_answer,
       is_manual, position,
       requirement_sources (id, document_id, page_number, label, quote,
         project_documents (file_name))`,
    )
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  return (data ?? []) as unknown as Requirement[];
}
