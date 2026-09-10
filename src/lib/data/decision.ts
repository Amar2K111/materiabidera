import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CitedSource } from "@/lib/requirements";

export type GoRecommendation = "GO" | "VIGILANCE" | "NO_GO";

export type GoFactor = {
  id: string;
  key: string;
  label: string;
  score: number;
  justification: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sources: CitedSource[];
  position: number;
};

export type GoNoGoAnalysis = {
  id: string;
  score: number;
  recommendation: GoRecommendation;
  summary: string | null;
  user_decision: GoRecommendation | null;
  user_note: string | null;
  decided_at: string | null;
  generated_at: string;
  go_no_go_factors: GoFactor[];
};

export async function getGoNoGo(
  projectId: string,
): Promise<GoNoGoAnalysis | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("go_no_go_analyses")
    .select(
      `id, score, recommendation, summary, user_decision, user_note,
       decided_at, generated_at,
       go_no_go_factors (id, key, label, score, justification, confidence,
         sources, position)`,
    )
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;

  const analysis = data as unknown as GoNoGoAnalysis;
  analysis.go_no_go_factors.sort((a, b) => a.position - b.position);
  return analysis;
}
