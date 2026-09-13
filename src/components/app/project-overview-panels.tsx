import Link from "next/link";
import type { GoNoGoAnalysis } from "@/lib/data/decision";
import type { MemorySection } from "@/lib/data/memory";
import type { QualityCheck } from "@/lib/data/quality";
import type { DceAnalysis, Requirement } from "@/lib/requirements";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

const REC_LABELS = {
  GO: { label: "GO", tone: "is-ok" as const },
  VIGILANCE: { label: "Sous reserve", tone: "is-warn" as const },
  NO_GO: { label: "NO-GO", tone: "is-risk" as const },
};

export function ProjectOverviewPanels({
  projectId,
  metrics,
  goNoGo,
  memorySections,
  requirements,
  analysis,
  quality,
  failedCount,
}: {
  projectId: string;
  metrics: Array<{ value: string; label: string; tone?: string }>;
  goNoGo: GoNoGoAnalysis | null;
  memorySections: MemorySection[];
  requirements: Requirement[];
  analysis: DceAnalysis | null;
  quality: QualityCheck | null;
  failedCount: number;
}) {
  const memoryProgress =
    memorySections.length === 0
      ? null
      : Math.round(
          (memorySections.filter((s) => (s.content ?? "").trim().length > 0)
            .length /
            memorySections.length) *
            100,
        );

  const covered =
    requirements.length === 0
      ? null
      : Math.round(
          (requirements.filter((r) => r.status === "COVERED").length /
            requirements.length) *
            100,
        );

  const decision = goNoGo
    ? REC_LABELS[goNoGo.user_decision ?? goNoGo.recommendation]
    : null;

  const alerts = [
    ...(analysis?.vigilance_points ?? []).slice(0, 3).map((p) => ({
      title: p.title,
      source:
        p.sources[0]?.label ??
        p.sources[0]?.documentName ??
        "DCE",
      tone: p.severity === "HIGH" ? ("is-risk" as const) : ("is-warn" as const),
    })),
    ...(quality?.quality_issues ?? [])
      .filter((i) => !i.resolved_at)
      .slice(0, 3)
      .map((i) => ({
        title: i.title,
        source: i.detail ?? "Controle qualite",
        tone:
          i.severity === "BLOCKING" ? ("is-risk" as const) : ("is-warn" as const),
      })),
  ].slice(0, 4);

  const memoryPreview = memorySections.slice(0, 2);

  return (
    <div>
      <div className="app-ui__metrics">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`app-ui__metric${m.tone ? ` ${m.tone}` : ""}`}
          >
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      {failedCount > 0 ? (
        <div className="mt-4">
          <Notice tone="warn" title={`${failedCount} piece(s) illisible(s)`}>
            Certaines pieces n&apos;ont pas pu etre lues. Verifiez le format ou
            redeposez-les depuis Documents.
          </Notice>
        </div>
      ) : null}

      <div className="app-ui__panels app-ui__panels--3">
        <section className="app-ui__panel">
          <div className="app-ui__panel-h">
            Go / No-Go <span>Recommandation</span>
          </div>
          <div className="app-ui__panel-b">
            {goNoGo ? (
              <>
                <div className={`app-ui__score ${decision?.tone ?? ""}`}>
                  <b>{goNoGo.score}</b>
                  <span>/ 100</span>
                  {decision ? (
                    <span className={`app-ui__tag ${decision.tone}`}>
                      {decision.label}
                    </span>
                  ) : null}
                </div>
                {goNoGo.go_no_go_factors.slice(0, 4).map((f) => (
                  <div className="app-ui__krow" key={f.id}>
                    <span className="app-ui__krow-t">{f.label}</span>
                    <span className="app-ui__bar">
                      <i style={{ width: `${f.score}%` }} />
                    </span>
                    <em>{f.score}</em>
                  </div>
                ))}
              </>
            ) : (
              <p className="app-ui__empty">
                Lancez l&apos;analyse puis evaluez le dossier pour obtenir une
                recommandation argumentee.
              </p>
            )}
          </div>
        </section>

        <section className="app-ui__panel">
          <div className="app-ui__panel-h">
            Memoire technique{" "}
            <span>
              {memorySections.length > 0
                ? `${memorySections.length} chapitres`
                : "Plan a generer"}
            </span>
          </div>
          <div className="app-ui__panel-b">
            {memoryProgress === null ? (
              <p className="app-ui__empty">
                Le plan apparaitra apres la strategie de reponse.
              </p>
            ) : (
              <>
                <div className="app-ui__krow">
                  <span className="app-ui__krow-t">Progression</span>
                  <span className="app-ui__bar">
                    <i style={{ width: `${memoryProgress}%` }} />
                  </span>
                  <em>{memoryProgress} %</em>
                </div>
                <div className="app-ui__krow">
                  <span className="app-ui__krow-t">Exigences couvertes</span>
                  <span className="app-ui__bar is-ok">
                    <i style={{ width: `${covered ?? 0}%` }} />
                  </span>
                  <em>{covered === null ? "—" : `${covered} %`}</em>
                </div>
                {memoryPreview.map((section) => {
                  const done = (section.content ?? "").trim().length > 0;
                  return (
                    <div className="app-ui__req" key={section.id}>
                      <span
                        className={`app-ui__box${done ? " is-on" : ""}`}
                        aria-hidden
                      />
                      <span>
                        <span className="app-ui__req-t">
                          {section.number ? `${section.number}. ` : ""}
                          {section.title}
                        </span>
                        <span className="app-ui__req-s">
                          {done ? "Contenu genere" : "A rediger"}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <section className="app-ui__panel">
          <div className="app-ui__panel-h">
            Alertes <span>Avant depot</span>
          </div>
          <div className="app-ui__panel-b">
            {alerts.length === 0 ? (
              <p className="app-ui__empty">
                Aucune alerte pour le moment. Les points de vigilance du DCE et
                du controle qualite s&apos;affichent ici.
              </p>
            ) : (
              alerts.map((alert, index) => (
                <div
                  className={`app-ui__flag ${alert.tone}`}
                  key={`${alert.title}-${index}`}
                >
                  <b>{alert.title}</b>
                  <span>{alert.source}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <OverviewNextStep
          projectId={projectId}
          hasAnalysis={Boolean(analysis)}
          requirementCount={requirements.length}
        />
      </section>
    </div>
  );
}

function OverviewNextStep({
  projectId,
  hasAnalysis,
  requirementCount,
}: {
  projectId: string;
  hasAnalysis: boolean;
  requirementCount: number;
}) {
  if (!hasAnalysis) {
    return (
      <Notice title="Prochaine etape : analyser le DCE">
        <p className="mt-1">
          MateriaBTP va lire les pieces deposees et en extraire les exigences
          opposables, avec leur source dans le dossier.
        </p>
        <Link href={`/app/dossiers/${projectId}/analyse`}>
          <Button className="mt-4">Analyser le dossier</Button>
        </Link>
      </Notice>
    );
  }

  if (requirementCount === 0) {
    return (
      <Notice title="Analyse en cours de consolidation">
        <p className="mt-1">
          Les exigences seront listees des que l&apos;extraction sera terminee.
        </p>
      </Notice>
    );
  }

  return (
    <Notice title="Poursuivre la reponse">
      <p className="mt-1">
        {requirementCount} exigence(s) identifiees. Passez en revue la couverture,
        puis construisez votre memoire technique.
      </p>
      <Link href={`/app/dossiers/${projectId}/exigences`}>
        <Button className="mt-4">Voir les exigences</Button>
      </Link>
    </Notice>
  );
}
