import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data/projects";
import { PROJECT_STATUS, deadlineLabel, formatDate } from "@/lib/projects";
import { AppFrame } from "@/components/app/app-frame";
import { ProjectSidebar } from "@/components/app/project-sidebar";
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

  if (!project) notFound();

  const status = PROJECT_STATUS[project.status];
  const due = deadlineLabel(project.deadline);
  const tagTone =
    status.tone === "ok"
      ? "is-ok"
      : status.tone === "warn"
        ? "is-warn"
        : status.tone === "risk"
          ? "is-risk"
          : "";

  return (
    <AppFrame
      crumb={
        <>
          <Link href="/app/dossiers">Dossiers</Link>
          {" / "}
          <b>{project.name}</b>
        </>
      }
      right={
        <>
          {project.lot ? (
            <span className="app-ui__tag is-neutral">{project.lot}</span>
          ) : null}
          <span className={`app-ui__tag ${tagTone}`}>{status.label}</span>
          <span className="app-ui__tag is-brand">{due.text}</span>
        </>
      }
      foot={
        <>
          <p>
            {[project.reference, project.buyer, formatDate(project.deadline)]
              .filter(Boolean)
              .join(" · ") || "Consultation BTP"}
          </p>
          <Link href={`/app/dossiers/${project.id}/export`} className="text-[12px] font-bold text-brand">
            Export Word / PDF
          </Link>
        </>
      }
    >
      <div className="app-ui__body">
        <ProjectSidebar projectId={project.id} />
        <div className="app-ui__content">
          <div className="mb-4 lg:hidden">
            <ProjectNav projectId={project.id} />
          </div>
          {children}
        </div>
      </div>
    </AppFrame>
  );
}
