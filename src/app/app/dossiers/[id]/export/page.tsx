import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { listMemorySections } from "@/lib/data/memory";
import { getDceAnalysis } from "@/lib/data/analysis";
import { listExports } from "@/lib/data/quality";
import { getChecklist } from "@/lib/services/checklist";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportPanel } from "./export-panel";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, sections, exports, checklist, analysis] = await Promise.all([
    getProject(id),
    listMemorySections(id),
    listExports(id),
    getChecklist(id),
    getDceAnalysis(id),
  ]);

  if (!project) notFound();

  const written = sections.filter((s) => (s.content ?? "").trim().length > 0);

  if (written.length === 0) {
    return (
      <EmptyState
        icon={<FileDown className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucun chapitre rédigé"
        description="L'export produit le mémoire technique au format Word et PDF, avec couverture, sommaire, titres hiérarchisés et pagination."
        action={
          <ButtonLink href={`/app/dossiers/${project.id}/memoire`}>Rédiger le mémoire</ButtonLink>
        }
      />
    );
  }

  return (
    <ExportPanel
      projectId={project.id}
      exports={exports}
      writtenCount={written.length}
      totalCount={sections.length}
      remaining={checklist.remaining}
      responseFormat={analysis?.response_format ?? null}
    />
  );
}
