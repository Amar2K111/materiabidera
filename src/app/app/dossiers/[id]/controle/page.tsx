import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { listMemorySections } from "@/lib/data/memory";
import { listRequirements } from "@/lib/data/analysis";
import { getQualityCheck } from "@/lib/data/quality";
import { isAiConfigured } from "@/lib/ai";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { QualityPanel, type IssueRequirement } from "./quality-panel";

export default async function QualityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, sections, check, requirements] = await Promise.all([
    getProject(id),
    listMemorySections(id),
    getQualityCheck(id),
    listRequirements(id),
  ]);

  if (!project) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configuré">
        <p className="mt-1">
          Le contrôle qualité comporte une relecture du texte, qui nécessite un
          moteur d&apos;analyse.
        </p>
      </Notice>
    );
  }

  const written = sections.filter((s) => (s.content ?? "").trim().length > 0);

  if (written.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucun chapitre rédigé"
        description="Le contrôle qualité porte sur le texte du mémoire : couverture des exigences, alignement aux critères, personnalisation, précision et traçabilité."
        action={
          <ButtonLink href={`/app/dossiers/${project.id}/memoire`}>
            Rédiger le mémoire
          </ButtonLink>
        }
      />
    );
  }

  const requirementMap: Record<string, IssueRequirement> = {};
  for (const r of requirements) {
    const first = r.requirement_sources[0];
    requirementMap[r.id] = {
      text: r.text,
      source: first
        ? {
            documentId: first.document_id ?? "",
            documentName: first.project_documents?.file_name ?? "Document",
            pageNumber: first.page_number,
            label: first.label ?? "",
          }
        : null,
    };
  }

  return (
    <QualityPanel
      projectId={project.id}
      check={check}
      requirements={requirementMap}
      sectionTitles={Object.fromEntries(
        sections.map((s) => [s.id, `${s.number ?? ""} ${s.title}`.trim()]),
      )}
    />
  );
}
