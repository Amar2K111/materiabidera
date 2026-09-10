"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { QualityCheck, QualityIssue } from "@/lib/data/quality";
import { formatDateTime } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  REQUIREMENT_UNCOVERED: "Exigence non traitee",
  TOO_GENERIC: "Reponse trop generique",
  WEAK_SOURCING: "Source insuffisante",
  UNVERIFIED_CLAIM: "Information non verifiee",
  CRITERIA_MISALIGNED: "Desalignement avec les criteres",
  MISSING_SECTION: "Chapitre manquant",
};

export function QualityPanel({
  projectId,
  check,
  sectionTitles,
}: {
  projectId: string;
  check: QualityCheck | null;
  sectionTitles: Record<string, string>;
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
        setError(payload.message ?? "Le controle n'a pas pu aboutir.");
        setRunning(false);
        return;
      }
    } catch {
      setError("Le controle n'a pas pu aboutir. Merci de relancer.");
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
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Controler la conformite</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          MateriaBTP verifie la couverture des exigences et la tracabilite par le
          calcul, puis relit le texte pour reperer ce qui ferait perdre des
          points : passages interchangeables, affirmations non etayees,
          desalignement avec les criteres.
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
              Controle en cours...
            </>
          ) : (
            "Lancer le controle qualite"
          )}
        </Button>
      </div>
    );
  }

  const open = check.quality_issues.filter((i) => !i.resolved_at);
  const resolved = check.quality_issues.filter((i) => i.resolved_at);
  const blocking = open.filter((i) => i.severity === "BLOCKING").length;

  return (
    <div className="space-y-8">
      {error ? <Notice tone="risk">{error}</Notice> : null}

      {/* --- Score --- */}
      <div className="flex flex-wrap items-center gap-8 rounded-[10px] border border-line bg-white p-6 shadow-card">
        <div>
          <p className="text-[12px] font-bold text-ink-42">Qualite du memoire</p>
          <p className="tabular mt-1 text-[54px] leading-none font-extrabold tracking-[-0.05em]">
            {check.score}
            <span className="text-[22px] text-ink-42"> / 100</span>
          </p>
        </div>
        <div className="border-l border-line pl-8">
          <p className="text-[12px] font-bold text-ink-42">Problemes ouverts</p>
          <p
            className={cn(
              "tabular mt-1 text-[32px] font-extrabold",
              blocking > 0 ? "text-risk" : open.length > 0 ? "text-warn" : "text-ok",
            )}
          >
            {open.length}
          </p>
          {blocking > 0 ? (
            <p className="mt-1 text-[12px] font-bold text-risk">
              dont {blocking} bloquant{blocking > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </div>

      <Notice>
        Controle realise le {formatDateTime(check.generated_at)}. Les indicateurs
        marques « calcule » sont mesures sur vos donnees. Les autres relevent
        d&apos;une appreciation et restent indicatifs.
      </Notice>

      {/* --- Sous-scores --- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold">Detail des indicateurs</h2>
        <ul className="space-y-3">
          {check.subscores.map((sub) => (
            <li
              key={sub.key}
              className="rounded-[10px] border border-line bg-white p-4 shadow-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-[14px] font-bold">
                  {sub.label}
                  <span className="ml-2 text-[11.5px] font-semibold text-ink-42">
                    {sub.computed ? "calcule" : "appreciation"}
                  </span>
                </h3>
                <span className="tabular text-[18px] font-extrabold">
                  {sub.score}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className={cn(
                    "h-full rounded-full",
                    sub.score >= 80
                      ? "bg-ok"
                      : sub.score >= 55
                        ? "bg-warn"
                        : "bg-risk",
                  )}
                  style={{ width: `${sub.score}%` }}
                />
              </div>
              <p className="mt-2 text-[12.5px] text-ink-58">{sub.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {check.summary ? (
        <section>
          <h2 className="mb-3 text-[15px] font-bold">Appreciation generale</h2>
          <p className="max-w-[80ch] text-[13.5px] leading-relaxed text-ink-70">
            {check.summary}
          </p>
        </section>
      ) : null}

      {/* --- Problemes --- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold">
          Problemes detectes ({open.length})
        </h2>

        {open.length === 0 ? (
          <Notice tone="info">
            Aucun probleme ouvert. Le memoire peut passer a la checklist avant
            depot.
          </Notice>
        ) : (
          <ul className="space-y-3">
            {open.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                projectId={projectId}
                sectionTitles={sectionTitles}
                onToggle={() => toggleResolved(issue)}
              />
            ))}
          </ul>
        )}

        {resolved.length > 0 ? (
          <>
            <h3 className="mt-8 mb-3 text-[13px] font-bold text-ink-42">
              Traites ({resolved.length})
            </h3>
            <ul className="space-y-2">
              {resolved.map((issue) => (
                <li
                  key={issue.id}
                  className="flex items-center justify-between gap-4 rounded-[8px] border border-line-soft px-4 py-2.5"
                >
                  <span className="text-[13px] text-ink-42 line-through">
                    {issue.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleResolved(issue)}
                  >
                    Rouvrir
                  </Button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[15px] font-bold">Relancer le controle</h2>
        <p className="mt-1.5 mb-4 max-w-[70ch] text-[13px] text-ink-58">
          A relancer apres avoir corrige les chapitres concernes.
        </p>
        <Button variant="ghost" onClick={run} disabled={running}>
          {running ? "Controle en cours..." : "Relancer le controle"}
        </Button>
      </section>
    </div>
  );
}

function IssueRow({
  issue,
  projectId,
  sectionTitles,
  onToggle,
}: {
  issue: QualityIssue;
  projectId: string;
  sectionTitles: Record<string, string>;
  onToggle: () => void;
}) {
  const severity = SEVERITY[issue.severity];

  return (
    <li className="rounded-[10px] border border-line bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severity.tone}>{severity.label}</Badge>
            <span className="text-[11.5px] font-semibold text-ink-42">
              {KIND_LABELS[issue.kind]}
            </span>
          </div>
          <h3 className="mt-2 text-[14px] font-bold">{issue.title}</h3>
          {issue.detail ? (
            <p className="mt-1.5 max-w-[80ch] text-[13px] leading-relaxed text-ink-70">
              {issue.detail}
            </p>
          ) : null}
          {issue.section_id && sectionTitles[issue.section_id] ? (
            <p className="mt-2 text-[12px] text-ink-42">
              Chapitre concerne : {sectionTitles[issue.section_id]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-none flex-col gap-1.5">
          <Link
            href={
              issue.kind === "REQUIREMENT_UNCOVERED"
                ? `/app/dossiers/${projectId}/exigences`
                : `/app/dossiers/${projectId}/memoire`
            }
          >
            <Button size="sm">Corriger</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Traite
          </Button>
        </div>
      </div>
    </li>
  );
}
