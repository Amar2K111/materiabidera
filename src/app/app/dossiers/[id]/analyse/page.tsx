import { notFound } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { getProject, listProjectDocuments } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { isAiConfigured } from "@/lib/ai";
import { formatDateTime } from "@/lib/projects";
import { CONSTRAINT_LABELS } from "@/lib/requirements";
import { AnalysisRunner } from "@/components/app/analysis-runner";
import { Sources } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const SEVERITY = {
  HIGH: { label: "Critique", tone: "risk" as const },
  MEDIUM: { label: "À surveiller", tone: "warn" as const },
  LOW: { label: "Pour information", tone: "neutral" as const },
};

export default async function ProjectAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { lancer } = await searchParams;
  const [project, documents, analysis] = await Promise.all([
    getProject(id),
    listProjectDocuments(id),
    getDceAnalysis(id),
  ]);

  if (!project) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configuré">
        <p className="mt-1">
          L&apos;analyse d&apos;un dossier de consultation nécessite un moteur
          d&apos;analyse. Tant qu&apos;aucune clé n&apos;est renseignée côté
          serveur, aucune analyse ne peut être lancée, et rien n&apos;est
          simulé.
        </p>
        <ButtonLink href="/app/parametres" variant="ghost" className="mt-4">
          Voir l&apos;état des services
        </ButtonLink>
      </Notice>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<ScanSearch className="h-5 w-5" strokeWidth={1.8} />}
        title="Aucune pièce à analyser"
        description="Déposez d'abord les pièces du dossier de consultation. L'analyse lit leur contenu, en extrait les exigences et signale les points de vigilance."
        action={
          <ButtonLink href={`/app/dossiers/${project.id}/documents`}>
            Déposer les pièces
          </ButtonLink>
        }
      />
    );
  }

  const pending = documents.filter(
    (d) => d.status === "UPLOADED" || d.status === "EXTRACTING",
  ).length;

  if (!analysis) {
    return (
      <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-wash text-brand">
          <ScanSearch className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          Analyser le dossier de consultation
        </h2>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-58">
          MateriaBTP va lire {documents.length > 1 ? `les ${documents.length} pièces déposées` : "la pièce déposée"},
          en extraire les exigences opposables au candidat et signaler les
          points de vigilance. Chaque élément sera rattaché à sa source.
        </p>
        <div className="mt-6">
          <AnalysisRunner projectId={project.id} autoStart={lancer === "1"} />
        </div>
      </div>
    );
  }

  const keyInfo: Array<[string, string | null]> = [
    ["Objet du marché", analysis.subject],
    ["Acheteur", analysis.buyer],
    ["Lot", analysis.lot],
    ["Montant", analysis.amount],
    ["Durée d'exécution", analysis.duration],
    ["Date limite de remise", analysis.submission_date],
    ["Variantes", analysis.variants],
    ["Visite de site", analysis.site_visit],
  ];

  const format = analysis.response_format ?? null;
  const constraints = analysis.market_context?.constraints ?? [];

  return (
    <div className="space-y-8">
      {pending > 0 ? (
        <Notice
          tone="warn"
          title={`${pending} pièce${pending > 1 ? "s" : ""} déposée${pending > 1 ? "s" : ""} après l'analyse`}
        >
          <p>
            Relancez l&apos;analyse pour que les exigences en tiennent compte.
            Les exigences que vous avez ajoutées vous-même sont conservées.
          </p>
          <div className="mt-3">
            <AnalysisRunner
              projectId={project.id}
              label="Relancer l'analyse"
              autoStart={lancer === "1"}
            />
          </div>
        </Notice>
      ) : null}

      <section className="rounded-[14px] border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-soft px-5 py-3.5 sm:px-6">
          <h2 className="text-[15px] font-semibold">Informations clés</h2>
          <p className="text-[12px] text-ink-42">
            Analyse indicative du {formatDateTime(analysis.generated_at)} ·
            vérifiez chaque élément, vous restez décideur
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {keyInfo.map(([label, value]) => (
            <Field
              key={label}
              label={label}
              value={value}
              wide={label === "Objet du marché"}
            />
          ))}
        </dl>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section>
          <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
            Critères d&apos;attribution
          </h2>
          {analysis.award_criteria.length === 0 ? (
            <Notice>
              Aucun critère d&apos;attribution n&apos;a été trouvé dans les
              pièces déposées. Vérifiez que le règlement de consultation figure
              bien au dossier.
            </Notice>
          ) : (
            <ul className="space-y-3">
              {analysis.award_criteria.map((c, i) => (
                <li
                  key={`${c.label}-${i}`}
                  className="rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[14px] font-semibold">{c.label}</h3>
                    <Weight value={c.weight} />
                  </div>
                  {c.detail ? (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                      {c.detail}
                    </p>
                  ) : null}
                  {c.subcriteria && c.subcriteria.length > 0 ? (
                    <ul className="mt-3 divide-y divide-line-soft rounded-[10px] border border-line-soft bg-paper/60">
                      {c.subcriteria.map((sub, j) => (
                        <li key={`${sub.label}-${j}`} className="px-3.5 py-2.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[13px] leading-snug font-medium">{sub.label}</p>
                            <Weight value={sub.weight} small />
                          </div>
                          {sub.detail ? (
                            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-58">
                              {sub.detail}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {c.expectedElements && c.expectedElements.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[12px] font-medium text-ink-42">
                        Éléments attendus par l&apos;acheteur
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12.5px] leading-relaxed text-ink-70">
                        {c.expectedElements.map((e, j) => (
                          <li key={j}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <Sources sources={c.sources} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
            Points de vigilance
          </h2>
          {analysis.vigilance_points.length === 0 ? (
            <Notice>
              Aucun point de vigilance particulier n&apos;a été relevé dans les
              pièces déposées.
            </Notice>
          ) : (
            <ul className="space-y-3">
              {analysis.vigilance_points.map((p, i) => (
                <li
                  key={`${p.title}-${i}`}
                  className={cn(
                    "rounded-[12px] border border-line border-l-[3px] bg-white p-4 shadow-card sm:p-5",
                    p.severity === "HIGH" && "border-l-risk",
                    p.severity === "MEDIUM" && "border-l-warn",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14px] leading-snug font-semibold">
                      {p.title}
                    </h3>
                    <Badge tone={SEVERITY[p.severity].tone} className="flex-none">
                      {SEVERITY[p.severity].label}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                    {p.detail}
                  </p>
                  <Sources sources={p.sources} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {format || constraints.length > 0 ? (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section>
            <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
              Cadre de réponse
            </h2>
            {format ? (
              <div className="rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={format.imposedFramework ? "warn" : "neutral"}>
                    {format.imposedFramework ? "Cadre imposé" : "Structure libre"}
                  </Badge>
                  <span className="text-[12.5px] text-ink-58">
                    {format.pageLimit ? `Limite : ${format.pageLimit}` : "Aucune limite de pages trouvée"}
                  </span>
                </div>
                {format.structure.length > 0 ? (
                  <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-[13px] leading-relaxed text-ink-70">
                    {format.structure.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : null}
                {format.constraints.length > 0 ? (
                  <ul className="mt-3 list-disc space-y-0.5 pl-4 text-[12.5px] leading-relaxed text-ink-58">
                    {format.constraints.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : null}
                <Sources sources={format.sources} />
              </div>
            ) : (
              <Notice>Relancez l&apos;analyse pour relever le cadre de réponse imposé.</Notice>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
              Contraintes du chantier
            </h2>
            {constraints.length === 0 ? (
              <Notice>Aucune contrainte particulière n&apos;a été relevée.</Notice>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {constraints.map((m, i) => (
                  <li
                    key={`${m.label}-${i}`}
                    className="rounded-[12px] border border-line bg-white p-4 shadow-card"
                  >
                    <p className="text-[11.5px] font-semibold tracking-[0.04em] text-brand uppercase">
                      {CONSTRAINT_LABELS[m.type] ?? m.type}
                    </p>
                    <h3 className="mt-1 text-[13.5px] leading-snug font-semibold">{m.label}</h3>
                    {m.detail ? (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-70">{m.detail}</p>
                    ) : null}
                    <Sources sources={m.sources} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {pending === 0 ? (
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-[14px] border border-line bg-white p-5 shadow-card">
          <div>
            <h2 className="text-[15px] font-semibold">Relancer l&apos;analyse</h2>
            <p className="mt-1 max-w-[70ch] text-[13px] text-ink-58">
              Utile après l&apos;ajout de nouvelles pièces. Les exigences que
              vous avez ajoutées vous-même sont conservées.
            </p>
          </div>
          <AnalysisRunner projectId={project.id} label="Relancer l'analyse" />
        </section>
      ) : null}
    </div>
  );
}

/** Une ponderation absente du dossier est dite telle quelle, jamais estimee. */
function Weight({ value, small }: { value: string; small?: boolean }) {
  const missing = !value || /non (pr[ée]cis|trouv)/i.test(value);
  return (
    <span
      className={cn(
        "tabular flex-none",
        missing
          ? "text-[12px] font-medium text-ink-42 italic"
          : small
            ? "text-[13px] font-semibold text-brand"
            : "text-[18px] font-bold text-brand",
      )}
    >
      {missing ? "Pondération non précisée" : value}
    </span>
  );
}

function Field({
  label,
  value,
  wide,
}: {
  label: string;
  value: string | null;
  wide?: boolean;
}) {
  const missing = !value || /^information non trouv/i.test(value);

  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="text-[12px] font-medium text-ink-42">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-[13.5px] leading-relaxed",
          missing ? "text-ink-42 italic" : "font-medium text-ink",
        )}
      >
        {missing ? "Non trouvé dans les pièces" : value}
      </dd>
    </div>
  );
}
