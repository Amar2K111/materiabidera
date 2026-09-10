import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { AiError, getAiProvider } from "@/lib/ai";
import { finishRun, startRun } from "@/lib/ai/run-log";
import {
  SECTION_SYSTEM,
  SectionDraftSchema,
  sectionPrompt,
  type SectionAction,
} from "@/lib/ai/prompts/memory-section";
import { buildProjectContext } from "./project-context";

export type SectionOutcome = {
  sectionId: string;
  words: number;
  sources: number;
  toConfirm: string[];
};

/** Volume d'extraits du DCE transmis pour la redaction d'un chapitre. */
const EXCERPT_BUDGET = 60_000;

export async function writeSection(input: {
  organizationId: string;
  projectId: string;
  sectionId: string;
  action: SectionAction;
}): Promise<SectionOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();

  const { data: section } = await admin
    .from("memory_sections")
    .select("id, number, title, brief, content, word_target, requirement_ids")
    .eq("id", input.sectionId)
    .eq("project_id", input.projectId)
    .maybeSingle();

  if (!section) {
    throw new AiError("Chapitre introuvable.", "conflict", "Chapitre introuvable.");
  }

  const context = await buildProjectContext(admin, input);

  // --- Exigences rattachees a ce chapitre -------------------------------------
  const requirementIds = (section.requirement_ids ?? []) as string[];
  const refByRequirementId = new Map(
    [...context.requirementIdsByRef.entries()].map(([ref, id]) => [id, ref]),
  );

  const sectionRequirements = requirementIds
    .map((id) => {
      const ref = refByRequirementId.get(id);
      if (!ref) return null;
      const index = Number(ref.slice(1)) - 1;
      return context.requirementLines[index] ?? null;
    })
    .filter((line): line is string => Boolean(line));

  // --- Extraits du DCE --------------------------------------------------------
  const { data: pages } = await admin
    .from("document_pages")
    .select("page_number, label, content, project_documents (file_name)")
    .eq("project_id", input.projectId)
    .order("page_number", { ascending: true, nullsFirst: true })
    .limit(300);

  const excerpts: string[] = [];
  let budget = EXCERPT_BUDGET;

  for (const [index, page] of (pages ?? []).entries()) {
    const text = page.content as string;
    if (text.length > budget) break;
    budget -= text.length;

    const id = `E${index + 1}`;
    const doc = page.project_documents as unknown as {
      file_name: string;
    } | null;

    context.sourcesById.set(id, [
      {
        documentId: "",
        documentName: doc?.file_name ?? "Document",
        pageNumber: page.page_number as number | null,
        label: (page.label as string) ?? "",
      },
    ]);

    excerpts.push(
      `[${id}] ${doc?.file_name ?? "Document"} — ${page.label}\n${text}`,
    );
  }

  // --- Strategie --------------------------------------------------------------
  const { data: strategy } = await admin
    .from("tender_strategies")
    .select("priorities, recommendations")
    .eq("project_id", input.projectId)
    .maybeSingle();

  const strategyText = strategy
    ? [
        ...((strategy.priorities ?? []) as Array<{
          rank: number;
          title: string;
          rationale: string;
        }>).map((p) => `${p.rank}. ${p.title} — ${p.rationale}`),
        ...((strategy.recommendations ?? []) as Array<{
          title: string;
          detail: string;
        }>).map((r) => `- ${r.title} : ${r.detail}`),
      ].join("\n")
    : "Aucune strategie n'a ete etablie.";

  // --- Redaction --------------------------------------------------------------
  const run = await startRun(admin, {
    organizationId: input.organizationId,
    projectId: input.projectId,
    operation: `memory_section_${input.action}`,
    provider: provider.id,
    model: provider.model,
    meta: {
      requirements: sectionRequirements.length,
      excerpts: excerpts.length,
      companyItems: context.snapshot.items.length,
    },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: SECTION_SYSTEM,
      prompt: sectionPrompt({
        projectName: context.projectName,
        sectionNumber: (section.number as string) ?? "",
        sectionTitle: section.title as string,
        brief: (section.brief as string) ?? "",
        wordTarget: (section.word_target as number) ?? 600,
        requirements: sectionRequirements.join("\n"),
        strategy: strategyText,
        dceExcerpts: excerpts.join("\n\n---\n\n"),
        companyBase: context.companyBase,
        action: input.action,
        currentContent: (section.content as string) ?? undefined,
      }),
      schema: SectionDraftSchema,
      schemaName: "SectionDraft",
      maxOutputTokens: 16000,
    });

    // --- Sources ---------------------------------------------------------------
    // Un identifiant inconnu est ecarte : le chapitre ne peut pas afficher une
    // source qui n'existe pas.
    const companyById = new Map(
      context.snapshot.items.map((i) => [i.id, i]),
    );

    type SourceRow = {
      organization_id: string;
      section_id: string;
      origin: "DCE" | "ENTREPRISE";
      label: string;
      page_number?: number | null;
      company_table?: string;
      company_record_id?: string;
    };

    const rows = value.sourceIds.flatMap<SourceRow>((id) => {
      const company = companyById.get(id);
      if (company) {
        return [
          {
            organization_id: input.organizationId,
            section_id: input.sectionId,
            origin: "ENTREPRISE",
            company_table: company.table,
            company_record_id: company.recordId,
            label: company.label,
          },
        ];
      }

      return (context.sourcesById.get(id) ?? []).map((s) => ({
        organization_id: input.organizationId,
        section_id: input.sectionId,
        origin: "DCE" as const,
        page_number: s.pageNumber,
        label: s.pageNumber
          ? `${s.documentName}, page ${s.pageNumber}`
          : s.documentName,
      }));
    });

    await admin.from("memory_sources").delete().eq("section_id", input.sectionId);
    if (rows.length > 0) await admin.from("memory_sources").insert(rows);

    const words = value.content.trim().split(/\s+/).length;

    await admin
      .from("memory_sections")
      .update({
        content: value.content,
        status: "GENERATED",
        provider: provider.id,
        model: provider.model,
        generated_at: new Date().toISOString(),
      })
      .eq("id", input.sectionId);

    // Le dossier passe en redaction des le premier chapitre produit.
    const { data: project } = await admin
      .from("projects")
      .select("status")
      .eq("id", input.projectId)
      .single();

    if (
      project?.status &&
      ["GO", "STRATEGY_READY", "ANALYZED"].includes(project.status as string)
    ) {
      await admin
        .from("projects")
        .update({ status: "WRITING" })
        .eq("id", input.projectId);
    }

    await finishRun(admin, run, {
      status: "SUCCEEDED",
      meta: {
        words,
        sources: rows.length,
        toConfirm: value.toConfirm.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return {
      sectionId: input.sectionId,
      words,
      sources: rows.length,
      toConfirm: value.toConfirm,
    };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}
