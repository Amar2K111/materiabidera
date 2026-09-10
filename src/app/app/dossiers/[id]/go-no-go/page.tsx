import Link from "next/link";
import { notFound } from "next/navigation";
import { Scale } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { getGoNoGo } from "@/lib/data/decision";
import { getCompanyCounts } from "@/lib/data/company";
import { isAiConfigured } from "@/lib/ai";
import { FACTOR_WEIGHTS } from "@/lib/decision";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { DecisionPanel } from "./decision-panel";

export default async function GoNoGoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, analysis, decision, companyCounts] = await Promise.all([
    getProject(id),
    getDceAnalysis(id),
    getGoNoGo(id),
    getCompanyCounts(),
  ]);

  if (!project) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configure">
        <p className="mt-1">
          L&apos;evaluation d&apos;une opportunite necessite un moteur
          d&apos;analyse. Aucune note n&apos;est produite tant qu&apos;il
          n&apos;est pas configure.
        </p>
      </Notice>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={<Scale className="h-5 w-5" strokeWidth={1.8} />}
        title="Le dossier doit d'abord etre analyse"
        description="L'evaluation Go/No-Go s'appuie sur les exigences et les points de vigilance releves dans le dossier de consultation, confrontes a votre base entreprise."
        action={
          <Link href={`/app/dossiers/${project.id}/analyse`}>
            <Button>Analyser le dossier</Button>
          </Link>
        }
      />
    );
  }

  const companyTotal = Object.values(companyCounts).reduce((a, b) => a + b, 0);

  return (
    <DecisionPanel
      projectId={project.id}
      decision={decision}
      weights={FACTOR_WEIGHTS}
      companyItemCount={companyTotal}
    />
  );
}
