import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NOT_FOUND } from "@/lib/ai/prompts/dce-overview";
import {
  isPlaceholderProjectName,
  parseSubmissionDeadline,
} from "@/lib/projects";
import { DceOverviewSchema } from "@/lib/ai/prompts/dce-overview";
import type { z } from "zod";

type OverviewValue = z.infer<typeof DceOverviewSchema>;

type ProjectRow = {
  name: string | null;
  reference: string | null;
  buyer: string | null;
  lot: string | null;
  deadline: string | null;
};

function usable(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed === NOT_FOUND) return null;
  return trimmed;
}

/**
 * Complete les champs du dossier a partir de la fiche d'identite extraite du DCE.
 * Les valeurs deja saisies par l'utilisateur ne sont jamais ecrasees.
 */
export async function syncProjectMetadataFromOverview(
  admin: SupabaseClient,
  input: {
    projectId: string;
    project: ProjectRow;
    overview: OverviewValue;
  },
): Promise<void> {
  const updates: Record<string, string> = {};

  const subject = usable(input.overview.subject.value);
  if (subject && isPlaceholderProjectName(input.project.name)) {
    updates.name = subject.slice(0, 240);
  }

  const buyer = usable(input.overview.buyer.value);
  if (buyer && !input.project.buyer?.trim()) {
    updates.buyer = buyer.slice(0, 240);
  }

  const lot = usable(input.overview.lot.value);
  if (lot && !input.project.lot?.trim()) {
    updates.lot = lot.slice(0, 240);
  }

  const submission = usable(input.overview.submissionDate.value);
  if (submission && !input.project.deadline) {
    const parsed = parseSubmissionDeadline(submission);
    if (parsed) updates.deadline = parsed;
  }

  if (Object.keys(updates).length === 0) return;

  await admin.from("projects").update(updates).eq("id", input.projectId);
}
