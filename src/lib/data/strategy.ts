import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CitedSource } from "@/lib/requirements";

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

  return (data as TenderStrategy) ?? null;
}
