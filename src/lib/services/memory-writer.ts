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
import { stripCitationCodes } from "@/lib/citations";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import { rankByRelevance } from "@/lib/engine/relevance";
import type { AwardCriterion, AwardSubcriterion as Subcriterion } from "@/lib/requirements";
import { buildProjectContext } from "./project-context";
import { findCompanyEvidence } from "./company-context";
import { semanticSimilarities } from "./embeddings";
import { SEMANTIC_MIN, selectHybrid } from "@/lib/engine/semantic";

export type SectionOutcome = {
  sectionId: string;
  words: number;
  sources: number;
  toConfirm: string[];
};

/** Volume de passages du DCE transmis pour la redaction d'un chapitre. */
const EXCERPT_BUDGET = 45_000;
/** Volume des autres chapitres transmis pour la coherence. */
const OTHER_SECTIONS_BUDGET = 9_000;
const OTHER_SECTION_CHARS = 1_400;

export async function writeSection(input: {
  organizationId: string;
  projectId: string;
  sectionId: string;
  action: SectionAction;
  /** Probleme a corriger, pour l'action "fix". */
  instruction?: string;
}): Promise<SectionOutcome> {
  const admin = createAdminClient();
  const provider = getAiProvider();
  const engine = await isEngineSchemaReady();

  const { data: section } = await admin
    .from("memory_sections")
    .select(
      engine
        ? "id, number, title, brief, content, word_target, requirement_ids, criterion_ref"
        : "id, number, title, brief, content, word_target, requirement_ids",
    )
    .eq("id", input.sectionId)
    .eq("project_id", input.projectId)
    .maybeSingle();

  if (!section) {
    throw new AiError("Chapitre introuvable.", "conflict", "Chapitre introuvable.");
  }

  const row = section as unknown as {
    id: string;
    number: string | null;
    title: string;
    brief: string | null;
    content: string | null;
    word_target: number | null;
    requirement_ids: string[] | null;
    criterion_ref?: string | null;
  };

  const context = await buildProjectContext(admin, input);
  const requirementIds = row.requirement_ids ?? [];

  // --- Exigences rattachees, avec ce que l'acheteur attend -------------------
  const { data: requirementRows } = requirementIds.length
    ? await admin
        .from("requirements")
        .select(
          engine
            ? "id, text, category, priority, expected_answer, mandatory, buyer_intent, requirement_sources (document_id, page_number, quote, project_documents (file_name))"
            : "id, text, category, priority, expected_answer, requirement_sources (document_id, page_number, quote, project_documents (file_name))",
        )
        .in("id", requirementIds)
        // requirement_ids est modifiable par l'utilisateur : on ne lit que les
        // exigences de ce dossier, jamais celles d'un autre, meme par identifiant.
        .eq("project_id", input.projectId)
    : { data: [] };

  const refByRequirementId = new Map(
    [...context.requirementIdsByRef.entries()].map(([ref, id]) => [id, ref]),
  );

  type RequirementRow = {
    id: string;
    text: string;
    category: string;
    priority: string;
    expected_answer: string | null;
    mandatory?: boolean | null;
    buyer_intent?: string | null;
    requirement_sources: Array<{
      document_id: string | null;
      page_number: number | null;
      quote: string | null;
      project_documents: { file_name: string } | null;
    }>;
  };
  const sectionRequirements = (requirementRows ?? []) as unknown as RequirementRow[];

  const requirementsText = sectionRequirements
    .map((r) => {
      const ref = refByRequirementId.get(r.id) ?? "R?";
      const source = r.requirement_sources[0];
      return [
        `[${ref}] ${r.text}`,
        `  catégorie ${r.category}, priorité ${r.priority}${r.mandatory ? ", OBLIGATOIRE" : ""}`,
        r.expected_answer ? `  réponse attendue : ${r.expected_answer}` : null,
        r.buyer_intent
          ? `  ce que l'acheteur cherche vraisemblablement à vérifier (interprétation) : ${r.buyer_intent}`
          : null,
        source?.quote
          ? `  citation : « ${source.quote} » (${source.project_documents?.file_name ?? "document"}${source.page_number ? `, page ${source.page_number}` : ""})`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  // --- Critere de notation vise ------------------------------------------------
  const criterionText = describeCriterion(
    context.criteria,
    row.criterion_ref ?? null,
    `${row.title} ${row.brief ?? ""}`,
  );

  const query = [
    row.title,
    row.brief,
    criterionText,
    ...sectionRequirements.map((r) => `${r.text} ${r.expected_answer ?? ""}`),
  ]
    .filter(Boolean)
    .join("\n");

  // --- Passages du DCE : d'abord ceux qui fondent les exigences --------------
  const { data: pages } = await admin
    .from("document_pages")
    .select("document_id, page_number, label, content, project_documents (file_name)")
    .eq("project_id", input.projectId)
    .limit(600);

  const citedPages = new Set(
    sectionRequirements.flatMap((r) =>
      r.requirement_sources.map((s) => `${s.document_id}|${s.page_number ?? ""}`),
    ),
  );

  const pageItems = (pages ?? []).map((page, index) => ({
    id: `P${index}`,
    documentId: page.document_id as string,
    fileName:
      (page.project_documents as unknown as { file_name: string } | null)?.file_name ??
      "Document",
    pageNumber: page.page_number as number | null,
    label: (page.label as string) ?? "",
    text: page.content as string,
    cited: citedPages.has(`${page.document_id}|${page.page_number ?? ""}`),
  }));

  // Pages classees par le vocabulaire et par le sens ; celles qui fondent les
  // exigences du chapitre passent toujours en premier.
  const pageSimilarities = await semanticSimilarities(
    admin,
    input.organizationId,
    [query],
    pageItems.map((p) => ({ id: p.id, text: `${p.label}\n${p.text}` })),
  );
  const ranked = selectHybrid(query, pageItems, pageSimilarities, {
    limit: pageItems.length,
    keepAllBelow: pageItems.length,
  }).sort((a, b) => Number(b.cited) - Number(a.cited) || b.score - a.score);

  const excerpts: string[] = [];
  let budget = EXCERPT_BUDGET;
  let excerptIndex = 0;
  for (const page of ranked) {
    // Un passage sans lien avec le chapitre n'est transmis que s'il est cite.
    const related =
      page.lexical > 0 || (page.similarity !== null && page.similarity >= SEMANTIC_MIN);
    if (!page.cited && !related) continue;
    if (page.text.length > budget) continue;
    budget -= page.text.length;
    excerptIndex += 1;
    const id = `E${excerptIndex}`;
    context.sourcesById.set(id, [
      {
        documentId: page.documentId,
        documentName: page.fileName,
        pageNumber: page.pageNumber,
        label: page.label,
      },
    ]);
    excerpts.push(`[${id}] ${page.fileName} — ${page.label}\n${page.text}`);
  }

  // --- Preuves de l'entreprise pertinentes pour ce chapitre -------------------
  const evidence = context.snapshot.isEmpty
    ? {
        text: "La base entreprise est vide : aucune référence, aucun moyen, aucune certification n'a été renseigné.",
        selected: [],
      }
    : await findCompanyEvidence(admin, input.organizationId, context.snapshot, [query], {
        itemLimit: 25,
        documentLimit: 8,
      });

  // --- Autres chapitres, pour la coherence -------------------------------------
  const { data: others } = await admin
    .from("memory_sections")
    .select("id, number, title, content, position")
    .eq("project_id", input.projectId)
    .neq("id", input.sectionId)
    .order("position", { ascending: true });

  let othersBudget = OTHER_SECTIONS_BUDGET;
  const otherSections = (others ?? [])
    .filter((s) => ((s.content as string) ?? "").trim().length > 0)
    .map((s) => {
      const text = stripCitationCodes(s.content as string).slice(0, OTHER_SECTION_CHARS);
      if (text.length > othersBudget) return null;
      othersBudget -= text.length;
      return `${s.number ?? ""} ${s.title}\n${text}${(s.content as string).length > OTHER_SECTION_CHARS ? " […]" : ""}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

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
    : "Aucune stratégie n'a été établie.";

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
      companyEvidence: evidence.selected.length,
      // Vrai si les preuves ont ete choisies aussi par le sens (embeddings).
      semanticSearch: "semantic" in evidence ? evidence.semantic : false,
      semanticPages: pageSimilarities !== null,
      otherSections: (others ?? []).length,
    },
  });

  try {
    const { value, usage } = await provider.generateObject({
      system: SECTION_SYSTEM,
      prompt: sectionPrompt({
        projectName: context.projectName,
        sectionNumber: row.number ?? "",
        sectionTitle: row.title,
        brief: row.brief ?? "",
        wordTarget: row.word_target ?? 600,
        criterion: criterionText,
        marketSummary: context.dceSummary,
        requirements: requirementsText,
        strategy: strategyText,
        dceExcerpts: excerpts.join("\n\n---\n\n"),
        companyBase: evidence.text,
        otherSections,
        action: input.action,
        currentContent: row.content ?? undefined,
        instruction: input.action === "fix" ? input.instruction : undefined,
      }),
      schema: SectionDraftSchema,
      schemaName: "SectionDraft",
      maxOutputTokens: 16000,
    });

    // --- Sources ---------------------------------------------------------------
    // Un identifiant inconnu est ecarte : le chapitre ne peut pas afficher une
    // source qui n'existe pas.
    const companyById = new Map(
      [...context.snapshot.items, ...context.snapshot.documents].map((i) => [i.id, i]),
    );

    type SourceRow = {
      organization_id: string;
      section_id: string;
      origin: "DCE" | "ENTREPRISE";
      label: string;
      page_number?: number | null;
      document_id?: string | null;
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
        document_id: s.documentId || null,
        // Sans page (Word, tableur), le libelle du passage situe la source.
        label: s.pageNumber
          ? `${s.documentName}, page ${s.pageNumber}`
          : s.label && s.label !== "document"
            ? `${s.documentName}, ${s.label}`
            : s.documentName,
      }));
    });

    const seenSources = new Set<string>();
    const uniqueRows = rows.filter((r) => {
      const key = `${r.origin}|${r.company_record_id ?? ""}|${r.label}`;
      if (seenSources.has(key)) return false;
      seenSources.add(key);
      return true;
    });

    // Le texte est remis tel quel a l'acheteur : aucun identifiant interne.
    const content = stripCitationCodes(value.content).trim();
    const words = content.split(/\s+/).length;
    const toConfirm = value.toConfirm.map((t) => stripCitationCodes(t));

    // Une regeneration ne detruit jamais un texte : la version precedente est
    // conservee et peut etre restauree.
    if (engine && (row.content ?? "").trim().length > 0) {
      await admin.from("memory_section_versions").insert({
        organization_id: input.organizationId,
        section_id: input.sectionId,
        content: row.content,
        origin: input.action === "generate" ? "generation" : input.action,
      });
    }

    await admin.from("memory_sources").delete().eq("section_id", input.sectionId);
    if (uniqueRows.length > 0) {
      await admin.from("memory_sources").insert(uniqueRows);
    }

    await admin
      .from("memory_sections")
      .update({
        content,
        status: "GENERATED",
        provider: provider.id,
        model: provider.model,
        generated_at: new Date().toISOString(),
        ...(engine
          ? {
              evidence: {
                criterion: criterionText,
                company: evidence.selected,
                dcePassages: excerpts.length,
                semantic: "semantic" in evidence ? evidence.semantic : false,
                toConfirm,
              },
            }
          : {}),
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
        sources: uniqueRows.length,
        toConfirm: toConfirm.length,
        outputTokens: usage.outputTokens ?? 0,
      },
    });

    return {
      sectionId: input.sectionId,
      words,
      sources: uniqueRows.length,
      toConfirm,
    };
  } catch (error) {
    await finishRun(admin, run, {
      status: "FAILED",
      reason: error instanceof Error ? error.message : "echec",
    });
    throw error;
  }
}

/**
 * Description du critere vise par un chapitre.
 *
 * Le rattachement etabli au plan est prioritaire. A defaut, le critere dont
 * l'intitule est le plus proche du chapitre est propose, en le signalant.
 */
function describeCriterion(
  criteria: AwardCriterion[],
  ref: string | null,
  sectionText: string,
): string {
  if (criteria.length === 0) {
    return "Aucun critère de notation n'a été identifié dans le dossier.";
  }

  const flat = criteria.flatMap((c) => [
    { key: c.label, criterion: c, sub: null as Subcriterion | null },
    ...(c.subcriteria ?? []).map((sub) => ({ key: `${c.label} > ${sub.label}`, criterion: c, sub })),
  ]);

  const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

  let match = ref ? flat.find((f) => normalize(f.key) === normalize(ref)) : undefined;
  if (!match && ref) {
    match = flat.find(
      (f) => normalize(ref).includes(normalize(f.sub?.label ?? f.criterion.label)),
    );
  }

  let inferred = false;
  if (!match) {
    const best = rankByRelevance(
      sectionText,
      flat.map((f, index) => ({
        id: String(index),
        text: `${f.key} ${f.sub?.detail ?? f.criterion.detail}`,
      })),
    )[0];
    if (best && best.score > 0) {
      match = flat[Number(best.id)];
      inferred = true;
    }
  }

  if (!match) {
    return `Aucun critère n'est explicitement rattaché. Critères du marché : ${criteria
      .map((c) => `${c.label} (${c.weight})`)
      .join(" ; ")}.`;
  }

  const c = match.criterion;
  const lines = [
    `${c.label} — pondération : ${c.weight}${c.weightValue === null ? " (non précisée dans le dossier)" : ""}`,
  ];
  if (match.sub) {
    lines.push(`Sous-critère : ${match.sub.label} — pondération : ${match.sub.weight}`);
    if (match.sub.detail) lines.push(`Détail : ${match.sub.detail}`);
  } else if (c.detail) {
    lines.push(`Détail : ${c.detail}`);
  }
  if ((c.expectedElements ?? []).length > 0) {
    lines.push(`Éléments appréciés : ${(c.expectedElements ?? []).join(" ; ")}`);
  }
  if (inferred) {
    lines.push("(Rattachement déduit de l'intitulé du chapitre, à confirmer.)");
  }
  return lines.join("\n");
}
