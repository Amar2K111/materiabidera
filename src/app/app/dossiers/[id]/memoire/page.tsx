import { notFound } from "next/navigation";
import { BookText } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { listMemorySections } from "@/lib/data/memory";
import { getAppContext } from "@/lib/data/context";
import { isAiConfigured } from "@/lib/ai";
import { OperationButton } from "@/components/app/operation-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { MemoryEditor } from "./memory-editor";

export default async function MemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { chapitre } = await searchParams;
  const [ctx, project, analysis, sections] = await Promise.all([
    getAppContext(),
    getProject(id),
    getDceAnalysis(id),
    listMemorySections(id),
  ]);

  if (!project || !ctx?.organization) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configuré">
        <p className="mt-1">
          La construction du plan et la rédaction nécessitent un moteur
          d&apos;analyse. Vous pouvez néanmoins rédiger vos chapitres à la main
          une fois le plan créé.
        </p>
      </Notice>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={<BookText className="h-5 w-5" strokeWidth={1.8} />}
        title="Le dossier doit d'abord être analysé"
        description="Le plan du mémoire est construit à partir du règlement de consultation, des critères de jugement et du cadre de mémoire imposé lorsqu'il en existe un."
        action={
          <ButtonLink href={`/app/dossiers/${project.id}/analyse`}>Analyser le dossier</ButtonLink>
        }
      />
    );
  }

  if (sections.length === 0) {
    return (
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Construire le plan</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          Le plan est établi pour cette consultation précise : il suit le cadre
          de mémoire s&apos;il en existe un, sinon il se structure sur les
          critères de jugement et les exigences relevées. Aucun plan type
          n&apos;est appliqué.
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
      initialSectionId={typeof chapitre === "string" ? chapitre : null}
    />
  );
}
