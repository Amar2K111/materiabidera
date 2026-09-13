import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ChecklistGroup = "ADMINISTRATIF" | "TECHNIQUE" | "CONTROLE";

export type ChecklistEntry = {
  id: string;
  group: ChecklistGroup;
  label: string;
  detail: string;
  /** Point verifie par l'application, ou case a cocher par l'utilisateur. */
  automatic: boolean;
  passed: boolean;
};

export type ChecklistState = {
  entries: ChecklistEntry[];
  remaining: number;
  ready: boolean;
};

export const GROUP_LABELS: Record<ChecklistGroup, string> = {
  ADMINISTRATIF: "Administratif",
  TECHNIQUE: "Technique",
  CONTROLE: "Contrôle",
};

/**
 * Points a cocher par l'utilisateur.
 *
 * Ils portent sur des faits que l'application ne peut pas constater : elle ne
 * voit ni la validite d'une attestation, ni la signature d'un acte
 * d'engagement. Les presenter comme verifies serait mentir (section 37).
 */
const MANUAL_ITEMS: Array<{
  key: string;
  group: ChecklistGroup;
  label: string;
  detail: string;
}> = [
  {
    key: "engagement_signed",
    group: "ADMINISTRATIF",
    label: "Acte d'engagement complété et signé",
    detail: "Montants portés, signature électronique ou manuscrite apposée.",
  },
  {
    key: "attestations",
    group: "ADMINISTRATIF",
    label: "Attestations fiscales et sociales à jour",
    detail: "Attestation de vigilance URSSAF et régularité fiscale valides.",
  },
  {
    key: "insurance",
    group: "ADMINISTRATIF",
    label: "Attestations d'assurance en cours de validité",
    detail:
      "Responsabilité civile et décennale couvrant la nature des travaux.",
  },
  {
    key: "rc_pieces",
    group: "ADMINISTRATIF",
    label: "Toutes les pièces exigées par le règlement sont réunies",
    detail:
      "Relisez la liste du règlement de consultation pièce par pièce avant dépôt.",
  },
  {
    key: "schedule",
    group: "TECHNIQUE",
    label: "Planning d'exécution joint",
    detail: "Phasage et jalons cohérents avec le délai imposé.",
  },
  {
    key: "price_documents",
    group: "TECHNIQUE",
    label: "Pièces de prix complétées",
    detail: "DPGF ou BPU renseignés, sans ligne oubliée.",
  },
];

export async function getChecklist(
  projectId: string,
): Promise<ChecklistState> {
  const supabase = await createClient();

  const [
    { data: sections },
    { data: requirements },
    { data: documents },
    { data: check },
    { data: manual },
    references,
    employees,
    equipment,
    certifications,
  ] = await Promise.all([
    supabase
      .from("memory_sections")
      .select("id, content, requirement_ids, memory_sources (id)")
      .eq("project_id", projectId),
    supabase.from("requirements").select("id, status").eq("project_id", projectId),
    supabase.from("project_documents").select("kind").eq("project_id", projectId),
    supabase
      .from("quality_checks")
      .select("id, score, quality_issues (severity, resolved_at)")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("checklist_items")
      .select("id, auto_key, checked")
      .eq("project_id", projectId)
      .not("auto_key", "is", null),
    count(supabase, "company_references"),
    count(supabase, "company_employees"),
    count(supabase, "company_equipment"),
    count(supabase, "company_certifications"),
  ]);

  const allSections = sections ?? [];
  const written = allSections.filter(
    (s) => ((s.content as string) ?? "").trim().length > 0,
  );

  const allRequirements = requirements ?? [];
  const coveredIds = new Set<string>();
  for (const section of written) {
    for (const id of (section.requirement_ids ?? []) as string[]) {
      coveredIds.add(id);
    }
  }
  for (const r of allRequirements) {
    if (r.status === "COVERED") coveredIds.add(r.id as string);
  }

  const withSources = written.filter(
    (s) => ((s.memory_sources ?? []) as unknown[]).length > 0,
  ).length;

  const blockingOpen = (
    ((check?.quality_issues ?? []) as Array<{
      severity: string;
      resolved_at: string | null;
    }>) ?? []
  ).filter((i) => i.severity === "BLOCKING" && !i.resolved_at).length;

  const kinds = new Set((documents ?? []).map((d) => d.kind as string));

  // --- Points verifiables par l'application ----------------------------------
  const automatic: ChecklistEntry[] = [
    {
      id: "auto_engagement_doc",
      group: "ADMINISTRATIF",
      label: "Acte d'engagement présent au dossier",
      detail: kinds.has("ACTE_ENGAGEMENT")
        ? "Une pièce de ce type figure parmi les documents déposés."
        : "Aucune pièce classée comme acte d'engagement n'a été déposée.",
      automatic: true,
      passed: kinds.has("ACTE_ENGAGEMENT"),
    },
    {
      id: "auto_certifications",
      group: "ADMINISTRATIF",
      label: "Certifications enregistrées dans la base entreprise",
      detail: `${certifications} certification(s) enregistrée(s).`,
      automatic: true,
      passed: certifications > 0,
    },
    {
      id: "auto_memory_written",
      group: "TECHNIQUE",
      label: "Tous les chapitres du mémoire sont rédigés",
      detail: `${written.length} chapitre(s) rédigés sur ${allSections.length}.`,
      automatic: true,
      passed: allSections.length > 0 && written.length === allSections.length,
    },
    {
      id: "auto_references",
      group: "TECHNIQUE",
      label: "Références de chantiers enregistrées",
      detail: `${references} référence(s) enregistrée(s).`,
      automatic: true,
      passed: references > 0,
    },
    {
      id: "auto_means",
      group: "TECHNIQUE",
      label: "Moyens humains et matériels enregistrés",
      detail: `${employees} personne(s) et ${equipment} matériel(s) enregistrés.`,
      automatic: true,
      passed: employees > 0 && equipment > 0,
    },
    {
      id: "auto_coverage",
      group: "CONTROLE",
      label: "Toutes les exigences sont traitées",
      detail:
        allRequirements.length === 0
          ? "Aucune exigence n'a été relevée."
          : `${coveredIds.size} exigence(s) traitées sur ${allRequirements.length}.`,
      automatic: true,
      passed:
        allRequirements.length > 0 &&
        coveredIds.size === allRequirements.length,
    },
    {
      id: "auto_sources",
      group: "CONTROLE",
      label: "Chaque chapitre rédigé cite au moins une source",
      detail: `${withSources} chapitre(s) sur ${written.length} citent une source.`,
      automatic: true,
      passed: written.length > 0 && withSources === written.length,
    },
    {
      id: "auto_no_blocking",
      group: "CONTROLE",
      label: "Aucun problème bloquant en attente",
      detail: check
        ? `${blockingOpen} problème(s) bloquant(s) non traités.`
        : "Le contrôle qualité n'a pas encore été lancé.",
      automatic: true,
      passed: Boolean(check) && blockingOpen === 0,
    },
  ];

  // --- Points a la charge de l'utilisateur ------------------------------------
  const checkedByKey = new Map(
    (manual ?? []).map((m) => [m.auto_key as string, m.checked as boolean]),
  );

  const manualEntries: ChecklistEntry[] = MANUAL_ITEMS.map((item) => ({
    id: item.key,
    group: item.group,
    label: item.label,
    detail: item.detail,
    automatic: false,
    passed: checkedByKey.get(item.key) ?? false,
  }));

  const entries = [...automatic, ...manualEntries];
  const remaining = entries.filter((e) => !e.passed).length;

  return { entries, remaining, ready: remaining === 0 };
}

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
): Promise<number> {
  const { count: value } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  return value ?? 0;
}
