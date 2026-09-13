"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
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
  { label: string; tone: "risk" | "warn" | "neutral" }
> = {
  BLOCKING: { label: "Bloquant", tone: "risk" },
  IMPORTANT: { label: "Important", tone: "warn" },
  MINOR: { label: "Mineur", tone: "neutral" },
};

const KIND_LABELS: Record<QualityIssue["kind"], string> = {
  REQUIREMENT_UNCOVERED: "Exigence non traitée",
  TOO_GENERIC: "Réponse trop générique",
  WEAK_SOURCING: "Source insuffisante",
  UNVERIFIED_CLAIM: "Information non vérifiée",
  CRITERIA_MISALIGNED: "Désalignement avec les critères",
  MISSING_SECTION: "Chapitre manquant",
};

export type IssueRequirement = {
  text: string;
  source: CitedSource | null;
};

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

  if (!check) {
    return (
      <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-wash text-brand">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          Contrôler la conformité du mémoire
        </h2>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-58">
          MateriaBTP vérifie par le calcul la couverture des exigences et la
          traçabilité, puis relit le texte pour repérer ce qui ferait perdre des
          points : passages interchangeables, affirmations non étayées,
          désalignement avec les critères.
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
              Contrôle en cours…
            </>
          ) : (
            "Lancer le contrôle qualité"
          )}
        </Button>
      </div>
    );
  }

  const open = check.quality_issues.filter((i) => !i.resolved_at);
  const resolved = check.quality_issues.filter((i) => i.resolved_at);
  const blocking = open.filter((i) => i.severity === "BLOCKING").length;
  const scoreTone =
    check.score >= 80 ? "text-ok" : check.score >= 55 ? "text-warn" : "text-risk";

  return (
    <div className="space-y-8">
      {error ? <Notice tone="risk">{error}</Notice> : null}

      {/* --- Synthese --------------------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <p className="text-[12.5px] font-medium text-ink-42">Qualité du mémoire</p>
          <p className={cn("tabular mt-1 text-[52px] leading-none font-bold tracking-[-0.05em]", scoreTone)}>
            {check.score}
            <span className="text-[20px] font-semibold text-ink-42"> / 100</span>
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-line-soft pt-4">
            <span
              className={cn(
                "tabular text-[26px] leading-none font-bold",
                blocking > 0 ? "text-risk" : open.length > 0 ? "text-warn" : "text-ok",
              )}
            >
              {open.length}
            </span>
            <span className="text-[13px] leading-snug text-ink-58">
              problème{open.length > 1 ? "s" : ""} ouvert{open.length > 1 ? "s" : ""}
              {blocking > 0 ? (
                <b className="block font-semibold text-risk">
                  dont {blocking} bloquant{blocking > 1 ? "s" : ""}
                </b>
              ) : null}
            </span>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-42">
            Contrôle du {formatDateTime(check.generated_at)}. Les indicateurs
            « calculés » sont mesurés sur vos données ; les autres restent une
            appréciation indicative.
          </p>
        </div>

        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {check.subscores.map((sub) => (
              <li key={sub.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13.5px] font-semibold">
                    {sub.label}
                    <span className="ml-2 text-[11.5px] font-medium text-ink-42">
                      {sub.computed ? "calculé" : "appréciation"}
                    </span>
                  </h3>
                  <span className="tabular text-[16px] font-bold">{sub.score}</span>
                </div>
                <span
                  className={cn(
                    "app-ui__bar mt-2",
                    sub.score >= 80 ? "is-ok" : sub.score >= 55 ? "is-warn" : "is-risk",
                  )}
                >
                  <i style={{ width: `${sub.score}%` }} />
                </span>
                <p className="mt-1.5 text-[12.5px] text-ink-58">{sub.detail}</p>
              </li>
            ))}
          </ul>

          {check.summary ? (
            <div className="mt-6 border-t border-line-soft pt-5">
              <h3 className="text-[13.5px] font-semibold">Appréciation générale</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-70">
                {check.summary}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* --- Problemes --------------------------------------------------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Problèmes détectés{" "}
            <span className="text-ink-42">({open.length})</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={run} disabled={running}>
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
            )}
            {running ? "Contrôle en cours…" : "Relancer le contrôle"}
          </Button>
        </div>

        {open.length === 0 ? (
          <Notice title="Aucun problème ouvert">
            Le mémoire peut passer à la checklist avant dépôt.
          </Notice>
        ) : (
          <ul className="space-y-3">
            {open.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectId={projectId}
                sectionTitle={
                  issue.section_id ? sectionTitles[issue.section_id] : undefined
                }
                requirement={
                  issue.requirement_id
                    ? requirements[issue.requirement_id]
                    : undefined
                }
                onToggle={() => toggleResolved(issue)}
              />
            ))}
          </ul>
        )}

        {resolved.length > 0 ? (
          <>
            <h3 className="mt-8 mb-3 text-[13px] font-semibold text-ink-42">
              Traités ({resolved.length})
            </h3>
            <ul className="divide-y divide-line-soft rounded-[12px] border border-line bg-white">
              {resolved.map((issue) => {
                const requirement = issue.requirement_id
                  ? requirements[issue.requirement_id]
                  : undefined;
                return (
                  <li
                    key={issue.id}
                    className="flex items-center justify-between gap-4 px-4 py-2.5"
                  >
                    <span className="line-clamp-1 text-[13px] text-ink-42 line-through">
                      {requirement?.text ?? issue.title}
                    </span>
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => toggleResolved(issue)}
                    >
                      Rouvrir
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  );
}

function IssueRow({
  issue,
  projectId,
  sectionTitle,
  requirement,
  onToggle,
}: {
  issue: QualityIssue;
  projectId: string;
  sectionTitle?: string;
  requirement?: IssueRequirement;
  onToggle: () => void;
}) {
  const severity = SEVERITY[issue.severity];
  const base = `/app/dossiers/${projectId}`;

  const href =
    issue.kind === "REQUIREMENT_UNCOVERED" && issue.requirement_id
      ? `${base}/exigences?exigence=${issue.requirement_id}`
      : issue.section_id
        ? `${base}/memoire?chapitre=${issue.section_id}`
        : `${base}/memoire`;

  return (
    <li
      className={cn(
        "rounded-[12px] border border-line border-l-[3px] bg-white p-4 shadow-card sm:p-5",
        issue.severity === "BLOCKING" && "border-l-risk",
        issue.severity === "IMPORTANT" && "border-l-warn",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severity.tone}>{severity.label}</Badge>
            <span className="text-[12px] font-medium text-ink-42">
              {KIND_LABELS[issue.kind]}
            </span>
          </div>

          {requirement ? (
            <>
              <h3 className="mt-2 text-[14px] leading-snug font-semibold">
                {requirement.text}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-58">
                Aucun chapitre rédigé ne traite cette exigence. Traitez-la dans
                le mémoire, ou marquez-la comme couverte si elle relève d&apos;une
                autre pièce de l&apos;offre.
              </p>
              {requirement.source ? (
                <div className="mt-2.5">
                  <SourceChip source={requirement.source} />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <h3 className="mt-2 text-[14px] leading-snug font-semibold">
                {issue.title}
              </h3>
              {issue.detail ? (
                <p className="mt-1.5 max-w-[80ch] text-[13px] leading-relaxed text-ink-70">
                  {issue.detail}
                </p>
              ) : null}
            </>
          )}

          {sectionTitle ? (
            <p className="mt-2 text-[12.5px] text-ink-42">
              Chapitre concerné : {sectionTitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-none gap-1.5 sm:flex-col">
          <ButtonLink href={href} size="sm">
            Corriger
          </ButtonLink>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Traité
          </Button>
        </div>
      </div>
    </li>
  );
}
