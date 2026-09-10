import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/projects";
import type { DocumentKind } from "@/lib/documents";

export type Project = {
  id: string;
  organization_id: string;
  name: string;
  reference: string | null;
  buyer: string | null;
  lot: string | null;
  deadline: string | null;
  status: ProjectStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectDocument = {
  id: string;
  project_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: DocumentKind;
  status: "UPLOADED" | "EXTRACTING" | "EXTRACTED" | "FAILED";
  page_count: number | null;
  failure_reason: string | null;
  created_at: string;
};

const PROJECT_FIELDS =
  "id, organization_id, name, reference, buyer, lot, deadline, status, is_demo, created_at, updated_at";

/** Dossiers de l'organisation courante. L'isolation est assuree par RLS. */
export async function listProjects(limit = 50): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("id", id)
    .maybeSingle();

  return (data as Project) ?? null;
}

export async function listProjectDocuments(
  projectId: string,
): Promise<ProjectDocument[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_documents")
    .select(
      "id, project_id, storage_path, file_name, mime_type, size_bytes, kind, status, page_count, failure_reason, created_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return (data ?? []) as ProjectDocument[];
}

export type ProjectProgress = Project & {
  /** Score Go/No-Go, ou null tant que l'evaluation n'a pas eu lieu. */
  score: number | null;
  recommendation: "GO" | "VIGILANCE" | "NO_GO" | null;
  /** Avancement du memoire en pourcentage, ou null si le plan n'existe pas. */
  memoryProgress: number | null;
};

/**
 * Dossiers enrichis de leur avancement reel.
 *
 * Les valeurs absentes restent nulles : le tableau de bord affiche alors un
 * tiret plutot qu'un zero, qui laisserait croire a une mesure effectuee.
 */
export async function listProjectsWithProgress(
  limit = 6,
): Promise<ProjectProgress[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(
      `${PROJECT_FIELDS},
       go_no_go_analyses (score, recommendation, user_decision),
       memory_sections (content)`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const decision = (
      row.go_no_go_analyses as unknown as Array<{
        score: number;
        recommendation: "GO" | "VIGILANCE" | "NO_GO";
        user_decision: "GO" | "VIGILANCE" | "NO_GO" | null;
      }>
    )?.[0];

    const sections = (row.memory_sections ??
      []) as unknown as Array<{ content: string | null }>;
    const written = sections.filter(
      (s) => (s.content ?? "").trim().length > 0,
    ).length;

    return {
      ...(row as unknown as Project),
      score: decision?.score ?? null,
      // La decision de l'utilisateur prime sur la recommandation.
      recommendation: decision
        ? (decision.user_decision ?? decision.recommendation)
        : null,
      memoryProgress:
        sections.length === 0
          ? null
          : Math.round((written / sections.length) * 100),
    };
  });
}

/** Compteurs du tableau de bord, calcules sur des donnees reelles. */
export async function getDashboardCounts() {
  const projects = await listProjects(200);
  const now = Date.now();
  const soon = now + 7 * 86_400_000;

  const closed: ProjectStatus[] = ["NO_GO", "EXPORTED"];

  return {
    active: projects.filter((p) => !closed.includes(p.status)).length,
    toProcess: projects.filter((p) => p.status === "DRAFT").length,
    writing: projects.filter((p) => p.status === "WRITING" || p.status === "REVIEW")
      .length,
    dueSoon: projects.filter((p) => {
      if (!p.deadline || closed.includes(p.status)) return false;
      const t = new Date(p.deadline).getTime();
      return !Number.isNaN(t) && t >= now && t <= soon;
    }).length,
  };
}
