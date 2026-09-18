import { FolderPlus } from "lucide-react";
import { listProjectsWithProgress } from "@/lib/data/projects";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectsTable } from "./projects-table";
import { listProjectOutcomes } from "@/lib/data/outcome";

export default async function DossiersPage() {
  const [projects, outcomes] = await Promise.all([
    listProjectsWithProgress(200),
    listProjectOutcomes(),
  ]);
  const outcomeById = Object.fromEntries(
    (outcomes ?? []).filter((o) => o.outcome).map((o) => [o.id, o.outcome]),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-ui__page-title">Dossiers</h1>
          <p className="app-ui__page-lead">
            Chaque appel d&apos;offres auquel vous répondez, du dépôt du DCE
            jusqu&apos;à l&apos;export de votre réponse.
          </p>
        </div>
        <ButtonLink href="/app/dossiers/nouveau" className="h-11 flex-none">
          <FolderPlus className="h-4 w-4" strokeWidth={1.9} />
          Nouveau dossier
        </ButtonLink>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderPlus className="h-5 w-5" strokeWidth={1.8} />}
          title="Aucun dossier pour le moment"
          description="Créez un dossier pour déposer un DCE, identifier les exigences, évaluer l'opportunité et construire votre mémoire technique."
          action={
            <ButtonLink href="/app/dossiers/nouveau">Créer un dossier</ButtonLink>
          }
        />
      ) : (
        <ProjectsTable projects={projects} outcomes={outcomeById} />
      )}
    </div>
  );
}
