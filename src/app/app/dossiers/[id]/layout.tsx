import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { ProjectNav } from "@/components/app/project-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  // RLS renvoie une ligne vide pour un dossier d'une autre organisation :
  // le comportement est donc identique a un dossier inexistant.
  if (!project) notFound();

  const status = PROJECT_STATUS[project.status];
  const due = deadlineLabel(project.deadline);

  return (
    <div>
      <nav className="text-[13px] font-semibold text-ink-42">
        <Link href="/app/dossiers" className="hover:text-ink">
          Dossiers
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-ink">{project.name}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] font-extrabold tracking-[-0.035em]">
              {project.name}
            </h1>
            <Badge tone={status.tone}>{status.label}</Badge>
            {project.is_demo ? <Badge tone="neutral">Dossier exemple</Badge> : null}
          </div>

          <p className="mt-2 text-[13.5px] text-ink-58">
            {[project.reference, project.buyer, project.lot]
              .filter(Boolean)
              .join(" | ") || "Reference, acheteur et lot non renseignes"}
          </p>
        </div>

        <div className="flex-none text-right">
          <p className="text-[13px] font-semibold">
            {formatDate(project.deadline)}
          </p>
          <p
            className={
              due.tone === "risk"
                ? "mt-0.5 text-[12.5px] font-bold text-risk"
                : due.tone === "warn"
                  ? "mt-0.5 text-[12.5px] font-bold text-warn"
                  : "mt-0.5 text-[12.5px] text-ink-42"
            }
          >
            {due.text}
          </p>
        </div>
      </header>

      <div className="mt-6">
        <ProjectNav projectId={project.id} />
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
