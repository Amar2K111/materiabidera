"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GoNoGoAnalysis, GoRecommendation } from "@/lib/data/decision";
import { formatDateTime } from "@/lib/projects";
import { Sources } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const RECOMMENDATION_LABELS: Record<
  GoRecommendation,
  { label: string; tone: "ok" | "warn" | "risk" }
> = {
  GO: { label: "GO", tone: "ok" },
  VIGILANCE: { label: "GO SOUS RESERVE", tone: "warn" },
  NO_GO: { label: "NO-GO", tone: "risk" },
};

const CONFIDENCE_LABELS: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
  HIGH: "Confiance elevee",
  MEDIUM: "Confiance moyenne",
  LOW: "Confiance faible",
};

export function DecisionPanel({
  projectId,
  decision,
  weights,
  companyItemCount,
}: {
  projectId: string;
  decision: GoNoGoAnalysis | null;
  weights: Record<string, number>;
  companyItemCount: number;
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
        setError(payload.message ?? "L'evaluation n'a pas pu aboutir.");
        setRunning(false);
        return;
      }
    } catch {
      setError("L'evaluation n'a pas pu aboutir. Merci de relancer.");
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
      setError("Votre decision n'a pas pu etre enregistree.");
      return;
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
      <div className="max-w-[640px]">
        <h2 className="text-[17px] font-bold">Evaluer l&apos;opportunite</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-58">
          MateriaBTP confronte les exigences du dossier a ce que contient votre base
          entreprise, puis note huit facteurs. Chaque note est justifiee et
          rattachee a ses sources. La decision finale reste la votre.
        </p>

        {companyItemCount === 0 ? (
          <div className="mt-5">
            <Notice tone="warn" title="Votre base entreprise est vide">
              L&apos;evaluation restera tres prudente et peu fiable : sans
              references, moyens ni certifications enregistres, rien ne permet
              d&apos;apprecier ce que vous savez faire.
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
              Evaluation en cours...
            </>
          ) : (
            "Evaluer l'opportunite"
          )}
        </Button>
      </div>
    );
  }

  const effective = decision.user_decision ?? decision.recommendation;
  const shown = RECOMMENDATION_LABELS[effective];

  return (
    <div className="space-y-8">
      {error ? <Notice tone="risk">{error}</Notice> : null}

      {/* --- Score ------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-8 rounded-[10px] border border-line bg-white p-6 shadow-card">
        <div>
          <p className="text-[12px] font-bold text-ink-42">Score global</p>
          <p className="tabular mt-1 text-[54px] leading-none font-extrabold tracking-[-0.05em]">
            {decision.score}
            <span className="text-[22px] text-ink-42"> / 100</span>
          </p>
        </div>

        <div className="border-l border-line pl-8">
          <p className="text-[12px] font-bold text-ink-42">
            {decision.user_decision ? "Votre decision" : "Recommandation"}
          </p>
          <p
            className={cn(
              "mt-2 text-[26px] font-extrabold tracking-[-0.035em]",
              shown.tone === "ok" && "text-ok",
              shown.tone === "warn" && "text-warn",
              shown.tone === "risk" && "text-risk",
            )}
          >
            {shown.label}
          </p>
          {decision.user_decision &&
          decision.user_decision !== decision.recommendation ? (
            <p className="mt-1 text-[12px] text-ink-42">
              MateriaBTP recommandait :{" "}
              {RECOMMENDATION_LABELS[decision.recommendation].label}
            </p>
          ) : null}
        </div>
      </div>

      <Notice>
        Analyse indicative generee par MateriaBTP a partir des documents disponibles
        et de votre base entreprise, le {formatDateTime(decision.generated_at)}.
        Le score est calcule par l&apos;application a partir des notes ci-dessous
        et de ponderations fixes. Il ne remplace pas votre jugement.
      </Notice>

      {decision.summary ? (
        <section>
          <h2 className="mb-3 text-[15px] font-bold">Synthese</h2>
          <p className="max-w-[80ch] text-[13.5px] leading-relaxed text-ink-70">
            {decision.summary}
          </p>
        </section>
      ) : null}

      {/* --- Facteurs ---------------------------------------------------- */}
      <section>
        <h2 className="mb-1 text-[15px] font-bold">Detail des facteurs</h2>
        <p className="mb-4 text-[12.5px] text-ink-42">
          Le pourcentage indique le poids de chaque facteur dans le score global.
        </p>

        <ul className="space-y-3">
          {decision.go_no_go_factors.map((factor) => (
            <li
              key={factor.id}
              className="rounded-[10px] border border-line bg-white p-4 shadow-card"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-[14px] font-bold">
                  {factor.label}
                  <span className="ml-2 text-[12px] font-semibold text-ink-42">
                    poids {weights[factor.key] ?? 0} %
                  </span>
                </h3>
                <div className="flex items-center gap-3">
                  <Badge
                    tone={
                      factor.confidence === "HIGH"
                        ? "neutral"
                        : factor.confidence === "MEDIUM"
                          ? "warn"
                          : "risk"
                    }
                  >
                    {CONFIDENCE_LABELS[factor.confidence]}
                  </Badge>
                  <span className="tabular text-[18px] font-extrabold">
                    {factor.score}
                  </span>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className={cn(
                    "h-full rounded-full",
                    factor.score >= 70
                      ? "bg-ok"
                      : factor.score >= 45
                        ? "bg-warn"
                        : "bg-risk",
                  )}
                  style={{ width: `${factor.score}%` }}
                />
              </div>

              {factor.justification ? (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-70">
                  {factor.justification}
                </p>
              ) : null}

              <Sources sources={factor.sources ?? []} />
            </li>
          ))}
        </ul>
      </section>

      {/* --- Decision de l'utilisateur ------------------------------------ */}
      <section className="border-t border-line pt-6">
        <h2 className="text-[15px] font-bold">Votre decision</h2>
        <p className="mt-1.5 mb-4 max-w-[70ch] text-[13px] text-ink-58">
          MateriaBTP propose, vous tranchez. Votre choix prime sur la recommandation
          et fixe le statut du dossier.
        </p>

        <div className="flex flex-wrap gap-2">
          {(["GO", "VIGILANCE", "NO_GO"] as GoRecommendation[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => decide(value)}
              aria-pressed={decision.user_decision === value}
              className={cn(
                "rounded-[8px] border px-4 py-2.5 text-[13px] font-bold transition-colors",
                decision.user_decision === value
                  ? "border-brand bg-brand-wash text-brand"
                  : "border-line text-ink-58 hover:border-ink",
              )}
            >
              {RECOMMENDATION_LABELS[value].label}
            </button>
          ))}
          {decision.user_decision ? (
            <Button variant="ghost" onClick={() => decide(null)}>
              Revenir a la recommandation
            </Button>
          ) : null}
        </div>

        <div className="mt-5 max-w-[640px]">
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motif de votre decision, points a verifier, arbitrages internes."
          />
          <Button
            variant="ghost"
            className="mt-3"
            onClick={saveNote}
            disabled={savingNote}
          >
            {savingNote ? "Enregistrement..." : "Enregistrer la note"}
          </Button>
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[15px] font-bold">Relancer l&apos;evaluation</h2>
        <p className="mt-1.5 mb-4 max-w-[70ch] text-[13px] text-ink-58">
          Utile apres avoir complete votre base entreprise ou corrige des
          exigences. Votre decision et votre note sont conservees.
        </p>
        <Button onClick={evaluate} disabled={running} variant="ghost">
          {running ? "Evaluation en cours..." : "Relancer l'evaluation"}
        </Button>
      </section>
    </div>
  );
}
