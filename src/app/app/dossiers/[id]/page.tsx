import { notFound } from "next/navigation";
import {
  getProject,
  getProjectProgressSummary,
  listProjectDocuments,
} from "@/lib/data/projects";
import { getDceAnalysis, listRequirements } from "@/lib/data/analysis";
import { getGoNoGo } from "@/lib/data/decision";
import { listMemorySections } from "@/lib/data/memory";
import { getQualityCheck } from "@/lib/data/quality";
import { daysUntil } from "@/lib/projects";
import { ProjectOverviewPanels } from "@/components/app/project-overview-panels";
import { OutcomePanel } from "@/components/app/outcome-panel";
import { getProjectOutcome } from "@/lib/data/outcome";
import { outcomeRelevant } from "@/lib/outcome";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    project,
    progress,
    documents,
    analysis,
    requirements,
    goNoGo,
    memorySections,
    quality,
    outcome,
  ] = await Promise.all([
    getProject(id),
    getProjectProgressSummary(id),
    listProjectDocuments(id),
    getDceAnalysis(id),
    listRequirements(id),
    getGoNoGo(id),
    listMemorySections(id),
    getQualityCheck(id),
    getProjectOutcome(id),
  ]);

  if (!project) notFound();

  const extracted = documents.filter((d) => d.status === "EXTRACTED");
  const failed = documents.filter((d) => d.status === "FAILED");
  const pages = extracted.reduce((sum, d) => sum + (d.page_count ?? 0), 0);
  const days = daysUntil(project.deadline);
  const vigilance = analysis?.vigilance_points.length ?? 0;

  const metrics = [
    {
      label: documents.length > 1 ? "pièces du DCE" : "pièce du DCE",
      value: String(documents.length),
    },
    {
      label: "pages lues",
      value: extracted.length > 0 ? String(pages) : "—",
    },
    {
      label: "exigences",
      value: requirements.length > 0 ? String(requirements.length) : "—",
    },
    {
      label: "points de vigilance",
      value: analysis ? String(vigilance) : "—",
      tone: vigilance > 0 ? "is-warn" : undefined,
    },
    {
      label: days !== null && days < 0 ? "date dépassée" : "jours restants",
      value: days === null ? "—" : String(Math.max(days, 0)),
      tone: days !== null && days <= 7 ? "is-warn" : undefined,
    },
    {
      label: "score Go / No-Go",
      value: goNoGo ? String(goNoGo.score) : "—",
      tone: goNoGo ? "is-brand" : undefined,
    },
  ];

  // Le resultat n a de sens qu une fois l offre prete ou la date limite passee.
  const showOutcome =
    outcome !== null &&
    outcomeRelevant({
      status: project.status,
      outcome: outcome.outcome,
      deadline: project.deadline,
    });

  const panels = (
    <ProjectOverviewPanels
      projectId={project.id}
      status={project.status}
      progress={progress}
      metrics={metrics}
      goNoGo={goNoGo}
      memorySections={memorySections}
      requirements={requirements}
      analysis={analysis}
      quality={quality}
      failedCount={failed.length}
    />
  );

  if (!showOutcome || !outcome) return panels;

  return (
    <div className="space-y-6">
      <OutcomePanel
        projectId={project.id}
        outcome={outcome.outcome}
        outcomeAt={outcome.outcome_at}
        outcomeNote={outcome.outcome_note}
      />
      {panels}
    </div>
  );
}
