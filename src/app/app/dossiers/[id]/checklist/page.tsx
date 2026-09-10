import { notFound } from "next/navigation";
import { getProject } from "@/lib/data/projects";
import { getAppContext } from "@/lib/data/context";
import { getChecklist, GROUP_LABELS } from "@/lib/services/checklist";
import { ChecklistPanel } from "./checklist-panel";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ctx, project, checklist] = await Promise.all([
    getAppContext(),
    getProject(id),
    getChecklist(id),
  ]);

  if (!project || !ctx?.organization) notFound();

  return (
    <ChecklistPanel
      projectId={project.id}
      organizationId={ctx.organization.id}
      checklist={checklist}
      groupLabels={GROUP_LABELS}
    />
  );
}
