"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deadlineLabel, formatDate } from "@/lib/projects";
import { cn } from "@/lib/utils/cn";

/** "2026-10-15" dans le fuseau du navigateur, pour le champ date. */
function toInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Date limite de remise, modifiable depuis l'en-tete du dossier.
 *
 * Elle est souvent absente du DCE (renvoyee a l'avis de marche) ou reportee par
 * l'acheteur : elle doit pouvoir etre saisie ou corrigee apres la creation. Elle
 * alimente le compte a rebours, les echeances du tableau de bord et le critere
 * de delai de preparation. Meme convention qu'a la creation : 23 h 59 le jour dit.
 */
export function DeadlineEditor({
  projectId,
  deadline,
}: {
  projectId: string;
  deadline: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(toInputValue(deadline));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const due = deadlineLabel(deadline);

  async function save(next: string | null) {
    setBusy(true);
    setError(false);
    const { error: writeError } = await createClient()
      .from("projects")
      .update({ deadline: next ? new Date(`${next}T23:59:59`).toISOString() : null })
      .eq("id", projectId);
    setBusy(false);
    if (writeError) {
      setError(true);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        className="inline-flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (value) void save(value);
        }}
      >
        <CalendarClock strokeWidth={1.8} aria-hidden />
        <label htmlFor={`deadline-${projectId}`} className="sr-only">
          Date limite de remise
        </label>
        <input
          id={`deadline-${projectId}`}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="h-8 rounded-[8px] border border-line bg-white px-2 text-[13px] text-ink focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !value}
          className="h-8 rounded-full bg-brand px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-45"
        >
          Enregistrer
        </button>
        {deadline ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => save(null)}
            className="h-8 rounded-full px-2.5 text-[12.5px] font-semibold text-ink-58 transition-colors hover:bg-paper hover:text-risk"
          >
            Retirer
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setValue(toInputValue(deadline));
            setEditing(false);
            setError(false);
          }}
          className="h-8 rounded-full px-2.5 text-[12.5px] font-semibold text-ink-58 transition-colors hover:bg-paper hover:text-ink"
        >
          Annuler
        </button>
        {error ? (
          <span role="alert" className="text-[12.5px] font-semibold text-risk">
            Enregistrement impossible, réessayez.
          </span>
        ) : null}
      </form>
    );
  }

  return (
    <span>
      <CalendarClock strokeWidth={1.8} aria-hidden />
      {deadline ? formatDate(deadline) : "Sans date limite"}
      {deadline ? (
        <b
          className={cn(
            "font-semibold",
            due.tone === "risk" && "text-risk",
            due.tone === "warn" && "text-warn",
            due.tone === "neutral" && "text-ink-70",
          )}
        >
          · {due.text}
        </b>
      ) : null}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="ml-1 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-brand transition-colors hover:bg-brand-wash"
        aria-label={deadline ? "Modifier la date limite de remise" : "Renseigner la date limite de remise"}
      >
        <Pencil className="!h-3 !w-3" strokeWidth={2} aria-hidden />
        {deadline ? "Modifier" : "Renseigner"}
      </button>
    </span>
  );
}
