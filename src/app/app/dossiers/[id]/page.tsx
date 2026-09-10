import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, listProjectDocuments } from "@/lib/data/projects";
import { getDceAnalysis, listRequirements } from "@/lib/data/analysis";
import { daysUntil, formatDate } from "@/lib/projects";
import { DOCUMENT_KIND_LABELS } from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricRow, type Metric } from "@/components/ui/metrics";
import { Notice } from "@/components/ui/notice";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, documents, analysis, requirements] = await Promise.all([
    getProject(id),
    listProjectDocuments(id),
    getDceAnalysis(id),
    listRequirements(id),
  ]);

  if (!project) notFound();

  const extracted = documents.filter((d) => d.status === "EXTRACTED");
  const failed = documents.filter((d) => d.status === "FAILED");
  const pages = extracted.reduce((sum, d) => sum + (d.page_count ?? 0), 0);
  const days = daysUntil(project.deadline);

  const metrics: Metric[] = [
    { label: "Pieces deposees", value: String(documents.length) },
    {
      label: "Pages lues",
      // Tant qu'aucune extraction n'a eu lieu, aucun nombre n'est avance.
      value: extracted.length > 0 ? String(pages) : "—",
    },
    {
      label: "Exigences",
      value: requirements.length > 0 ? String(requirements.length) : "—",
    },
    {
      label: "Points de vigilance",
      value: analysis ? String(analysis.vigilance_points.length) : "—",
      tone:
        analysis && analysis.vigilance_points.length > 0 ? "warn" : "neutral",
    },
    {
      label: "Jours avant remise",
      value: days === null ? "—" : String(Math.max(days, 0)),
      tone: days !== null && days <= 7 ? "warn" : "neutral",
    },
  ];

  // Groupement des pieces par nature.
  const byKind = new Map<string, number>();
  for (const d of documents) {
    byKind.set(d.kind, (byKind.get(d.kind) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <MetricRow items={metrics} />

      {failed.length > 0 ? (
        <Notice tone="warn" title={`${failed.length} piece(s) illisible(s)`}>
          <ul className="mt-2 space-y-1">
            {failed.map((d) => (
              <li key={d.id}>
                <span className="font-semibold">{d.file_name}</span> :{" "}
                {d.failure_reason ?? "Lecture impossible."}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la consultation</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-[13.5px]">
            <Row label="Objet du marche" value={project.name} />
            <Row label="Reference" value={project.reference} />
            <Row label="Acheteur" value={project.buyer} />
            <Row label="Lot" value={project.lot} />
            <Row label="Date limite" value={formatDate(project.deadline)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pieces par nature</CardTitle>
          </CardHeader>
          <CardBody>
            {documents.length === 0 ? (
              <p className="text-[13.5px] text-ink-58">
                Aucune piece deposee pour le moment.
              </p>
            ) : (
              <ul className="space-y-2 text-[13.5px]">
                {[...byKind.entries()].map(([kind, count]) => (
                  <li
                    key={kind}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-ink-70">
                      {DOCUMENT_KIND_LABELS[
                        kind as keyof typeof DOCUMENT_KIND_LABELS
                      ] ?? kind}
                    </span>
                    <span className="tabular font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-[15px] font-bold">Prochaine etape</h2>
        <NextStep
          projectId={project.id}
          hasDocuments={documents.length > 0}
          hasAnalysis={Boolean(analysis)}
          requirementCount={requirements.length}
        />
      </section>
    </div>
  );
}

function NextStep({
  projectId,
  hasDocuments,
  hasAnalysis,
  requirementCount,
}: {
  projectId: string;
  hasDocuments: boolean;
  hasAnalysis: boolean;
  requirementCount: number;
}) {
  if (!hasDocuments) {
    return (
      <Notice title="Deposez les pieces du DCE">
        <p className="mt-1">
          L&apos;analyse ne peut commencer qu&apos;une fois le dossier de
          consultation depose. Ajoutez au minimum le reglement de consultation
          et le CCTP.
        </p>
        <Link href={`/app/dossiers/${projectId}/documents`}>
          <Button className="mt-4">Deposer les pieces</Button>
        </Link>
      </Notice>
    );
  }

  if (!hasAnalysis) {
    return (
      <Notice title="Lancez l'analyse du dossier">
        <p className="mt-1">
          MateriaBTP va lire les pieces deposees, en extraire les exigences
          opposables au candidat et signaler les points de vigilance, chaque
          element etant rattache a sa source.
        </p>
        <Link href={`/app/dossiers/${projectId}/analyse`}>
          <Button className="mt-4">Analyser le dossier</Button>
        </Link>
      </Notice>
    );
  }

  return (
    <Notice title="Passez en revue les exigences">
      <p className="mt-1">
        {requirementCount} exigence(s) ont ete identifiees. Verifiez-les, puis
        indiquez pour chacune si votre entreprise la couvre deja. Vous restez
        decideur sur chaque ligne.
      </p>
      <Link href={`/app/dossiers/${projectId}/exigences`}>
        <Button className="mt-4">Voir les exigences</Button>
      </Link>
    </Notice>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="flex-none text-ink-58">{label}</span>
      <span className="text-right font-semibold">
        {value && value.length > 0 ? value : "Non renseigne"}
      </span>
    </div>
  );
}
