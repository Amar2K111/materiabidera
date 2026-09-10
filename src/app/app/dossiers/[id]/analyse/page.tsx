import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { getProject, listProjectDocuments } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { isAiConfigured } from "@/lib/ai";
import { formatDateTime } from "@/lib/projects";
import { AnalysisRunner } from "@/components/app/analysis-runner";
import { Sources } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";

export default async function ProjectAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, documents, analysis] = await Promise.all([
    getProject(id),
    listProjectDocuments(id),
    getDceAnalysis(id),
  ]);

  if (!project) notFound();

  const aiReady = isAiConfigured();

  if (!aiReady) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configure">
        <p className="mt-1">
          L&apos;analyse d&apos;un dossier de consultation necessite un moteur
          d&apos;analyse. Tant qu&apos;aucune cle n&apos;est renseignee cote
          serveur, aucune analyse ne peut etre lancee, et rien n&apos;est
          simule.
        </p>
        <Link href="/app/parametres">
          <Button variant="ghost" className="mt-4">
            Voir l&apos;etat des services
          </Button>
        </Link>
      </Notice>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<ScanSearch className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucune piece a analyser"
        description="Deposez d'abord les pieces du dossier de consultation. L'analyse lit leur contenu, en extrait les exigences et signale les points de vigilance."
        action={
          <Link href={`/app/dossiers/${project.id}/documents`}>
            <Button>Deposer les pieces</Button>
          </Link>
        }
      />
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Analyser le dossier</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          BIDERA va lire les {documents.length} piece
          {documents.length > 1 ? "s" : ""} deposee
          {documents.length > 1 ? "s" : ""}, en extraire les exigences
          opposables au candidat et signaler les points de vigilance. Chaque
          element sera rattache a sa source.
        </p>
        <div className="mt-6">
          <AnalysisRunner projectId={project.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Notice>
        Analyse indicative produite par BIDERA a partir des pieces deposees, le{" "}
        {formatDateTime(analysis.generated_at)}. Verifiez chaque element avant
        de vous en servir : vous restez decideur.
      </Notice>

      <Card>
        <CardHeader>
          <CardTitle>Informations cles</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Objet du marche" value={analysis.subject} />
          <Field label="Acheteur" value={analysis.buyer} />
          <Field label="Lot" value={analysis.lot} />
          <Field label="Montant" value={analysis.amount} />
          <Field label="Duree" value={analysis.duration} />
          <Field label="Date limite de remise" value={analysis.submission_date} />
          <Field label="Variantes" value={analysis.variants} />
          <Field label="Visite de site" value={analysis.site_visit} />
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-4 text-[15px] font-bold">Criteres d&apos;attribution</h2>
        {analysis.award_criteria.length === 0 ? (
          <Notice>
            Aucun critere d&apos;attribution n&apos;a ete trouve dans les pieces
            deposees. Verifiez que le reglement de consultation figure bien au
            dossier.
          </Notice>
        ) : (
          <ul className="space-y-3">
            {analysis.award_criteria.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="rounded-[10px] border border-line bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-[14px] font-bold">{c.label}</h3>
                  <span className="tabular text-[15px] font-extrabold text-brand">
                    {c.weight}
                  </span>
                </div>
                {c.detail ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-70">
                    {c.detail}
                  </p>
                ) : null}
                <Sources sources={c.sources} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-[15px] font-bold">Points de vigilance</h2>
        {analysis.vigilance_points.length === 0 ? (
          <Notice>
            Aucun point de vigilance particulier n&apos;a ete releve dans les
            pieces deposees.
          </Notice>
        ) : (
          <ul className="space-y-3">
            {analysis.vigilance_points.map((p, i) => (
              <li
                key={`${p.title}-${i}`}
                className="rounded-[10px] border border-line bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-[14px] font-bold">{p.title}</h3>
                  <Badge
                    tone={
                      p.severity === "HIGH"
                        ? "risk"
                        : p.severity === "MEDIUM"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {p.severity === "HIGH"
                      ? "Critique"
                      : p.severity === "MEDIUM"
                        ? "A surveiller"
                        : "Pour information"}
                  </Badge>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-70">
                  {p.detail}
                </p>
                <Sources sources={p.sources} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[15px] font-bold">Relancer l&apos;analyse</h2>
        <p className="mt-1.5 mb-4 max-w-[70ch] text-[13px] text-ink-58">
          Utile apres l&apos;ajout de nouvelles pieces. Les exigences que vous
          avez ajoutees vous-meme sont conservees.
        </p>
        <AnalysisRunner
          projectId={project.id}
          label="Relancer l'analyse"
        />
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  const missing =
    !value || value.startsWith("Information non trouvee");

  return (
    <div>
      <p className="text-[12px] font-bold text-ink-42">{label}</p>
      <p
        className={
          missing
            ? "mt-1 text-[13.5px] text-ink-42 italic"
            : "mt-1 text-[13.5px] font-semibold"
        }
      >
        {value || "Information non trouvee dans les sources disponibles."}
      </p>
    </div>
  );
}
