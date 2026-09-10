import { notFound } from "next/navigation";
import { getProject, listProjectDocuments } from "@/lib/data/projects";
import { getAppContext } from "@/lib/data/context";
import { DocumentsSection } from "./documents-section";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ctx, project, documents] = await Promise.all([
    getAppContext(),
    getProject(id),
    listProjectDocuments(id),
  ]);

  if (!project || !ctx?.organization) notFound();

  return (
    <DocumentsSection
      organizationId={ctx.organization.id}
      projectId={project.id}
      documents={documents}
    />
  );
}
