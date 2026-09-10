import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { listRequirements } from "@/lib/data/analysis";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RequirementsMatrix } from "./requirements-matrix";

export default async function ProjectRequirementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, requirements] = await Promise.all([
    getProject(id),
    listRequirements(id),
  ]);

  if (!project) notFound();

  if (requirements.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucune exigence identifiee"
        description="Les exigences sont extraites du dossier de consultation lors de l'analyse. Chacune est rattachee au passage du document qui la fonde."
        action={
          <Link href={`/app/dossiers/${project.id}/analyse`}>
            <Button>Analyser le dossier</Button>
          </Link>
        }
      />
    );
  }

  return (
    <RequirementsMatrix projectId={project.id} requirements={requirements} />
  );
}
