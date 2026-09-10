import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { getAppContext } from "@/lib/data/context";
import {
  getDashboardCounts,
  listProjectsWithProgress,
  type ProjectProgress,
} from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricRow, type Metric } from "@/components/ui/metrics";
import { cn } from "@/lib/utils/cn";

const RECOMMENDATION_LABELS: Record<
  "GO" | "VIGILANCE" | "NO_GO",
  { label: string; tone: "ok" | "warn" | "risk" }
> = {
  GO: { label: "GO", tone: "ok" },
  VIGILANCE: { label: "Sous reserve", tone: "warn" },
  NO_GO: { label: "NO-GO", tone: "risk" },
};

export default async function DashboardPage() {
  const [ctx, counts, projects] = await Promise.all([
    getAppContext(),
    getDashboardCounts(),
    listProjectsWithProgress(6),
  ]);

  const orgName = ctx?.organization?.name ?? "";

  const metrics: Metric[] = [
    { label: "Dossiers actifs", value: String(counts.active) },
    { label: "Dossiers a traiter", value: String(counts.toProcess) },
    { label: "Memoires en cours", value: String(counts.writing) },
    {
      label: "Echeances proches",
      value: String(counts.dueSoon),
      tone: counts.dueSoon > 0 ? "warn" : "neutral",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold tracking-[-0.038em]">
            Bonjour, {orgName}
          </h1>
          <p className="mt-2 text-[14.5px] text-ink-58">
            Voici l&apos;etat de vos reponses aux appels d&apos;offres.
          </p>
        </div>
        <Link href="/app/dossiers/nouveau" className="flex-none">
          <Button className="h-11">+ Nouveau dossier</Button>
        </Link>
      </header>

      <MetricRow items={metrics} />

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold">Dossiers recents</h2>
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
            description="Un dossier regroupe un appel d'offres : son DCE, les exigences detectees, votre decision Go/No-Go, votre strategie et votre memoire technique. Commencez par deposer le DCE que vous devez traiter."
            action={
              <Link href="/app/dossiers/nouveau">
                <Button>Analyser mon premier DCE</Button>
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
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

  return (
    <Link
      href={`/app/dossiers/${project.id}`}
      className="block rounded-[10px] border border-line bg-white p-4 shadow-card transition-colors hover:border-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-bold">{project.name}</h3>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <p className="mt-1.5 text-[12.5px] text-ink-58">
        {[project.buyer, project.lot].filter(Boolean).join(" | ") ||
          "Acheteur et lot non renseignes"}
      </p>

      {/* Une mesure qui n'a pas eu lieu s'affiche en tiret, jamais en zero. */}
      <div className="mt-4 flex items-center gap-5 border-t border-line-soft pt-3">
        <div>
          <p className="text-[10.5px] font-bold text-ink-42">Go / No-Go</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className={cn(
                "tabular text-[15px] font-extrabold",
                decision?.tone === "ok" && "text-ok",
                decision?.tone === "warn" && "text-warn",
                decision?.tone === "risk" && "text-risk",
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
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-line-soft">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${project.memoryProgress}%` }}
                />
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
