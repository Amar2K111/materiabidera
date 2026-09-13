import Link from "next/link";
import { FolderPlus } from "lucide-react";
import {
  getDashboardCounts,
  listProjectsWithProgress,
  type ProjectProgress,
} from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustPills } from "@/components/app/trust-pills";
import { WorkflowStrip } from "@/components/app/workflow-strip";
import { cn } from "@/lib/utils/cn";

const RECOMMENDATION_LABELS: Record<
  "GO" | "VIGILANCE" | "NO_GO",
  { label: string; tone: string }
> = {
  GO: { label: "GO", tone: "is-ok" },
  VIGILANCE: { label: "Sous réserve", tone: "is-warn" },
  NO_GO: { label: "NO-GO", tone: "is-risk" },
};

export default async function DashboardPage() {
  const [counts, projects] = await Promise.all([
    getDashboardCounts(),
    listProjectsWithProgress(6),
  ]);

  const metrics = [
    { label: "Dossiers actifs", value: String(counts.active) },
    { label: "Dossiers à traiter", value: String(counts.toProcess) },
    { label: "Mémoires en cours", value: String(counts.writing) },
    {
      label: "Échéances proches",
      value: String(counts.dueSoon),
      tone: counts.dueSoon > 0 ? "is-warn" : undefined,
    },
  ];

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-ui__page-title">Tableau de bord</h1>
          <p className="app-ui__page-lead">
            De l&apos;analyse du DCE au mémoire technique vérifié — une vue claire
            sur chaque dossier en cours.
          </p>
          <TrustPills className="mt-4" />
          <WorkflowStrip className="mt-5" />
        </div>
        <Link href="/app/dossiers/nouveau" className="flex-none">
          <Button className="h-11">+ Nouveau dossier</Button>
        </Link>
      </header>

      <div className="app-ui__metrics app-ui__metrics--4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`app-ui__metric${m.tone ? ` ${m.tone}` : ""}`}
          >
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Dossiers récents</h2>
          {projects.length > 0 ? (
            <Link
              href="/app/dossiers"
              className="text-[13px] font-semibold text-brand"
            >
              Tout voir
            </Link>
          ) : null}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="h-5 w-5" strokeWidth={1.8} />}
            title="Aucun dossier pour le moment"
            description="Un dossier regroupe un appel d'offres : DCE, exigences tracées, décision Go/No-Go, stratégie et mémoire technique. Commencez par déposer le DCE à traiter."
            action={
              <Link href="/app/dossiers/nouveau">
                <Button>Analyser mon premier DCE</Button>
              </Link>
            }
          />
        ) : (
          <ul className="app-ui__card-grid">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectProgress }) {
  const status = PROJECT_STATUS[project.status];
  const due = deadlineLabel(project.deadline);
  const decision = project.recommendation
    ? RECOMMENDATION_LABELS[project.recommendation]
    : null;
  const tagTone =
    status.tone === "ok"
      ? "is-ok"
      : status.tone === "warn"
        ? "is-warn"
        : status.tone === "risk"
          ? "is-risk"
          : "";

  return (
    <Link href={`/app/dossiers/${project.id}`} className="app-ui__project-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.015em]">{project.name}</h3>
        <span className={`app-ui__tag ${tagTone}`}>{status.label}</span>
      </div>

      <p className="mt-1.5 text-[12.5px] text-ink-58">
        {[project.buyer, project.lot].filter(Boolean).join(" | ") ||
          "Acheteur et lot non renseignes"}
      </p>

      <div className="mt-4 flex items-center gap-5 border-t border-line-soft pt-3">
        <div>
          <p className="text-[10.5px] font-bold text-ink-42">Go / No-Go</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className={cn(
                "tabular text-[15px] font-extrabold",
                decision?.tone === "is-ok" && "text-ok",
                decision?.tone === "is-warn" && "text-warn",
                decision?.tone === "is-risk" && "text-risk",
                !decision && "text-ink-42",
              )}
            >
              {project.score ?? "—"}
            </span>
            {decision ? (
              <span className="text-[10.5px] font-bold text-ink-42">
                {decision.label}
              </span>
            ) : null}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold text-ink-42">Memoire</p>
          {project.memoryProgress === null ? (
            <p className="tabular mt-0.5 text-[15px] font-extrabold text-ink-42">
              —
            </p>
          ) : (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="app-ui__bar h-1 flex-1">
                <i style={{ width: `${project.memoryProgress}%` }} />
              </span>
              <span className="tabular flex-none text-[11.5px] font-bold">
                {project.memoryProgress} %
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[12px] text-ink-42">
          {formatDate(project.deadline)}
        </span>
        <span
          className={cn(
            "text-[12px] font-semibold",
            due.tone === "risk" && "font-bold text-risk",
            due.tone === "warn" && "font-bold text-warn",
            due.tone === "neutral" && "text-ink-58",
          )}
        >
          {due.text}
        </span>
      </div>
    </Link>
  );
}
