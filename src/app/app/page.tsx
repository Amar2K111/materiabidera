import Link from "next/link";
import { ArrowRight, FolderPlus } from "lucide-react";
import {
  getDashboardCounts,
  listProjectsWithProgress,
  type ProjectProgress,
} from "@/lib/data/projects";
import {
  NEXT_STEP,
  PROJECT_STATUS,
  deadlineLabel,
  formatDate,
} from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TrustPills } from "@/components/app/trust-pills";
import { cn } from "@/lib/utils/cn";

const RECOMMENDATION_LABELS: Record<
  "GO" | "VIGILANCE" | "NO_GO",
  { label: string; tone: "ok" | "warn" | "risk" }
> = {
  GO: { label: "GO", tone: "ok" },
  VIGILANCE: { label: "Sous réserve", tone: "warn" },
  NO_GO: { label: "NO-GO", tone: "risk" },
};

export default async function DashboardPage() {
  const [counts, projects] = await Promise.all([
    getDashboardCounts(),
    listProjectsWithProgress(6),
  ]);

  const metrics = [
    { label: "Dossiers actifs", value: counts.active },
    { label: "À analyser", value: counts.toProcess },
    { label: "Mémoires en rédaction", value: counts.writing },
    {
      label: "Échéances sous 7 jours",
      value: counts.dueSoon,
      tone: counts.dueSoon > 0 ? "is-warn" : undefined,
    },
  ];

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-ui__page-title">Tableau de bord</h1>
          <p className="app-ui__page-lead">
            De l&apos;analyse du DCE au mémoire technique vérifié — une vue claire
            sur chaque dossier en cours.
          </p>
        </div>
        <ButtonLink href="/app/dossiers/nouveau" className="h-11 flex-none">
          <FolderPlus className="h-4 w-4" strokeWidth={1.9} />
          Nouveau dossier
        </ButtonLink>
      </header>

      <div className="app-ui__metrics app-ui__metrics--4">
        {metrics.map((m) => (
          <div key={m.label} className={cn("app-ui__metric", m.tone)}>
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Dossiers récents
          </h2>
          {projects.length > 0 ? (
            <Link
              href="/app/dossiers"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand"
            >
              Tous les dossiers
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          ) : null}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="h-5 w-5" strokeWidth={1.8} />}
            title="Aucun dossier pour le moment"
            description="Un dossier regroupe un appel d'offres : DCE, exigences tracées, décision Go/No-Go, stratégie et mémoire technique. Commencez par déposer le DCE à traiter."
            action={
              <ButtonLink href="/app/dossiers/nouveau">
                Analyser mon premier DCE
              </ButtonLink>
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

      <TrustPills className="mt-10" />
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectProgress }) {
  const status = PROJECT_STATUS[project.status];
  const due = deadlineLabel(project.deadline);
  const next = NEXT_STEP[project.status];
  const decision = project.recommendation
    ? RECOMMENDATION_LABELS[project.recommendation]
    : null;

  return (
    <Link
      href={`/app/dossiers/${project.id}`}
      className="app-ui__project-card group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.015em]">
          {project.name}
        </h3>
        <Badge tone={status.tone} className="mt-0.5 flex-none">
          {status.label}
        </Badge>
      </div>

      <p className="mt-1.5 line-clamp-1 text-[12.5px] text-ink-58">
        {[project.buyer, project.lot].filter(Boolean).join(" · ") ||
          "Acheteur et lot non renseignés"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line-soft pt-3.5">
        <div>
          <p className="text-[11.5px] font-medium text-ink-42">Go / No-Go</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                "tabular text-[18px] leading-none font-bold",
                decision?.tone === "ok" && "text-ok",
                decision?.tone === "warn" && "text-warn",
                decision?.tone === "risk" && "text-risk",
                !decision && "text-ink-42",
              )}
            >
              {project.score ?? "—"}
            </span>
            {decision ? (
              <span className="text-[11.5px] font-semibold text-ink-58">
                {decision.label}
              </span>
            ) : null}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[11.5px] font-medium text-ink-42">Mémoire</p>
          {project.memoryProgress === null ? (
            <p className="tabular mt-1 text-[18px] leading-none font-bold text-ink-42">
              —
            </p>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <span className="app-ui__bar">
                <i style={{ width: `${project.memoryProgress}%` }} />
              </span>
              <span className="tabular flex-none text-[12px] font-semibold">
                {project.memoryProgress} %
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span
          className={cn(
            "text-[12.5px]",
            due.tone === "risk" && "font-semibold text-risk",
            due.tone === "warn" && "font-semibold text-warn",
            due.tone === "neutral" && "text-ink-58",
          )}
          title={formatDate(project.deadline)}
        >
          {due.text}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand">
          {next.label}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      </div>
    </Link>
  );
}
