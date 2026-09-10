import "server-only";
import { createClient } from "@/lib/supabase/server";

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
  resolved_at: string | null;
  position: number;
};

export type QualityCheck = {
  id: string;
  score: number;
  subscores: QualitySubscore[];
  summary: string | null;
  generated_at: string;
  quality_issues: QualityIssue[];
};

export async function getQualityCheck(
  projectId: string,
): Promise<QualityCheck | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quality_checks")
    .select(
      `id, score, subscores, summary, generated_at,
       quality_issues (id, kind, severity, title, detail, section_id,
         requirement_id, resolved_at, position)`,
    )
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;

  const check = data as unknown as QualityCheck;
  check.quality_issues.sort((a, b) => a.position - b.position);
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
