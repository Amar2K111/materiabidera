import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarClock, ChevronRight, Layers } from "lucide-react";
import {
  getProject,
  getProjectProgressSummary,
  type ProjectProgressSummary,
} from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import {
  ProjectNav,
  type StepSegment,
  type StepState,
} from "@/components/app/project-nav";
import { ProjectStepFooter } from "@/components/app/project-step-footer";
import { DeleteProjectButton } from "@/components/app/delete-project-button";
import { nextStepFor } from "@/lib/next-step";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, progress] = await Promise.all([
    getProject(id),
    getProjectProgressSummary(id),
  ]);

  if (!project) notFound();

  const status = PROJECT_STATUS[project.status];
  const due = deadlineLabel(project.deadline);
  // Meme source que le panneau "Prochaine etape" de la synthese : une seule
  // definition de ce qu'il reste a faire, quel que soit l'endroit ou on l'affiche.
  const next = nextStepFor(project.status, progress);

  return (
    <div className="app-ui__project">
      <header className="app-ui__project-head">
        <div className="min-w-0">
          <nav className="app-ui__project-crumb" aria-label="Fil d'Ariane">
            <Link href="/app/dossiers">Dossiers</Link>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
            <span className="truncate">{project.reference ?? "Dossier"}</span>
          </nav>
          <h1 className="app-ui__project-title">{project.name}</h1>
          <div className="app-ui__project-meta">
            {project.buyer ? (
              <span>
                <Building2 strokeWidth={1.8} aria-hidden />
                {project.buyer}
              </span>
            ) : null}
            {project.lot ? (
              <span>
                <Layers strokeWidth={1.8} aria-hidden />
                {project.lot}
              </span>
            ) : null}
            <span>
              <CalendarClock strokeWidth={1.8} aria-hidden />
              {project.deadline ? formatDate(project.deadline) : "Sans date limite"}
              {project.deadline ? (
                <b
                  className={cn(
                    "font-semibold",
                    due.tone === "risk" && "text-risk",
                    due.tone === "warn" && "text-warn",
                    due.tone === "neutral" && "text-ink-70",
                  )}
                >
                  · {due.text}
                </b>
              ) : null}
            </span>
          </div>
        </div>
        <div className="flex flex-none items-center gap-2">
          {project.is_demo ? <Badge>Dossier exemple</Badge> : null}
          <Badge tone={status.tone === "neutral" ? "neutral" : status.tone}>
            {status.label}
          </Badge>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </header>

      <ProjectNav projectId={project.id} steps={buildSteps(progress)} />

      {children}

      <ProjectStepFooter
        projectId={project.id}
        nextSegment={next.segment}
        nextLabel={next.label}
      />
    </div>
  );
}

function buildSteps(
  p: ProjectProgressSummary,
): Partial<Record<StepSegment, StepState>> {
  return {
    documents:
      p.failedDocuments > 0
        ? {
            state: "warn",
            hint: `${p.failedDocuments} pièce(s) illisible(s)`,
          }
        : {
            state: p.documents > 0 && p.pendingDocuments === 0 ? "done" : "todo",
            hint:
              p.pendingDocuments > 0
                ? `${p.pendingDocuments} pièce(s) en attente de lecture`
                : undefined,
          },
    analyse: { state: p.hasAnalysis ? "done" : "todo" },
    "go-no-go": p.decision
      ? {
          state: p.decision === "GO" ? "done" : "warn",
          hint:
            p.decision === "NO_GO"
              ? "Recommandation : ne pas répondre"
              : p.decision === "VIGILANCE"
                ? "Recommandation : répondre sous réserve"
                : undefined,
        }
      : { state: "todo" },
    exigences:
      p.requirements > 0
        ? {
            state:
              p.coveredRequirements === p.requirements ? "done" : "todo",
            count: `${p.coveredRequirements}/${p.requirements}`,
            hint: "Exigences couvertes",
          }
        : { state: "todo" },
    strategie: { state: p.hasStrategy ? "done" : "todo" },
    memoire:
      p.sections > 0
        ? {
            state: p.writtenSections === p.sections ? "done" : "todo",
            count: `${p.writtenSections}/${p.sections}`,
            hint: "Chapitres rédigés",
          }
        : { state: "todo" },
    controle: p.hasQuality
      ? p.openBlockingIssues > 0
        ? {
            state: "warn",
            hint: `${p.openBlockingIssues} problème(s) bloquant(s) à traiter`,
          }
        : { state: "done" }
      : { state: "todo" },
    export: { state: p.exports > 0 ? "done" : "todo" },
  };
}
