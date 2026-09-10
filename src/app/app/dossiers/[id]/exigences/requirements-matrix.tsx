"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Quote, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  sourceLabel,
  type Requirement,
  type RequirementStatus,
} from "@/lib/requirements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { MetricRow, type Metric } from "@/components/ui/metrics";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const STATUSES: RequirementStatus[] = ["TO_HANDLE", "COVERED", "MISSING"];

export function RequirementsMatrix({
  projectId,
  requirements,
}: {
  projectId: string;
  requirements: Requirement[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RequirementStatus | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base = { COVERED: 0, TO_HANDLE: 0, MISSING: 0 };
    for (const r of requirements) base[r.status] += 1;
    return base;
  }, [requirements]);

  const visible = useMemo(
    () =>
      filter === "ALL"
        ? requirements
        : requirements.filter((r) => r.status === filter),
    [requirements, filter],
  );

  const open = requirements.find((r) => r.id === openId) ?? null;

  const metrics: Metric[] = [
    { label: "Exigences", value: String(requirements.length) },
    { label: "Couvertes", value: String(counts.COVERED), tone: "ok" },
    { label: "A traiter", value: String(counts.TO_HANDLE), tone: "warn" },
    { label: "Manquantes", value: String(counts.MISSING), tone: "risk" },
  ];

  async function update(id: string, patch: Partial<Requirement>) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("requirements")
      .update(patch)
      .eq("id", id);

    if (updateError) {
      setError("La modification n'a pas pu etre enregistree.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <MetricRow items={metrics} />

      {error ? <Notice tone="risk">{error}</Notice> : null}

      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label={`Toutes (${requirements.length})`}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={`${STATUS_LABELS[s].label} (${counts[s]})`}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-line">
        <table className="min-w-[900px]">
          <thead>
            <tr className="border-b border-line bg-paper text-left">
              <Th>Exigence</Th>
              <Th>Categorie</Th>
              <Th>Source</Th>
              <Th>Priorite</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpenId(r.id)}
                className="cursor-pointer border-b border-line-soft last:border-b-0 hover:bg-paper"
              >
                <td className="px-4 py-3">
                  <p className="max-w-[46ch] text-[13px] font-semibold">
                    {r.text}
                  </p>
                  {r.is_manual ? (
                    <span className="mt-1 inline-block text-[11.5px] text-ink-42">
                      Ajoutee manuellement
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[12.5px] text-ink-70">
                  {CATEGORY_LABELS[r.category]}
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-42">
                  {r.requirement_sources.length === 0
                    ? "Aucune"
                    : sourceLabel(r.requirement_sources[0])}
                </td>
                <td className="px-4 py-3 text-[12.5px] text-ink-70">
                  {PRIORITY_LABELS[r.priority]}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_LABELS[r.status].tone}>
                    {STATUS_LABELS[r.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <RequirementPanel
          requirement={open}
          onClose={() => setOpenId(null)}
          onUpdate={update}
        />
      ) : null}
    </div>
  );
}

function RequirementPanel({
  requirement,
  onClose,
  onUpdate,
}: {
  requirement: Requirement;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Requirement>) => Promise<void>;
}) {
  const [answer, setAnswer] = useState(requirement.current_answer ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[460px] flex-col border-l border-line bg-white shadow-ui"
        role="dialog"
        aria-label="Detail de l'exigence"
      >
        <header className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[14px] font-bold">Detail de l&apos;exigence</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-[7px] text-ink-42 hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-[14px] leading-relaxed font-semibold">
            {requirement.text}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{CATEGORY_LABELS[requirement.category]}</Badge>
            <Badge>Priorite {PRIORITY_LABELS[requirement.priority]}</Badge>
          </div>

          <section className="mt-6">
            <h3 className="text-[12px] font-bold text-ink-42">Sources</h3>
            {requirement.requirement_sources.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-ink-42">
                Aucune source rattachee.
              </p>
            ) : (
              <ul className="mt-2 space-y-3">
                {requirement.requirement_sources.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[8px] border border-line bg-paper p-3"
                  >
                    <p className="text-[12px] font-bold">{sourceLabel(s)}</p>
                    {s.quote ? (
                      <p className="mt-2 flex gap-2 text-[12.5px] leading-relaxed text-ink-70 italic">
                        <Quote
                          className="mt-0.5 h-3 w-3 flex-none text-ink-42"
                          strokeWidth={1.8}
                        />
                        {s.quote}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {requirement.expected_answer ? (
            <section className="mt-6">
              <h3 className="text-[12px] font-bold text-ink-42">
                Ce que la reponse doit apporter
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-70">
                {requirement.expected_answer}
              </p>
            </section>
          ) : null}

          <section className="mt-6">
            <h3 className="text-[12px] font-bold text-ink-42">Votre reponse</h3>
            <Textarea
              rows={5}
              className="mt-2"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Notez ici comment votre entreprise repond a cette exigence."
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-3"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onUpdate(requirement.id, { current_answer: answer });
                setSaving(false);
              }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </section>
        </div>

        <footer className="flex-none border-t border-line px-5 py-4">
          <h3 className="text-[12px] font-bold text-ink-42">Statut</h3>
          <div className="mt-2 flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate(requirement.id, { status: s })}
                className={cn(
                  "flex-1 rounded-[7px] border px-2 py-2 text-[12.5px] font-bold transition-colors",
                  requirement.status === s
                    ? "border-brand bg-brand-wash text-brand"
                    : "border-line text-ink-58 hover:border-ink",
                )}
              >
                {STATUS_LABELS[s].label}
              </button>
            ))}
          </div>
        </footer>
      </aside>
    </>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
        active
          ? "border-brand bg-brand-wash text-brand"
          : "border-line text-ink-58 hover:border-ink",
      )}
    >
      {label}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[11.5px] font-bold text-ink-42">
      {children}
    </th>
  );
}
