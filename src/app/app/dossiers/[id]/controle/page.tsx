import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { listMemorySections } from "@/lib/data/memory";
import { getQualityCheck } from "@/lib/data/quality";
import { isAiConfigured } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { QualityPanel } from "./quality-panel";

export default async function QualityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, sections, check] = await Promise.all([
    getProject(id),
    listMemorySections(id),
    getQualityCheck(id),
  ]);

  if (!project) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configure">
        <p className="mt-1">
          Le controle qualite comporte une relecture du texte, qui necessite un
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
        title="Aucun chapitre redige"
        description="Le controle qualite porte sur le texte du memoire : couverture des exigences, alignement aux criteres, personnalisation, precision et tracabilite."
        action={
          <Link href={`/app/dossiers/${project.id}/memoire`}>
            <Button>Rediger le memoire</Button>
          </Link>
        }
      />
    );
  }

  return (
    <QualityPanel
      projectId={project.id}
      check={check}
      sectionTitles={Object.fromEntries(
        sections.map((s) => [s.id, `${s.number ?? ""} ${s.title}`.trim()]),
      )}
    />
  );
}
