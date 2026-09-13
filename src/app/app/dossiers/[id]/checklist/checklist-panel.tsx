"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  ChecklistEntry,
  ChecklistGroup,
  ChecklistState,
} from "@/lib/services/checklist";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

/** Page du dossier ou corriger un point verifie automatiquement. */
const FIX_SEGMENT: Record<string, { segment: string; label: string }> = {
  auto_engagement_doc: { segment: "documents", label: "Pièces du DCE" },
  auto_certifications: { segment: "", label: "Base entreprise" },
  auto_memory_written: { segment: "memoire", label: "Mémoire" },
  auto_references: { segment: "", label: "Base entreprise" },
  auto_means: { segment: "", label: "Base entreprise" },
  auto_coverage: { segment: "exigences", label: "Exigences" },
  auto_sources: { segment: "memoire", label: "Mémoire" },
  auto_no_blocking: { segment: "controle", label: "Contrôle" },
};

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
      setError("Votre vérification n'a pas pu être enregistrée.");
      return;
    }
    router.refresh();
  }

  const groups: ChecklistGroup[] = ["ADMINISTRATIF", "TECHNIQUE", "CONTROLE"];
  const total = checklist.entries.length;
  const passed = total - checklist.remaining;

  function fixHref(entry: ChecklistEntry) {
    const fix = FIX_SEGMENT[entry.id];
    if (!fix) return null;
    return {
      href:
        fix.label === "Base entreprise"
          ? "/app/base-entreprise"
          : `/app/dossiers/${projectId}${fix.segment ? `/${fix.segment}` : ""}`,
      label: fix.label,
    };
  }

  return (
    <div className="space-y-6">
      {/* --- Verdict --- */}
      <section
        className={cn(
          "flex flex-wrap items-center gap-5 rounded-[14px] border bg-white p-6 shadow-card",
          checklist.ready ? "border-ok/30" : "border-warn/30",
        )}
      >
        <span
          className={cn(
            "flex h-12 w-12 flex-none items-center justify-center rounded-full",
            checklist.ready ? "bg-ok-wash text-ok" : "bg-warn-wash text-warn",
          )}
        >
          {checklist.ready ? (
            <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
          ) : (
            <TriangleAlert className="h-6 w-6" strokeWidth={1.8} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[22px] font-bold tracking-[-0.025em]",
              checklist.ready ? "text-ok" : "text-warn",
            )}
          >
            {checklist.ready
              ? "Prêt à déposer"
              : `${checklist.remaining} point${checklist.remaining > 1 ? "s" : ""} à traiter`}
          </p>
          <p className="mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-ink-58">
            {checklist.ready
              ? "Tous les points vérifiés automatiquement sont satisfaits et vous avez confirmé les autres. La responsabilité du dépôt reste la vôtre."
              : "Les points marqués « Vérifié par MateriaBTP » sont constatés sur vos données. Les autres relèvent de votre propre vérification."}
          </p>
        </div>
        <div className="w-full sm:w-44">
          <p className="tabular text-right text-[13px] font-semibold text-ink-58">
            {passed} / {total}
          </p>
          <span className={cn("app-ui__bar mt-1.5", checklist.ready ? "is-ok" : "is-warn")}>
            <i style={{ width: `${total === 0 ? 0 : (passed / total) * 100}%` }} />
          </span>
        </div>
      </section>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        {groups.map((group) => {
          const entries = checklist.entries.filter((e) => e.group === group);
          if (entries.length === 0) return null;

          return (
            <section key={group}>
              <h2 className="mb-3 text-[15px] font-semibold">{groupLabels[group]}</h2>
              <ul className="divide-y divide-line-soft overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
                {entries.map((entry) => {
                  const fix = !entry.passed && entry.automatic ? fixHref(entry) : null;
                  return (
                    <li key={entry.id} className="flex items-start gap-3 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggle(entry)}
                        disabled={entry.automatic || busy === entry.id}
                        aria-label={
                          entry.automatic
                            ? "Point vérifié automatiquement"
                            : entry.passed
                              ? "Décocher"
                              : "Cocher"
                        }
                        className={cn(
                          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-[6px] border transition-colors",
                          entry.passed
                            ? "border-ok bg-ok text-white"
                            : entry.automatic
                              ? "border-warn bg-warn-wash"
                              : "border-ink-42 bg-white hover:border-brand",
                          entry.automatic ? "cursor-default" : "cursor-pointer",
                        )}
                      >
                        {entry.passed ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[13.5px] leading-snug font-medium",
                            entry.passed && "text-ink-58",
                          )}
                        >
                          {entry.label}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-42">
                          {entry.detail}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          {entry.automatic ? (
                            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-42">
                              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                              Vérifié par MateriaBTP
                            </span>
                          ) : null}
                          {fix ? (
                            <Link
                              href={fix.href}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand"
                            >
                              Corriger dans {fix.label}
                              <ArrowRight className="h-3 w-3" strokeWidth={2} />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <ButtonLink href={`/app/dossiers/${projectId}/export`} className="h-11">
          Passer à l&apos;export
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </ButtonLink>
      </div>
    </div>
  );
}
