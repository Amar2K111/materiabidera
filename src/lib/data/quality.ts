import "server-only";
import { createClient } from "@/lib/supabase/server";
import { stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import type {
  ClaimResult,
  ConsistencyResult,
  CoverageResult,
  CriterionResult,
  GenericResult,
  MissingInformation,
  Readiness,
} from "@/lib/engine/readiness";
import type { CitedSource } from "@/lib/requirements";

export type QualitySubscore = {
  key: string;
  label: string;
  score: number;
  computed: boolean;
  detail: string;
};

export type QualityIssue = {
  id: string;
  kind:
    | "REQUIREMENT_UNCOVERED"
    | "PARTIAL_COVERAGE"
    | "MISSING_COMPANY_INFO"
    | "CONSISTENCY"
    | "IRRELEVANT_CONTENT"
    | "TOO_GENERIC"
    | "WEAK_SOURCING"
    | "UNVERIFIED_CLAIM"
    | "CRITERIA_MISALIGNED"
    | "MISSING_SECTION";
  severity: "BLOCKING" | "IMPORTANT" | "MINOR";
  title: string;
  detail: string | null;
  section_id: string | null;
  requirement_id: string | null;
  /** Passages du DCE qui fondent le probleme (exigence concernee). */
  sources: CitedSource[] | null;
  resolved_at: string | null;
  position: number;
};

/** Donnees detaillees du moteur, presentes une fois la migration 0008 appliquee. */
export type EngineReport = {
  readiness: (Readiness & {
    consistency: ConsistencyResult[];
    generic: GenericResult[];
  }) | null;
  matrix: CoverageResult[] | null;
  claims: ClaimResult[] | null;
  criteriaReview: CriterionResult[] | null;
  missingInfo: MissingInformation[] | null;
};

export type QualityCheck = {
  id: string;
  score: number;
  subscores: QualitySubscore[];
  summary: string | null;
  generated_at: string;
  quality_issues: QualityIssue[];
  engine: EngineReport | null;
};

export async function getQualityCheck(
  projectId: string,
): Promise<QualityCheck | null> {
  const supabase = await createClient();
  const engine = await isEngineSchemaReady();
  const { data } = await supabase
    .from("quality_checks")
    .select(
      `id, score, subscores, summary, generated_at,${
        engine ? " readiness, matrix, claims, criteria_review, missing_info," : ""
      }
       quality_issues (id, kind, severity, title, detail, section_id,
         requirement_id, sources, resolved_at, position)`,
    )
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;

  const row = data as unknown as QualityCheck & {
    readiness?: EngineReport["readiness"];
    matrix?: CoverageResult[] | null;
    claims?: ClaimResult[] | null;
    criteria_review?: CriterionResult[] | null;
    missing_info?: MissingInformation[] | null;
  };

  const check: QualityCheck = {
    id: row.id,
    score: row.score,
    subscores: row.subscores,
    summary: stripCitationCodes(row.summary),
    generated_at: row.generated_at,
    quality_issues: [...row.quality_issues].sort((a, b) => a.position - b.position),
    engine:
      engine && row.readiness
        ? {
            readiness: row.readiness,
            matrix: row.matrix ?? null,
            claims: row.claims ?? null,
            criteriaReview: row.criteria_review ?? null,
            missingInfo: row.missing_info ?? null,
          }
        : null,
  };
  for (const issue of check.quality_issues) {
    issue.detail = stripCitationCodes(issue.detail);
  }
  return check;
}

export type ExportRecord = {
  id: string;
  format: "DOCX" | "PDF";
  file_name: string;
  storage_path: string;
  size_bytes: number | null;
  section_count: number | null;
  created_at: string;
};

export async function listExports(projectId: string): Promise<ExportRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exports")
    .select("id, format, file_name, storage_path, size_bytes, section_count, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as ExportRecord[];
}
