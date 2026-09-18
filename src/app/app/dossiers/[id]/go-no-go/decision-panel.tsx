"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GoNoGoAnalysis, GoRecommendation } from "@/lib/data/decision";
import { formatDateTime } from "@/lib/projects";
import { Sources } from "@/components/app/sources";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";
import { RuleChecks } from "./rule-checks";

const RECOMMENDATION_LABELS: Record<
  GoRecommendation,
  { label: string; tone: "ok" | "warn" | "risk"; hint: string }
> = {
  GO: { label: "GO", tone: "ok", hint: "Répondre" },
  VIGILANCE: { label: "GO sous réserve", tone: "warn", hint: "Répondre en levant les réserves" },
  NO_GO: { label: "NO-GO", tone: "risk", hint: "Ne pas répondre" },
};

const CONFIDENCE_LABELS: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "Confiance élevée",
  MEDIUM: "Confiance moyenne",
  LOW: "Confiance faible",
};

export function DecisionPanel({
  projectId,
  decision,
  weights,
  companyItemCount,
  rulesConfigured,
}: {
  projectId: string;
  decision: GoNoGoAnalysis | null;
  weights: Record<string, number>;
  companyItemCount: number;
  /** Criteres de qualification fixes, ou null avant la migration 0011. */
  rulesConfigured: number | null;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState(decision?.user_note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  async function evaluate() {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "go-no-go" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "L'évaluation n'a pas pu aboutir.");
        setRunning(false);
        return;
      }
    } catch {
      setError("L'évaluation n'a pas pu aboutir. Merci de relancer.");
      setRunning(false);
      return;
    }

    setRunning(false);
    router.refresh();
  }

  async function decide(value: GoRecommendation | null) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("go_no_go_analyses")
      .update({
        user_decision: value,
        decided_at: value ? new Date().toISOString() : null,
      })
      .eq("id", decision?.id ?? "");

    if (updateError) {
      setError("Votre décision n'a pas pu être enregistrée.");
      return;
    }

    // La decision de l'utilisateur fixe le statut du dossier, tant que la
    // redaction n'a pas commence : un dossier deja redige ne recule pas.
    const effectiveValue = value ?? decision?.recommendation ?? null;
    if (effectiveValue) {
      await supabase
        .from("projects")
        .update({ status: effectiveValue === "NO_GO" ? "NO_GO" : "GO" })
        .eq("id", projectId)
        .in("status", ["ANALYZED", "GO", "NO_GO"]);
    }
    router.refresh();
  }

  async function saveNote() {
    setSavingNote(true);
    setError(null);
    const supabase = createClient();
    await supabase
      .from("go_no_go_analyses")
      .update({ user_note: note.trim() || null })
      .eq("id", decision?.id ?? "");
    setSavingNote(false);
    router.refresh();
  }

  if (!decision) {
    return (
      <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-wash text-brand">
          <Scale className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          Évaluer l&apos;opportunité
        </h2>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-58">
          MateriaBTP confronte les exigences du dossier à ce que contient votre
          base entreprise, puis note huit facteurs. Chaque note est justifiée et
          rattachée à ses sources. La décision finale reste la vôtre.
        </p>

        {companyItemCount === 0 ? (
          <div className="mt-5">
            <Notice tone="warn" title="Votre base entreprise est vide">
              L&apos;évaluation restera très prudente : sans références, moyens
              ni certifications enregistrés, rien ne permet d&apos;apprécier ce
              que vous savez faire.
            </Notice>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5">
            <Notice tone="risk">{error}</Notice>
          </div>
        ) : null}

        <Button className="mt-6 h-11" onClick={evaluate} disabled={running}>
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
              Évaluation en cours…
            </>
          ) : (
            "Évaluer l'opportunité"
          )}
        </Button>
      </div>
    );
  }

  const effective = decision.user_decision ?? decision.recommendation;
  const shown = RECOMMENDATION_LABELS[effective];
  const overridden =
    decision.user_decision && decision.user_decision !== decision.recommendation;

  return (
    <div className="space-y-6">
      {error ? <Notice tone="risk">{error}</Notice> : null}

      {/* --- Verdict ------------------------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div
          className={cn(
            "rounded-[14px] border bg-white p-6 shadow-card",
            shown.tone === "ok" && "border-ok/30",
            shown.tone === "warn" && "border-warn/30",
            shown.tone === "risk" && "border-risk/30",
          )}
        >
          <p className="text-[12.5px] font-medium text-ink-42">
            {decision.user_decision ? "Votre décision" : "Recommandation"}
          </p>
          <p
            className={cn(
              "mt-1 text-[30px] leading-tight font-bold tracking-[-0.03em]",
              shown.tone === "ok" && "text-ok",
              shown.tone === "warn" && "text-warn",
              shown.tone === "risk" && "text-risk",
            )}
          >
            {shown.label}
          </p>
          <p className="text-[13px] text-ink-58">{shown.hint}</p>

          <div className="mt-5 flex items-baseline gap-1.5 border-t border-line-soft pt-4">
            <span className="tabular text-[40px] leading-none font-bold tracking-[-0.04em]">
              {decision.score}
            </span>
            <span className="text-[16px] font-semibold text-ink-42">/ 100</span>
          </div>
          {overridden ? (
            <p className="mt-2 text-[12.5px] text-ink-42">
              MateriaBTP recommandait :{" "}
              {RECOMMENDATION_LABELS[decision.recommendation].label}
            </p>
          ) : null}
        </div>

        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold">Synthèse</h2>
          {decision.summary ? (
            <p className="mt-2 text-[14px] leading-relaxed text-ink-70">
              {decision.summary}
            </p>
          ) : null}
          <p className="mt-4 border-t border-line-soft pt-3 text-[12px] leading-relaxed text-ink-42">
            Analyse indicative générée le {formatDateTime(decision.generated_at)}{" "}
            à partir des pièces du dossier et de votre base entreprise. Le score
            est calculé par l&apos;application à partir des notes ci-dessous et
            de pondérations fixes. Il ne remplace pas votre jugement.
          </p>
        </div>
      </section>

      {/* --- Criteres de qualification de l entreprise ---------------------- */}
      <RuleChecks checks={decision.rule_checks ?? []} configured={rulesConfigured} />

      {/* --- Facteurs ------------------------------------------------------ */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Détail des facteurs
          </h2>
          <p className="text-[12.5px] text-ink-42">
            Le pourcentage indique le poids du facteur dans le score.
          </p>
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {decision.go_no_go_factors.map((factor) => (
            <li
              key={factor.id}
              className="flex flex-col rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold">{factor.label}</h3>
                  <p className="mt-0.5 text-[12px] text-ink-42">
                    Poids {weights[factor.key] ?? 0} % ·{" "}
                    <span
                      className={cn(
                        factor.confidence === "MEDIUM" && "text-warn",
                        factor.confidence === "LOW" && "font-semibold text-risk",
                      )}
                    >
                      {CONFIDENCE_LABELS[factor.confidence]}
                    </span>
                  </p>
                </div>
                <span
                  className={cn(
                    "tabular text-[22px] leading-none font-bold",
                    factor.score >= 70
                      ? "text-ok"
                      : factor.score >= 45
                        ? "text-warn"
                        : "text-risk",
                  )}
                >
                  {factor.score}
                </span>
              </div>

              <span
                className={cn(
                  "app-ui__bar mt-3",
                  factor.score >= 70
                    ? "is-ok"
                    : factor.score >= 45
                      ? "is-warn"
                      : "is-risk",
                )}
              >
                <i style={{ width: `${factor.score}%` }} />
              </span>

              {factor.justification ? (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-70">
                  {factor.justification}
                </p>
              ) : null}

              <Sources sources={factor.sources ?? []} className="mt-auto pt-2" />
            </li>
          ))}
        </ul>
      </section>

      {/* --- Decision de l'utilisateur ------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold">Votre décision</h2>
          <p className="mt-1 text-[13px] text-ink-58">
            MateriaBTP propose, vous tranchez. Votre choix prime sur la
            recommandation et fixe le statut du dossier.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(["GO", "VIGILANCE", "NO_GO"] as GoRecommendation[]).map((value) => {
              const item = RECOMMENDATION_LABELS[value];
              const selected = decision.user_decision === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => decide(selected ? null : value)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-[10px] border px-4 py-3 text-left transition-colors",
                    selected
                      ? item.tone === "ok"
                        ? "border-ok bg-ok-wash"
                        : item.tone === "warn"
                          ? "border-warn bg-warn-wash"
                          : "border-risk bg-risk-wash"
                      : "border-line hover:border-ink-42",
                  )}
                >
                  <span
                    className={cn(
                      "block text-[14px] font-bold",
                      item.tone === "ok" && "text-ok",
                      item.tone === "warn" && "text-warn",
                      item.tone === "risk" && "text-risk",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-58">
                    {item.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <Textarea
            rows={3}
            className="mt-4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motif de votre décision, points à vérifier, arbitrages internes."
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={saveNote}
              disabled={savingNote || note === (decision.user_note ?? "")}
            >
              {savingNote ? "Enregistrement…" : "Enregistrer la note"}
            </Button>
            {decision.user_decision ? (
              <Button variant="subtle" size="sm" onClick={() => decide(null)}>
                Revenir à la recommandation
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[14px] border border-line bg-white p-6 shadow-card">
          <h2 className="text-[15px] font-semibold">Relancer l&apos;évaluation</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-58">
            Utile après avoir complété votre base entreprise, modifié vos
            critères de qualification ou corrigé des exigences. Votre décision
            et votre note sont conservées.
          </p>
          <Button
            onClick={evaluate}
            disabled={running}
            variant="ghost"
            className="mt-4"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            )}
            {running ? "Évaluation en cours…" : "Relancer l'évaluation"}
          </Button>
        </div>
      </section>
    </div>
  );
}
