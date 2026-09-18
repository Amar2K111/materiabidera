import "server-only";
import { createClient } from "@/lib/supabase/server";
import { stripCitationCodes } from "@/lib/citations";
import { FACTOR_LABELS } from "@/lib/decision";
import { dedupeCited, type CitedSource } from "@/lib/requirements";
import { isPipelineSchemaReady } from "@/lib/engine/pipeline-schema";
import type { RuleCheck } from "@/lib/qualification";

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
  /** Verdicts des criteres de qualification (migration 0011), sinon vide. */
  rule_checks: RuleCheck[];
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
  analysis.summary = stripCitationCodes(analysis.summary);
  for (const factor of analysis.go_no_go_factors) {
    factor.label = FACTOR_LABELS[factor.key] ?? factor.label;
    factor.justification = stripCitationCodes(factor.justification);
    factor.sources = dedupeCited(factor.sources ?? []);
  }

  analysis.rule_checks = [];
  if (await isPipelineSchemaReady()) {
    const { data: checks } = await supabase
      .from("go_no_go_analyses")
      .select("rule_checks")
      .eq("id", analysis.id)
      .maybeSingle();
    const raw = (checks?.rule_checks ?? []) as RuleCheck[];
    analysis.rule_checks = Array.isArray(raw)
      ? raw.map((c) => ({
          ...c,
          justification: stripCitationCodes(c.justification) ?? "",
          sources: dedupeCited(c.sources ?? []),
        }))
      : [];
  }
  return analysis;
}
