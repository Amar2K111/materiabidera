import "server-only";
import { createClient } from "@/lib/supabase/server";
import { dedupeCited, type CitedSource } from "@/lib/requirements";
import { stripCitationCodes } from "@/lib/citations";

export type StrategyPriority = {
  rank: number;
  title: string;
  rationale: string;
  sources: CitedSource[];
};

export type StrategyRecommendation = {
  title: string;
  detail: string;
  sources: CitedSource[];
};

export type CompanyMatch = {
  table: string;
  recordId: string;
  label: string;
  why: string;
};

export type TenderStrategy = {
  priorities: StrategyPriority[];
  recommendations: StrategyRecommendation[];
  company_matches: CompanyMatch[];
  generated_at: string;
};

export async function getStrategy(
  projectId: string,
): Promise<TenderStrategy | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tender_strategies")
    .select("priorities, recommendations, company_matches, generated_at")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;
  const strategy = data as TenderStrategy;
  for (const p of strategy.priorities ?? []) {
    p.rationale = stripCitationCodes(p.rationale);
    p.sources = dedupeCited(p.sources ?? []);
  }
  for (const r of strategy.recommendations ?? []) {
    r.detail = stripCitationCodes(r.detail);
    r.sources = dedupeCited(r.sources ?? []);
  }
  for (const m of strategy.company_matches ?? []) {
    m.why = stripCitationCodes(m.why);
  }
  return strategy;
}
