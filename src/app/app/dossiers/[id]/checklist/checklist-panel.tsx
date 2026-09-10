"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  ChecklistEntry,
  ChecklistGroup,
  ChecklistState,
} from "@/lib/services/checklist";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

export function ChecklistPanel({
  projectId,
  organizationId,
  checklist,
  groupLabels,
}: {
  projectId: string;
  organizationId: string;
  checklist: ChecklistState;
  groupLabels: Record<ChecklistGroup, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  /**
   * Un point manuel est enregistre a la premiere coche : la ligne n'existe en
   * base que si l'utilisateur s'est prononce dessus.
   */
  async function toggle(entry: ChecklistEntry) {
    if (entry.automatic) return;
    setBusy(entry.id);
    setError(null);

    const supabase = createClient();
    const { error: writeError } = await supabase.from("checklist_items").upsert(
      {
        organization_id: organizationId,
        project_id: projectId,
        group_name: entry.group,
        auto_key: entry.id,
        label: entry.label,
        detail: entry.detail,
        is_automatic: false,
        checked: !entry.passed,
      },
      { onConflict: "project_id,auto_key" },
    );

    setBusy(null);
    if (writeError) {
      setError("Votre verification n'a pas pu etre enregistree.");
      return;
    }
    router.refresh();
  }

  const groups: ChecklistGroup[] = ["ADMINISTRATIF", "TECHNIQUE", "CONTROLE"];

  return (
    <div className="space-y-8">
      {/* --- Verdict --- */}
      <div
        className={cn(
          "rounded-[10px] border p-6",
          checklist.ready
            ? "border-ok/30 bg-ok-wash"
            : "border-warn/30 bg-warn-wash",
        )}
      >
        <p
          className={cn(
            "text-[28px] font-extrabold tracking-[-0.035em]",
            checklist.ready ? "text-ok" : "text-warn",
          )}
        >
          {checklist.ready
            ? "PRET A DEPOSER"
            : `${checklist.remaining} POINT${checklist.remaining > 1 ? "S" : ""} A TRAITER`}
        </p>
        <p className="mt-2 max-w-[80ch] text-[13px] leading-relaxed text-ink-70">
          {checklist.ready
            ? "Tous les points verifies automatiquement sont satisfaits et vous avez confirme les autres. La responsabilite du depot reste la votre."
            : "Les points marques d'un cadenas sont verifies par MateriaBTP a partir de vos donnees. Les autres relevent de votre propre verification."}
        </p>
      </div>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {groups.map((group) => {
        const entries = checklist.entries.filter((e) => e.group === group);
        if (entries.length === 0) return null;

        return (
          <section key={group}>
            <h2 className="mb-3 text-[15px] font-bold">{groupLabels[group]}</h2>
            <ul className="overflow-hidden rounded-[10px] border border-line">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => toggle(entry)}
                    disabled={entry.automatic || busy === entry.id}
                    aria-label={
                      entry.automatic
                        ? "Point verifie automatiquement"
                        : entry.passed
                          ? "Decocher"
                          : "Cocher"
                    }
                    className={cn(
                      "mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border transition-colors",
                      entry.passed
                        ? "border-ok bg-ok text-white"
                        : "border-ink-42 bg-white",
                      entry.automatic ? "cursor-default" : "hover:border-ink",
                    )}
                  >
                    {entry.passed ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13.5px] font-semibold",
                        entry.passed && "text-ink-58",
                      )}
                    >
                      {entry.label}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-ink-42">
                      {entry.detail}
                    </p>
                  </div>

                  {entry.automatic ? (
                    <Lock
                      className="mt-1 h-3 w-3 flex-none text-ink-42"
                      strokeWidth={1.8}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="border-t border-line pt-6">
        <Link href={`/app/dossiers/${projectId}/export`}>
          <Button className="h-11">Passer a l&apos;export</Button>
        </Link>
      </section>
    </div>
  );
}
