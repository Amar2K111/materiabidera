import { notFound } from "next/navigation";
import { BookText } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis, listRequirements } from "@/lib/data/analysis";
import { listMemorySections } from "@/lib/data/memory";
import { getQualityCheck } from "@/lib/data/quality";
import { isEngineSchemaReady } from "@/lib/engine/schema";
import { getAppContext } from "@/lib/data/context";
import { isAiConfigured } from "@/lib/ai";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { PlanAndWriteButton } from "./plan-and-write-button";
import {
  MemoryEditor,
  type SectionAlert,
  type SectionRequirement,
} from "./memory-editor";

export default async function MemoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { chapitre, rediger } = await searchParams;
  const [ctx, project, analysis, sections, requirements, check, engine] = await Promise.all([
    getAppContext(),
    getProject(id),
    getDceAnalysis(id),
    listMemorySections(id),
    listRequirements(id),
    getQualityCheck(id),
    isEngineSchemaReady(),
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
      <div className="max-w-[720px]">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em]">
          Construire le plan
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          Le plan est établi pour cette consultation précise : il suit le cadre
          de mémoire s&apos;il en existe un, sinon il se structure sur les
          critères de jugement et les exigences relevées. Aucun plan type
          n&apos;est appliqué.
        </p>
        <div className="mt-6">
          <PlanAndWriteButton projectId={project.id} />
        </div>
      </div>
    );
  }

  const requirementMap: Record<string, SectionRequirement> = {};
  for (const r of requirements) {
    requirementMap[r.id] = {
      text: r.text,
      mandatory: Boolean(r.mandatory),
      coverage: r.coverage?.status ?? null,
      covered: r.status === "COVERED",
    };
  }

  const alerts: Record<string, SectionAlert[]> = {};
  for (const issue of check?.quality_issues ?? []) {
    if (!issue.section_id || issue.resolved_at) continue;
    (alerts[issue.section_id] ??= []).push({
      id: issue.id,
      severity: issue.severity,
      title: issue.title,
    });
  }

  return (
    <MemoryEditor
      projectId={project.id}
      organizationId={ctx.organization.id}
      sections={sections}
      requirements={requirementMap}
      alerts={alerts}
      versionsEnabled={engine}
      initialSectionId={typeof chapitre === "string" ? chapitre : null}
      autoWriteAll={rediger === "tout"}
    />
  );
}
