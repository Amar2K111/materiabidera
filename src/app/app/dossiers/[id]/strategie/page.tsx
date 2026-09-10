import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass } from "lucide-react";
import { getProject } from "@/lib/data/projects";
import { getDceAnalysis } from "@/lib/data/analysis";
import { getStrategy } from "@/lib/data/strategy";
import { isAiConfigured } from "@/lib/ai";
import { formatDateTime } from "@/lib/projects";
import { Sources } from "@/components/app/sources";
import { OperationButton } from "@/components/app/operation-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";

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
      <Notice tone="warn" title="Moteur d'analyse non configure">
        <p className="mt-1">
          La construction d&apos;une strategie de reponse necessite un moteur
          d&apos;analyse.
        </p>
      </Notice>
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        icon={<Compass className="h-5 w-5" strokeWidth={1.8} />}
        title="Le dossier doit d'abord etre analyse"
        description="La strategie s'appuie sur les criteres de jugement, les exigences relevees et votre base entreprise."
        action={
          <Link href={`/app/dossiers/${project.id}/analyse`}>
            <Button>Analyser le dossier</Button>
          </Link>
        }
      />
    );
  }

  if (!strategy) {
    return (
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Construire la strategie</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          Avant de rediger, MateriaBTP determine ou porter l&apos;effort : quels axes
          pesent le plus dans la notation de ce marche, et quels elements de
          votre base entreprise servent reellement cette reponse.
        </p>
        <div className="mt-6">
          <OperationButton
            projectId={project.id}
            operation="strategy"
            label="Construire la strategie"
            runningLabel="Construction en cours..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Notice>
        Strategie proposee par MateriaBTP a partir des criteres de jugement, des
        exigences relevees et de votre base entreprise, le{" "}
        {formatDateTime(strategy.generated_at)}. Elle vous appartient : ajustez
        les axes avant de lancer la redaction.
      </Notice>

      {/* --- Criteres d'attribution -------------------------------------- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold">
          Criteres d&apos;attribution
        </h2>
        {analysis.award_criteria.length === 0 ? (
          <Notice>
            Aucun critere d&apos;attribution n&apos;a ete trouve dans les pieces
            deposees.
          </Notice>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {analysis.award_criteria.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="rounded-[10px] border border-line bg-white p-4 shadow-card"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13.5px] font-bold">{c.label}</h3>
                  <span className="tabular text-[16px] font-extrabold text-brand">
                    {c.weight}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Axes prioritaires -------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold">Priorites de reponse</h2>
        <ol className="space-y-3">
          {strategy.priorities.map((p) => (
            <li
              key={p.rank}
              className="rounded-[10px] border border-line bg-white p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                <span className="tabular flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-wash text-[13px] font-extrabold text-brand">
                  {p.rank}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold">{p.title}</h3>
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

      {/* --- Recommandations ---------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold">Recommandations</h2>
        <ul className="space-y-3">
          {strategy.recommendations.map((r, i) => (
            <li
              key={`${r.title}-${i}`}
              className="rounded-[10px] border border-line bg-white p-4 shadow-card"
            >
              <h3 className="text-[14px] font-bold">{r.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                {r.detail}
              </p>
              <Sources sources={r.sources} />
            </li>
          ))}
        </ul>
      </section>

      {/* --- Rapprochements avec la base entreprise ------------------------ */}
      <section>
        <h2 className="mb-1 text-[15px] font-bold">
          Elements de votre base a mettre en avant
        </h2>
        <p className="mb-4 text-[12.5px] text-ink-42">
          Uniquement des fiches reellement presentes dans votre base entreprise.
        </p>

        {strategy.company_matches.length === 0 ? (
          <Notice tone="warn">
            Aucun element de votre base entreprise n&apos;a pu etre rapproche de
            cette consultation. Completez vos references, moyens et methodes pour
            que la reponse s&apos;appuie sur votre experience reelle.
          </Notice>
        ) : (
          <ul className="space-y-2.5">
            {strategy.company_matches.map((m) => (
              <li
                key={`${m.table}-${m.recordId}`}
                className="rounded-[10px] border border-line bg-white p-4 shadow-card"
              >
                <h3 className="text-[13.5px] font-bold">{m.label}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                  {m.why}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[15px] font-bold">Relancer</h2>
        <p className="mt-1.5 mb-4 max-w-[70ch] text-[13px] text-ink-58">
          Utile apres avoir complete votre base entreprise ou ajuste les
          exigences.
        </p>
        <OperationButton
          projectId={project.id}
          operation="strategy"
          label="Reconstruire la strategie"
          runningLabel="Construction en cours..."
          variant="ghost"
        />
      </section>
    </div>
  );
}
