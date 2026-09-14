import "server-only";
import { createClient } from "@/lib/supabase/server";
import { stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";
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

  if (!data) return null;
  const analysis = data as DceAnalysis;
  for (const c of analysis.award_criteria ?? []) {
    c.detail = stripCitationCodes(c.detail);
    for (const sub of c.subcriteria ?? []) sub.detail = stripCitationCodes(sub.detail);
    c.expectedElements = c.expectedElements?.map((e) => stripCitationCodes(e));
  }
  for (const m of analysis.market_context?.constraints ?? []) m.detail = stripCitationCodes(m.detail);
  for (const v of analysis.vigilance_points ?? []) v.detail = stripCitationCodes(v.detail);
  return analysis;
}

export async function listRequirements(
  projectId: string,
): Promise<Requirement[]> {
  const supabase = await createClient();
  const engine = await isEngineSchemaReady();
  const { data } = await supabase
    .from("requirements")
    .select(
      `id, text, category, priority, status, expected_answer, current_answer,
       is_manual, position,${engine ? " mandatory, criterion_ref, buyer_intent, coverage," : ""}
       requirement_sources (id, document_id, page_number, label, quote,
         project_documents (file_name))`,
    )
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  const requirements = (data ?? []) as unknown as Requirement[];
  for (const r of requirements) {
    r.text = stripCitationCodes(r.text);
    r.expected_answer = stripCitationCodes(r.expected_answer);
    if (r.buyer_intent) r.buyer_intent = stripCitationCodes(r.buyer_intent);
  }
  return requirements;
}
