import "server-only";
import { createClient } from "@/lib/supabase/server";

export type MemorySource = {
  id: string;
  origin: "DCE" | "ENTREPRISE";
  page_number: number | null;
  label: string;
  quote: string | null;
};

export type MemorySection = {
  id: string;
  position: number;
  number: string | null;
  title: string;
  brief: string | null;
  content: string | null;
  status: "EMPTY" | "GENERATED" | "EDITED" | "VALIDATED";
  requirement_ids: string[];
  word_target: number | null;
  generated_at: string | null;
  memory_sources: MemorySource[];
};

export async function listMemorySections(
  projectId: string,
): Promise<MemorySection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memory_sections")
    .select(
      `id, position, number, title, brief, content, status, requirement_ids,
       word_target, generated_at,
       memory_sources (id, origin, page_number, label, quote)`,
    )
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  return (data ?? []) as unknown as MemorySection[];
}
