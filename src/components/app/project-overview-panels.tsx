import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GoNoGoAnalysis } from "@/lib/data/decision";
import type { MemorySection } from "@/lib/data/memory";
import type { QualityCheck } from "@/lib/data/quality";
import type { ProjectProgressSummary } from "@/lib/data/projects";
import type { DceAnalysis, Requirement } from "@/lib/requirements";
import { type ProjectStatus } from "@/lib/projects";
import { nextStepFor } from "@/lib/next-step";
import { shortDocumentName } from "@/components/app/sources";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const REC_LABELS = {
  GO: { label: "GO", tone: "is-ok" as const },
  VIGILANCE: { label: "Sous réserve", tone: "is-warn" as const },
  NO_GO: { label: "NO-GO", tone: "is-risk" as const },
};


export function ProjectOverviewPanels({
  projectId,
  status,
  progress,
  metrics,
  goNoGo,
  memorySections,
  requirements,
  analysis,
  quality,
  failedCount,
}: {
  projectId: string;
  status: ProjectStatus;
  progress: ProjectProgressSummary;
  metrics: Array<{ value: string; label: string; tone?: string }>;
  goNoGo: GoNoGoAnalysis | null;
  memorySections: MemorySection[];
  requirements: Requirement[];
  analysis: DceAnalysis | null;
  quality: QualityCheck | null;
  failedCount: number;
}) {
  const base = `/app/dossiers/${projectId}`;
  const next = nextStepFor(status, progress);

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

  const requirementById = new Map(requirements.map((r) => [r.id, r]));

  const alerts = [
    ...(quality?.quality_issues ?? [])
      .filter((i) => !i.resolved_at && i.severity === "BLOCKING")
      .map((i) => {
        const requirement = i.requirement_id
          ? requirementById.get(i.requirement_id)
          : undefined;
        return {
          title: requirement ? requirement.text : i.title,
          source: requirement ? "Exigence non traitée" : "Contrôle qualité",
          tone: "is-risk" as const,
          href: requirement
            ? `${base}/exigences?exigence=${requirement.id}`
            : `${base}/controle`,
        };
      }),
    ...(analysis?.vigilance_points ?? []).map((p) => {
      const source = p.sources[0];
      return {
        title: p.title,
        source: source
          ? `${shortDocumentName(source.documentName)}${
              source.pageNumber ? `, p. ${source.pageNumber}` : ""
            }`
          : "DCE",
        tone:
          p.severity === "HIGH" ? ("is-risk" as const) : ("is-warn" as const),
        href: `${base}/analyse`,
      };
    }),
  ].slice(0, 4);

  return (
    <div>
      {/* --- Prochaine etape ------------------------------------------------ */}
      <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-brand/15 bg-white p-5 shadow-card sm:p-6">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-[0.04em] text-brand uppercase">
            Prochaine étape
          </p>
          <h2 className="mt-1 text-[19px] font-semibold tracking-[-0.02em]">
            {next.title}
          </h2>
          <p className="mt-1 max-w-[70ch] text-[13.5px] text-ink-58">
            {next.detail}
          </p>
        </div>
        <ButtonLink href={`${base}/${next.segment}`} className="h-11 flex-none">
          {next.label}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </ButtonLink>
      </section>

      <div className="app-ui__metrics">
        {metrics.map((m) => (
          <div key={m.label} className={cn("app-ui__metric", m.tone)}>
            <b>{m.value}</b>
            <span>{m.label}</span>
          </div>
        ))}
      </div>

      {failedCount > 0 ? (
        <div className="mt-4">
          <Notice
            tone="warn"
            title={`${failedCount} pièce${failedCount > 1 ? "s" : ""} illisible${failedCount > 1 ? "s" : ""}`}
          >
            Certaines pièces n&apos;ont pas pu être lues. Vérifiez le format ou
            redéposez-les depuis l&apos;onglet DCE.
          </Notice>
        </div>
      ) : null}

      <div className="app-ui__panels app-ui__panels--3">
        <section className="app-ui__panel">
          <div className="app-ui__panel-h">
            Go / No-Go <Link href={`${base}/go-no-go`}>Détail</Link>
          </div>
          <div className="app-ui__panel-b">
            {goNoGo ? (
              <>
                <div className={cn("app-ui__score", decision?.tone)}>
                  <b>{goNoGo.score}</b>
                  <span>/ 100</span>
                  {decision ? (
                    <span className={cn("app-ui__tag ml-1", decision.tone)}>
                      {decision.label}
                    </span>
                  ) : null}
                </div>
                {goNoGo.go_no_go_factors.slice(0, 4).map((f) => (
                  <div className="app-ui__krow" key={f.id}>
                    <span className="app-ui__krow-t">{f.label}</span>
                    <span
                      className={cn(
                        "app-ui__bar",
                        f.score >= 70 ? "is-ok" : f.score >= 45 ? "is-warn" : "is-risk",
                      )}
                    >
                      <i style={{ width: `${f.score}%` }} />
                    </span>
                    <em>{f.score}</em>
                  </div>
                ))}
              </>
            ) : (
              <p className="app-ui__empty">
                Analysez le DCE puis évaluez le dossier pour obtenir une
                recommandation argumentée.
              </p>
            )}
          </div>
        </section>

        <section className="app-ui__panel">
          <div className="app-ui__panel-h">
            Mémoire technique <Link href={`${base}/memoire`}>Ouvrir</Link>
          </div>
          <div className="app-ui__panel-b">
            {memoryProgress === null ? (
              <p className="app-ui__empty">
                Le plan du mémoire apparaîtra après la stratégie de réponse.
              </p>
            ) : (
              <>
                <div className="app-ui__krow">
                  <span className="app-ui__krow-t">Chapitres rédigés</span>
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
                {memorySections.slice(0, 3).map((section) => {
                  const done = (section.content ?? "").trim().length > 0;
                  return (
                    <div className="app-ui__req" key={section.id}>
                      <span
                        className={cn("app-ui__box", done && "is-on")}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="app-ui__req-t line-clamp-1">
                          {section.title}
                        </span>
                        <span className="app-ui__req-s">
                          {done ? "Rédigé" : "À rédiger"}
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
            Points d&apos;attention <span>Avant dépôt</span>
          </div>
          <div className="app-ui__panel-b">
            {alerts.length === 0 ? (
              <p className="app-ui__empty">
                Aucune alerte pour le moment. Les points de vigilance du DCE et
                les problèmes bloquants du contrôle qualité s&apos;affichent ici.
              </p>
            ) : (
              alerts.map((alert, index) => (
                <Link
                  href={alert.href}
                  className={cn("app-ui__flag hover:bg-paper", alert.tone)}
                  key={`${alert.title}-${index}`}
                >
                  <b className="line-clamp-2">{alert.title}</b>
                  <span>{alert.source}</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
