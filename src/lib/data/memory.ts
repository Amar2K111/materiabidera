import "server-only";
import { createClient } from "@/lib/supabase/server";
import { stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";

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
  /** Critere traite par le chapitre (migration 0008). */
  criterion_ref?: string | null;
};

export type SectionVersion = {
  id: string;
  content: string;
  origin: string;
  created_at: string;
};

export async function listMemorySections(
  projectId: string,
): Promise<MemorySection[]> {
  const supabase = await createClient();
  const engine = await isEngineSchemaReady();
  const { data } = await supabase
    .from("memory_sections")
    .select(
      `id, position, number, title, brief, content, status, requirement_ids,
       word_target, generated_at,${engine ? " criterion_ref," : ""}
       memory_sources (id, origin, page_number, label, quote)`,
    )
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  const sections = (data ?? []) as unknown as MemorySection[];
  for (const section of sections) {
    section.content = stripCitationCodes(section.content);
    section.brief = stripCitationCodes(section.brief);
    // Les plans construits avant le nettoyage a la source portaient encore
    // l'identifiant du critere : il ne doit jamais s'afficher.
    if (section.criterion_ref) section.criterion_ref = stripCitationCodes(section.criterion_ref);
    section.memory_sources = dedupeSources(section.memory_sources ?? []);
  }
  return sections;
}

/** Plusieurs extraits pointent souvent vers la meme page : une seule entree. */
function dedupeSources(sources: MemorySource[]): MemorySource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = `${s.origin}|${s.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
