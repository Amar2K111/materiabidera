"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { QualityCheck, QualityIssue } from "@/lib/data/quality";
import type { CitedSource } from "@/lib/requirements";
import { formatDateTime } from "@/lib/projects";
import { SourceChip } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const SEVERITY: Record<
  QualityIssue["severity"],
  { label: string; group: string; tone: "risk" | "warn" | "neutral" }
> = {
  BLOCKING: { label: "Critique", group: "Critique — à corriger avant remise", tone: "risk" },
  IMPORTANT: { label: "Important", group: "Important", tone: "warn" },
  MINOR: { label: "Amélioration", group: "Améliorations", tone: "neutral" },
};

const KIND_LABELS: Record<QualityIssue["kind"], string> = {
  REQUIREMENT_UNCOVERED: "Exigence",
  PARTIAL_COVERAGE: "Couverture partielle",
  MISSING_COMPANY_INFO: "Information entreprise",
  CONSISTENCY: "Cohérence",
  IRRELEVANT_CONTENT: "Lisibilité",
  TOO_GENERIC: "Contenu générique",
  WEAK_SOURCING: "Preuve manquante",
  UNVERIFIED_CLAIM: "Affirmation",
  CRITERIA_MISALIGNED: "Critère",
  MISSING_SECTION: "Chapitre manquant",
};

const TREATMENT = {
  strong: { label: "Solide", tone: "ok" as const },
  adequate: { label: "Correct", tone: "brand" as const },
  weak: { label: "Faible", tone: "warn" as const },
  absent: { label: "Absent", tone: "risk" as const },
};

const CLAIM_STATUS = {
  supported: { label: "Prouvée", tone: "ok" as const },
  partially_supported: { label: "Partiellement prouvée", tone: "warn" as const },
  unsupported: { label: "Sans source", tone: "risk" as const },
  needs_validation: { label: "À valider", tone: "warn" as const },
};

const IMPACT = {
  HIGH: { label: "Impact fort", tone: "risk" as const },
  MEDIUM: { label: "Impact moyen", tone: "warn" as const },
  LOW: { label: "Impact faible", tone: "neutral" as const },
};

export type IssueRequirement = {
  text: string;
  source: CitedSource | null;
};

type Tab = "issues" | "criteria" | "claims" | "missing" | "summary";

export function QualityPanel({
  projectId,
  check,
  sectionTitles,
  requirements,
}: {
  projectId: string;
  check: QualityCheck | null;
  sectionTitles: Record<string, string>;
  requirements: Record<string, IssueRequirement>;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("issues");
  const [fixing, setFixing] = useState<string | null>(null);
  const [fixed, setFixed] = useState<Record<string, boolean>>({});

  async function run() {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/quality`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "Le contrôle n'a pas pu aboutir.");
        setRunning(false);
        return;
      }
    } catch {
      setError("Le contrôle n'a pas pu aboutir. Merci de relancer.");
      setRunning(false);
      return;
    }

    setFixed({});
    setRunning(false);
    router.refresh();
  }

  async function toggleResolved(issue: QualityIssue) {
    const supabase = createClient();
    await supabase
      .from("quality_issues")
      .update({
        resolved_at: issue.resolved_at ? null : new Date().toISOString(),
      })
      .eq("id", issue.id);
    router.refresh();
  }

  /** Correction du chapitre concerne, a partir du probleme releve. */
  async function fixWithAi(issue: QualityIssue) {
    if (!issue.section_id) return;
    setFixing(issue.id);
    setError(null);

    const requirement = issue.requirement_id ? requirements[issue.requirement_id] : undefined;
    const instruction = [
      `${KIND_LABELS[issue.kind]} — ${issue.title}`,
      requirement ? `Exigence concernée : ${requirement.text}` : null,
      issue.detail,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "section",
          sectionId: issue.section_id,
          action: "fix",
          instruction,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "La correction n'a pas pu aboutir.");
        setFixing(null);
        return;
      }
      setFixed((prev) => ({ ...prev, [issue.id]: true }));
    } catch {
      setError("La correction n'a pas pu aboutir. Merci de relancer.");
    }
    setFixing(null);
    router.refresh();
  }

  const open = useMemo(
    () => (check?.quality_issues ?? []).filter((i) => !i.resolved_at),
    [check],
  );

  if (!check) {
    return (
      <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-wash text-brand">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          Contrôler le mémoire avant remise
        </h2>
        <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-ink-58">
          MateriaBTP relit le mémoire comme un évaluateur exigeant : couverture
          réelle de chaque exigence, traitement de chaque critère, preuve de
          chaque affirmation sur l&apos;entreprise, cohérence entre chapitres et
          passages trop génériques. Chaque problème est classé et accompagné
          d&apos;une action.
        </p>

        {error ? (
          <div className="mt-5">
            <Notice tone="risk">{error}</Notice>
          </div>
        ) : null}

        <Button className="mt-6 h-11" onClick={run} disabled={running}>
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
              Contrôle en cours… (1 à 3 minutes)
            </>
          ) : (
            "Lancer le contrôle"
          )}
        </Button>
      </div>
    );
  }

  const engine = check.engine;
  const readiness = engine?.readiness ?? null;
  const resolved = check.quality_issues.filter((i) => i.resolved_at);
  const blocking = open.filter((i) => i.severity === "BLOCKING").length;
  const ready = readiness ? readiness.ready && blocking === 0 : blocking === 0;
  const metrics = readiness
    ? readiness.metrics
    : check.subscores.map((s) => ({ ...s, value: s.score }));

  const tabs: Array<{ key: Tab; label: string; count?: number; hidden?: boolean }> = [
    { key: "issues", label: "À corriger", count: open.length },
    { key: "criteria", label: "Critères", count: engine?.criteriaReview?.length, hidden: !engine?.criteriaReview },
    { key: "claims", label: "Affirmations", count: engine?.claims?.length, hidden: !engine?.claims },
    { key: "missing", label: "Informations à compléter", count: engine?.missingInfo?.length, hidden: !engine?.missingInfo },
    { key: "summary", label: "Synthèse" },
  ];

  return (
    <div className="space-y-6">
      {error ? <Notice tone="risk">{error}</Notice> : null}

      {!engine ? (
        <Notice tone="warn" title="Contrôle en mode simplifié">
          La matrice détaillée (critères, affirmations, informations à compléter)
          nécessite la migration de base 0008. Les problèmes et indicateurs
          ci-dessous restent valables.
        </Notice>
      ) : null}

      {/* --- Verdict et indicateurs ------------------------------------------ */}
      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <div
          className={cn(
            "rounded-[14px] border bg-white p-6 shadow-card",
            ready ? "border-ok/30" : "border-warn/35",
          )}
        >
          <p className="text-[12.5px] font-medium text-ink-42">Score de préparation du mémoire</p>
          <p className="tabular mt-1 text-[52px] leading-none font-bold tracking-[-0.05em]">
            {check.score}
            <span className="text-[20px] font-semibold text-ink-42"> / 100</span>
          </p>
          <div
            className={cn(
              "mt-4 flex items-start gap-2.5 rounded-[10px] px-3.5 py-3",
              ready ? "bg-ok-wash text-ok" : "bg-warn-wash text-warn",
            )}
          >
            {ready ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2} />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2} />
            )}
            <div className="text-[13px]">
              <p className="font-semibold">
                {ready ? "Prêt pour la remise" : "Pas encore prêt"}
              </p>
              {!ready ? (
                <ul className="mt-1 space-y-0.5 text-ink-70">
                  {(readiness?.blockers.length ? readiness.blockers : [`${blocking} problème(s) critique(s)`]).map(
                    (b) => (
                      <li key={b}>{b}</li>
                    ),
                  )}
                </ul>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-42">
            Contrôle du {formatDateTime(check.generated_at)}. Ce score mesure ce
            qui est couvert, prouvé et cohérent : ce n&apos;est pas une
            probabilité de remporter le marché.
          </p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={run} disabled={running}>
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
            )}
            {running ? "Contrôle en cours…" : "Relancer le contrôle"}
          </Button>
        </div>

        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {metrics.map((m) => {
              const value = m.value ?? null;
              return (
                <li key={m.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[13.5px] font-semibold">
                      {m.label}
                      <span className="ml-2 text-[11.5px] font-medium text-ink-42">
                        {m.computed ? "calculé" : "appréciation"}
                      </span>
                    </h3>
                    <span className="tabular text-[16px] font-bold">
                      {value === null ? "—" : `${value} %`}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "app-ui__bar mt-2",
                      value === null ? "" : value >= 80 ? "is-ok" : value >= 55 ? "is-warn" : "is-risk",
                    )}
                  >
                    <i style={{ width: `${value ?? 0}%` }} />
                  </span>
                  <p className="mt-1.5 text-[12.5px] text-ink-58">{m.detail}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* --- Onglets ----------------------------------------------------------- */}
      <div className="flex flex-wrap gap-1.5 border-b border-line">
        {tabs
          .filter((t) => !t.hidden)
          .map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                tab === t.key
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-58 hover:text-ink",
              )}
            >
              {t.label}
              {t.count !== undefined ? (
                <span className="app-ui__step-count">{t.count}</span>
              ) : null}
            </button>
          ))}
      </div>

      {tab === "issues" ? (
        <section className="space-y-6">
          {open.length === 0 ? (
            <Notice title="Aucun problème ouvert">
              Le mémoire peut passer à la checklist avant dépôt.
            </Notice>
          ) : (
            (["BLOCKING", "IMPORTANT", "MINOR"] as const).map((severity) => {
              const group = open.filter((i) => i.severity === severity);
              if (group.length === 0) return null;
              return (
                <div key={severity}>
                  <h3
                    className={cn(
                      "mb-3 text-[14px] font-semibold",
                      severity === "BLOCKING" && "text-risk",
                      severity === "IMPORTANT" && "text-warn",
                      severity === "MINOR" && "text-ink-58",
                    )}
                  >
                    {SEVERITY[severity].group} ({group.length})
                  </h3>
                  <ul className="space-y-3">
                    {group.map((issue) => (
                      <IssueRow
                        key={issue.id}
                        issue={issue}
                        projectId={projectId}
                        sectionTitle={issue.section_id ? sectionTitles[issue.section_id] : undefined}
                        requirement={issue.requirement_id ? requirements[issue.requirement_id] : undefined}
                        fixing={fixing === issue.id}
                        fixed={Boolean(fixed[issue.id])}
                        busy={fixing !== null}
                        onFix={() => fixWithAi(issue)}
                        onToggle={() => toggleResolved(issue)}
                      />
                    ))}
                  </ul>
                </div>
              );
            })
          )}

          {resolved.length > 0 ? (
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-ink-42">
                Traités ({resolved.length})
              </h3>
              <ul className="divide-y divide-line-soft rounded-[12px] border border-line bg-white">
                {resolved.map((issue) => {
                  const requirement = issue.requirement_id ? requirements[issue.requirement_id] : undefined;
                  return (
                    <li key={issue.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <span className="line-clamp-1 text-[13px] text-ink-42 line-through">
                        {requirement?.text ?? issue.title}
                      </span>
                      <Button size="sm" variant="subtle" onClick={() => toggleResolved(issue)}>
                        Rouvrir
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "criteria" && engine?.criteriaReview ? (
        <section className="overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          <ul className="divide-y divide-line-soft">
            {engine.criteriaReview.map((c) => (
              <li key={c.criterion} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TREATMENT[c.treatment].tone}>{TREATMENT[c.treatment].label}</Badge>
                    {c.weight ? <span className="text-[12px] text-ink-42">{c.weight}</span> : null}
                    {!c.easyToFind && c.treatment !== "absent" ? (
                      <span className="text-[12px] text-warn">difficile à retrouver</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-snug font-semibold">{c.criterion}</p>
                  <p className="mt-1 text-[12.5px] text-ink-42">
                    {c.sectionIds.length > 0
                      ? c.sectionIds.map((id) => sectionTitles[id]).filter(Boolean).join(" · ")
                      : "Aucun chapitre ne le traite"}
                  </p>
                </div>
                <div className="text-[13px] leading-relaxed text-ink-70">
                  {c.weaknesses.length > 0 ? (
                    <ul className="list-disc space-y-0.5 pl-4">
                      {c.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink-42">Aucune faiblesse relevée.</p>
                  )}
                  {c.correction ? (
                    <p className="mt-2">
                      <span className="font-semibold text-ink">Correction proposée : </span>
                      {c.correction}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "claims" && engine?.claims ? (
        <section className="space-y-3">
          <p className="text-[13px] text-ink-58">
            Chaque affirmation factuelle sur l&apos;entreprise est confrontée à
            votre base entreprise et au dossier. Une affirmation sans source doit
            être prouvée, reformulée ou supprimée.
          </p>
          <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
            {[...engine.claims]
              .sort((a, b) => Number(a.status === "supported") - Number(b.status === "supported"))
              .map((claim, i) => (
                <li key={i} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={CLAIM_STATUS[claim.status].tone}>{CLAIM_STATUS[claim.status].label}</Badge>
                    {claim.importance === "HIGH" ? (
                      <span className="text-[12px] font-medium text-ink-58">importante</span>
                    ) : null}
                    {claim.sectionId && sectionTitles[claim.sectionId] ? (
                      <span className="text-[12px] text-ink-42">{sectionTitles[claim.sectionId]}</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed">« {claim.text} »</p>
                  {claim.evidence.length > 0 ? (
                    <p className="mt-1 text-[12.5px] text-ok">Preuve : {claim.evidence.join(" · ")}</p>
                  ) : null}
                  {claim.note && claim.status !== "supported" ? (
                    <p className="mt-1 text-[12.5px] text-ink-58">{claim.note}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {tab === "missing" && engine?.missingInfo ? (
        <section className="space-y-3">
          {engine.missingInfo.length === 0 ? (
            <Notice>Aucune information importante ne manque dans votre base entreprise.</Notice>
          ) : (
            <>
              <p className="text-[13px] text-ink-58">
                Ces informations renforceraient nettement le mémoire. Ajoutez-les
                à votre base entreprise, puis rédigez à nouveau les chapitres
                concernés.
              </p>
              <ul className="space-y-2.5">
                {[...engine.missingInfo]
                  .sort((a, b) => ["HIGH", "MEDIUM", "LOW"].indexOf(a.impact) - ["HIGH", "MEDIUM", "LOW"].indexOf(b.impact))
                  .map((m, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-[12px] border border-line bg-white px-5 py-4 shadow-card"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={IMPACT[m.impact].tone}>{IMPACT[m.impact].label}</Badge>
                          {m.criterion ? <span className="text-[12px] text-ink-42">{m.criterion}</span> : null}
                        </div>
                        <p className="mt-1.5 text-[14px] leading-snug font-medium">{m.question}</p>
                      </div>
                      <ButtonLink href="/app/base-entreprise" size="sm" variant="ghost">
                        Compléter
                      </ButtonLink>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {tab === "summary" ? (
        <section className="space-y-4">
          <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
            <h3 className="text-[15px] font-semibold">Relecture de l&apos;évaluateur</h3>
            <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-line text-ink-70">
              {check.summary || "Aucune synthèse disponible."}
            </p>
          </div>
          {readiness?.consistency && readiness.consistency.length > 0 ? (
            <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
              <h3 className="text-[15px] font-semibold">Cohérence entre chapitres</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[13.5px] text-ink-70">
                {readiness.consistency.map((c, i) => (
                  <li key={i}>{c.description}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function IssueRow({
  issue,
  projectId,
  sectionTitle,
  requirement,
  fixing,
  fixed,
  busy,
  onFix,
  onToggle,
}: {
  issue: QualityIssue;
  projectId: string;
  sectionTitle?: string;
  requirement?: IssueRequirement;
  fixing: boolean;
  fixed: boolean;
  busy: boolean;
  onFix: () => void;
  onToggle: () => void;
}) {
  const severity = SEVERITY[issue.severity];
  const base = `/app/dossiers/${projectId}`;
  const needsCompanyInfo = issue.kind === "MISSING_COMPANY_INFO" || issue.kind === "WEAK_SOURCING";
  const sources = (issue.sources ?? []).filter((s) => s.documentName);

  return (
    <li
      className={cn(
        "rounded-[12px] border border-line border-l-[3px] bg-white p-4 shadow-card sm:p-5",
        issue.severity === "BLOCKING" && "border-l-risk",
        issue.severity === "IMPORTANT" && "border-l-warn",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severity.tone}>{severity.label}</Badge>
            <span className="text-[12px] font-medium text-ink-42">{KIND_LABELS[issue.kind]}</span>
            {sectionTitle ? (
              <Link
                href={`${base}/memoire?chapitre=${issue.section_id}`}
                className="text-[12px] text-ink-42 hover:text-brand"
              >
                · {sectionTitle}
              </Link>
            ) : null}
          </div>

          <h4 className="mt-2 text-[14px] leading-snug font-semibold">
            {requirement ? requirement.text : issue.title}
          </h4>
          {requirement ? (
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-58">{issue.title}</p>
          ) : null}

          {issue.detail ? (
            <p className="mt-2 max-w-[85ch] text-[13px] leading-relaxed whitespace-pre-line text-ink-70">
              {issue.detail}
            </p>
          ) : null}

          {sources.length > 0 ? (
            <div className="mt-2.5 space-y-1.5">
              {sources.slice(0, 2).map((s, i) => (
                <div key={i} className="flex flex-wrap items-start gap-2">
                  <SourceChip source={{ ...s, label: "" }} />
                  {s.label && s.label.length > 12 ? (
                    <span className="text-[12.5px] leading-relaxed text-ink-58 italic">« {s.label} »</span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : requirement?.source ? (
            <div className="mt-2.5">
              <SourceChip source={requirement.source} />
            </div>
          ) : null}

          {fixed ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ok">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              Chapitre corrigé. La version précédente est conservée ; relancez le
              contrôle pour vérifier.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:flex-none sm:flex-col">
          {needsCompanyInfo ? (
            <ButtonLink href="/app/base-entreprise" size="sm">
              Compléter la base
            </ButtonLink>
          ) : issue.section_id && !fixed ? (
            <Button size="sm" onClick={onFix} disabled={busy}>
              {fixing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.9} />
              ) : (
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
              )}
              {fixing ? "Correction…" : "Corriger avec l'IA"}
            </Button>
          ) : null}
          {issue.requirement_id ? (
            <ButtonLink href={`${base}/exigences?exigence=${issue.requirement_id}`} size="sm" variant="ghost">
              Voir l&apos;exigence
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </ButtonLink>
          ) : issue.section_id ? (
            <ButtonLink href={`${base}/memoire?chapitre=${issue.section_id}`} size="sm" variant="ghost">
              Ouvrir le chapitre
            </ButtonLink>
          ) : null}
          <Button size="sm" variant="ghost" onClick={onToggle}>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Traité
          </Button>
        </div>
      </div>
    </li>
  );
}
