import { notFound } from "next/navigation";
import { Building2, Compass } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { getStrategy } from "@/lib/data/strategy";
import { isAiConfigured } from "@/lib/ai";
import { formatDateTime } from "@/lib/projects";
import { Sources } from "@/components/app/sources";
import { OperationButton } from "@/components/app/operation-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";

/** Pourcentage exploitable pour une barre, ou null si la ponderation est textuelle. */
function weightPercent(weight: string): number | null {
  const match = weight.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? Math.min(value, 100) : null;
}

export default async function StrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, analysis, strategy] = await Promise.all([
    getProject(id),
    getDceAnalysis(id),
    getStrategy(id),
  ]);

  if (!project) notFound();

  if (!isAiConfigured()) {
    return (
      <Notice tone="warn" title="Moteur d'analyse non configuré">
        <p className="mt-1">
          La construction d&apos;une stratégie de réponse nécessite un moteur
          d&apos;analyse.
        </p>
      </Notice>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={<Compass className="h-5 w-5" strokeWidth={1.8} />}
        title="Le dossier doit d'abord être analysé"
        description="La stratégie s'appuie sur les critères de jugement, les exigences relevées et votre base entreprise."
        action={
          <ButtonLink href={`/app/dossiers/${project.id}/analyse`}>
            Analyser le dossier
          </ButtonLink>
        }
      />
    );
  }

  if (!strategy) {
    return (
      <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-wash text-brand">
          <Compass className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          Construire la stratégie de réponse
        </h2>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-58">
          Avant de rédiger, MateriaBTP détermine où porter l&apos;effort : quels
          axes pèsent le plus dans la notation de ce marché, et quels éléments
          de votre base entreprise servent réellement cette réponse.
        </p>
        <div className="mt-6">
          <OperationButton
            projectId={project.id}
            operation="strategy"
            label="Construire la stratégie"
            runningLabel="Construction en cours…"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- Criteres d'attribution -------------------------------------- */}
      <section className="rounded-[14px] border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Critères d&apos;attribution</h2>
          <p className="text-[12px] text-ink-42">
            Stratégie proposée le {formatDateTime(strategy.generated_at)} · elle
            vous appartient, ajustez-la avant de rédiger
          </p>
        </div>
        {analysis.award_criteria.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-58">
            Aucun critère d&apos;attribution n&apos;a été trouvé dans les pièces
            déposées.
          </p>
        ) : (
          <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.award_criteria.map((c, i) => {
              const pct = weightPercent(c.weight);
              return (
                <li key={`${c.label}-${i}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] font-medium">{c.label}</span>
                    <span className="tabular text-[16px] font-bold text-brand">
                      {c.weight}
                    </span>
                  </div>
                  {pct !== null ? (
                    <span className="app-ui__bar mt-2">
                      <i style={{ width: `${pct}%` }} />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* --- Axes prioritaires ------------------------------------------ */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
            Priorités de réponse
          </h2>
          <ol className="space-y-3">
            {strategy.priorities.map((p) => (
              <li
                key={p.rank}
                className="rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="tabular flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
                    {p.rank}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14px] leading-snug font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                      {p.rationale}
                    </p>
                    <Sources sources={p.sources} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* --- Recommandations -------------------------------------------- */}
        <section>
          <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.02em]">
            Recommandations
          </h2>
          <ul className="space-y-3">
            {strategy.recommendations.map((r, i) => (
              <li
                key={`${r.title}-${i}`}
                className="rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5"
              >
                <h3 className="text-[14px] leading-snug font-semibold">{r.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                  {r.detail}
                </p>
                <Sources sources={r.sources} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* --- Rapprochements avec la base entreprise ------------------------ */}
      <section>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
          Éléments de votre base à mettre en avant
        </h2>
        <p className="mt-1 mb-3 text-[13px] text-ink-42">
          Uniquement des fiches réellement présentes dans votre base entreprise.
        </p>

        {strategy.company_matches.length === 0 ? (
          <Notice tone="warn">
            Aucun élément de votre base entreprise n&apos;a pu être rapproché de
            cette consultation. Complétez vos références, moyens et méthodes
            pour que la réponse s&apos;appuie sur votre expérience réelle.
          </Notice>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {strategy.company_matches.map((m) => (
              <li
                key={`${m.table}-${m.recordId}`}
                className="flex gap-3 rounded-[12px] border border-line bg-white p-4 shadow-card"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] bg-brand-wash text-brand">
                  <Building2 className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] leading-snug font-semibold">
                    {m.label}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-70">
                    {m.why}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-white p-5 shadow-card">
        <div>
          <h2 className="text-[15px] font-semibold">Reconstruire la stratégie</h2>
          <p className="mt-1 max-w-[70ch] text-[13px] text-ink-58">
            Utile après avoir complété votre base entreprise ou ajusté les
            exigences.
          </p>
        </div>
        <OperationButton
          projectId={project.id}
          operation="strategy"
          label="Reconstruire la stratégie"
          runningLabel="Construction en cours…"
          variant="ghost"
        />
      </section>
    </div>
  );
}
