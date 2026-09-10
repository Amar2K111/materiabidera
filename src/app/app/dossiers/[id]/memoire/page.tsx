import Link from "next/link";
import { notFound } from "next/navigation";
import { BookText } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { listMemorySections } from "@/lib/data/memory";
import { getAppContext } from "@/lib/data/context";
import { isAiConfigured } from "@/lib/ai";
import { OperationButton } from "@/components/app/operation-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { MemoryEditor } from "./memory-editor";

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ctx, project, analysis, sections] = await Promise.all([
    getAppContext(),
    getProject(id),
    getDceAnalysis(id),
    listMemorySections(id),
  ]);

  if (!project || !ctx?.organization) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configure">
        <p className="mt-1">
          La construction du plan et la redaction necessitent un moteur
          d&apos;analyse. Vous pouvez neanmoins rediger vos chapitres a la main
          une fois le plan cree.
        </p>
      </Notice>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={<BookText className="h-5 w-5" strokeWidth={1.8} />}
        title="Le dossier doit d'abord etre analyse"
        description="Le plan du memoire est construit a partir du reglement de consultation, des criteres de jugement et du cadre de memoire impose lorsqu'il en existe un."
        action={
          <Link href={`/app/dossiers/${project.id}/analyse`}>
            <Button>Analyser le dossier</Button>
          </Link>
        }
      />
    );
  }

  if (sections.length === 0) {
    return (
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Construire le plan</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          Le plan est etabli pour cette consultation precise : il suit le cadre
          de memoire s&apos;il en existe un, sinon il se structure sur les
          criteres de jugement et les exigences relevees. Aucun plan type
          n&apos;est applique.
        </p>
        <div className="mt-6">
          <OperationButton
            projectId={project.id}
            operation="plan"
            label="Construire le plan"
            runningLabel="Construction en cours..."
          />
        </div>
      </div>
    );
  }

  return (
    <MemoryEditor
      projectId={project.id}
      organizationId={ctx.organization.id}
      sections={sections}
    />
  );
}
