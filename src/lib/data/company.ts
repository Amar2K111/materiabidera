import "server-only";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS, type CollectionDef } from "@/lib/company";

type Row = Record<string, unknown> & { id: string };

/** Fiches d'une collection. Les regles d'acces filtrent par organisation. */
export async function listCollection(
  collection: CollectionDef,
): Promise<Row[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(collection.table)
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as Row[];
}

/** Nombre de fiches par collection, pour situer l'etat de la base. */
export async function getCompanyCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const results = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const { count } = await supabase
        .from(c.table)
        .select("id", { count: "exact", head: true });
      return [c.table, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(results);
}

export type CompanyDocument = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind:
    | "REFERENCE"
    | "MEMOIRE"
    | "METHODE"
    | "CV"
    | "CERTIFICATION"
    | "QSE"
    | "MATERIEL"
    | "AUTRE";
  status: "UPLOADED" | "EXTRACTING" | "EXTRACTED" | "FAILED";
  page_count: number | null;
  failure_reason: string | null;
  created_at: string;
};

export async function listCompanyDocuments(): Promise<CompanyDocument[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_documents")
    .select(
      "id, storage_path, file_name, mime_type, size_bytes, kind, status, page_count, failure_reason, created_at",
    )
    .order("created_at", { ascending: false });

  return (data ?? []) as CompanyDocument[];
}
