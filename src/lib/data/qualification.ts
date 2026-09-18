import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isPipelineSchemaReady } from "@/lib/engine/pipeline-schema";
import { parseRules, type QualificationRule } from "@/lib/qualification";

export type QualificationSettings = {
  /** Faux tant que la migration 0011 n'est pas appliquee. */
  available: boolean;
  rules: QualificationRule[];
};

/** Criteres de qualification de l'entreprise courante. */
export async function getQualificationRules(
  organizationId: string,
): Promise<QualificationSettings> {
  if (!(await isPipelineSchemaReady())) return { available: false, rules: [] };

  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("qualification_rules")
    .eq("id", organizationId)
    .maybeSingle();

  return { available: true, rules: parseRules(data?.qualification_rules) };
}
