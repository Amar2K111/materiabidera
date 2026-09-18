"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { OUTCOMES, OUTCOME_LABELS, type ProjectOutcome } from "@/lib/outcome";
import { formatDate } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

/**
 * Resultat de la consultation.
 *
 * Saisi apres le depot, il alimente le taux de reussite du tableau de bord.
 * La note garde la trace de ce qui a fait gagner ou perdre (prix du laureat,
 * rang, remarques de la commission) pour les prochaines reponses.
 */
export function OutcomePanel({
  projectId,
  outcome,
  outcomeAt,
  outcomeNote,
}: {
  projectId: string;
  outcome: ProjectOutcome | null;
  outcomeAt: string | null;
  outcomeNote: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(outcomeNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: { outcome?: ProjectOutcome | null; note?: string }) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const change: Record<string, unknown> = {};
    if (next.outcome !== undefined) {
      change.outcome = next.outcome;
      change.outcome_at = next.outcome ? new Date().toISOString() : null;
    }
    if (next.note !== undefined) change.outcome_note = next.note.trim() || null;

    const { error: writeError } = await supabase
      .from("projects")
      .update(change)
      .eq("id", projectId);

    setBusy(false);
    if (writeError) {
      setError("Le résultat n'a pas pu être enregistré. Réessayez dans un instant.");
      return;
    }
    router.refresh();
  }

  const current = outcome ? OUTCOME_LABELS[outcome] : null;

  return (
    <section className="rounded-[12px] border border-line bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] bg-brand-wash text-brand">
            <Trophy className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold">Résultat de la consultation</h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-58">
              {current && outcomeAt
                ? `${current.label} · renseigné le ${formatDate(outcomeAt)}`
                : "Indiquez l'issue une fois connue : elle alimente votre taux de réussite."}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <Notice tone="risk" className="mt-4">
          {error}
        </Notice>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Résultat de la consultation">
        {OUTCOMES.map((value) => {
          const item = OUTCOME_LABELS[value];
          const selected = outcome === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              disabled={busy}
              onClick={() => save({ outcome: selected ? null : value })}
              className={cn(
                "rounded-[10px] border px-4 py-3 text-left transition-colors disabled:opacity-60",
                selected
                  ? item.tone === "ok"
                    ? "border-ok bg-ok-wash"
                    : item.tone === "risk"
                      ? "border-risk bg-risk-wash"
                      : "border-ink-42 bg-paper"
                  : "border-line hover:border-ink-42",
              )}
            >
              <span
                className={cn(
                  "block text-[14px] font-bold",
                  item.tone === "ok" && "text-ok",
                  item.tone === "risk" && "text-risk",
                )}
              >
                {item.label}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-ink-58">
                {item.hint}
              </span>
            </button>
          );
        })}
      </div>

      {outcome ? (
        <div className="mt-4">
          <label htmlFor={`outcome-note-${projectId}`} className="mb-1.5 block text-[13px] font-semibold">
            Retour d&apos;expérience
          </label>
          <Textarea
            id={`outcome-note-${projectId}`}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rang obtenu, prix du lauréat, remarques de la commission, ce qui a fait la différence."
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            disabled={busy || note === (outcomeNote ?? "")}
            onClick={() => save({ note })}
          >
            Enregistrer le retour
          </Button>
        </div>
      ) : null}
    </section>
  );
}
