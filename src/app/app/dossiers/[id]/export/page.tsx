import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { listMemorySections } from "@/lib/data/memory";
import { listExports } from "@/lib/data/quality";
import { getChecklist } from "@/lib/services/checklist";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportPanel } from "./export-panel";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, sections, exports, checklist] = await Promise.all([
    getProject(id),
    listMemorySections(id),
    listExports(id),
    getChecklist(id),
  ]);

  if (!project) notFound();

  const written = sections.filter((s) => (s.content ?? "").trim().length > 0);

  if (written.length === 0) {
    return (
      <EmptyState
        icon={<FileDown className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucun chapitre redige"
        description="L'export produit le memoire technique au format Word et PDF, avec couverture, sommaire, titres hierarchises et pagination."
        action={
          <Link href={`/app/dossiers/${project.id}/memoire`}>
            <Button>Rediger le memoire</Button>
          </Link>
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
    />
  );
}
