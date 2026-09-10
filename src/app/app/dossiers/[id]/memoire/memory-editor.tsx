"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MemorySection } from "@/lib/data/memory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

type Action = "generate" | "improve" | "shorten" | "expand" | "concrete";

const ACTIONS: Array<{ key: Action; label: string; hint: string }> = [
  { key: "improve", label: "Ameliorer", hint: "Clarifier sans rien ajouter" },
  { key: "shorten", label: "Raccourcir", hint: "Retirer les redites" },
  { key: "expand", label: "Developper", hint: "Approfondir ce qui est etaye" },
  {
    key: "concrete",
    label: "Rendre concret",
    hint: "Remplacer le general par vos elements reels",
  },
];

const STATUS_LABELS: Record<
  MemorySection["status"],
  { label: string; tone: "neutral" | "brand" | "ok" }
> = {
  EMPTY: { label: "A rediger", tone: "neutral" },
  GENERATED: { label: "Redige", tone: "brand" },
  EDITED: { label: "Modifie", tone: "brand" },
  VALIDATED: { label: "Valide", tone: "ok" },
};

export function MemoryEditor({
  projectId,
  organizationId,
  sections,
}: {
  projectId: string;
  organizationId: string;
  sections: MemorySection[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(sections[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<Action | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toConfirm, setToConfirm] = useState<string[]>([]);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? sections[0] ?? null,
    [sections, selectedId],
  );

  // Le brouillon suit le chapitre affiche, sauf si l'utilisateur a des
  // modifications non enregistrees : on ne les ecrase jamais.
  useEffect(() => {
    if (dirty) return;
    setDraft(selected?.content ?? "");
    setToConfirm([]);
  }, [selected?.id, selected?.content, dirty]);

  const progress = useMemo(() => {
    const written = sections.filter((s) => s.status !== "EMPTY").length;
    return sections.length === 0
      ? 0
      : Math.round((written / sections.length) * 100);
  }, [sections]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  async function save(status?: MemorySection["status"]) {
    if (!selected) return;
    setBusy("save");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("memory_sections")
      .update({
        content: draft,
        status: status ?? (draft.trim() ? "EDITED" : "EMPTY"),
      })
      .eq("id", selected.id);

    setBusy(null);
    if (updateError) {
      setError("Le chapitre n'a pas pu etre enregistre.");
      return;
    }
    setDirty(false);
    router.refresh();
  }

  async function runAction(action: Action) {
    if (!selected) return;

    // Une regeneration ecraserait le texte : on demande confirmation.
    if (dirty) {
      setError(
        "Enregistrez ou annulez vos modifications avant de relancer la redaction.",
      );
      return;
    }

    setBusy(action);
    setError(null);
    setToConfirm([]);

    try {
      const response = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "section",
          sectionId: selected.id,
          action,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "La redaction n'a pas pu aboutir.");
        setBusy(null);
        return;
      }

      setToConfirm(payload.outcome?.toConfirm ?? []);
    } catch {
      setError("La redaction n'a pas pu aboutir. Merci de relancer.");
      setBusy(null);
      return;
    }

    setBusy(null);
    router.refresh();
  }

  async function addSection() {
    const supabase = createClient();
    await supabase.from("memory_sections").insert({
      organization_id: organizationId,
      project_id: projectId,
      position: sections.length,
      number: String(sections.length + 1).padStart(2, "0"),
      title: "Nouveau chapitre",
      status: "EMPTY",
    });
    router.refresh();
  }

  async function move(section: MemorySection, direction: -1 | 1) {
    const index = sections.findIndex((s) => s.id === section.id);
    const other = sections[index + direction];
    if (!other) return;

    const supabase = createClient();
    // Echange des positions : le plan reste ordonne sans renumeroter tout.
    await Promise.all([
      supabase
        .from("memory_sections")
        .update({ position: other.position })
        .eq("id", section.id),
      supabase
        .from("memory_sections")
        .update({ position: section.position })
        .eq("id", other.id),
    ]);
    router.refresh();
  }

  async function removeSection(section: MemorySection) {
    const supabase = createClient();
    await supabase.from("memory_sections").delete().eq("id", section.id);
    if (selectedId === section.id) setSelectedId("");
    router.refresh();
  }

  async function renameSection(section: MemorySection, title: string) {
    const supabase = createClient();
    await supabase
      .from("memory_sections")
      .update({ title })
      .eq("id", section.id);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      {/* ---------- Plan ---------- */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-bold">Plan</h2>
          <span className="tabular text-[12px] font-bold text-ink-42">
            {progress} %
          </span>
        </div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="space-y-0.5">
          {sections.map((section, index) => (
            <li key={section.id} className="group">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(section.id);
                  setDirty(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-[7px] px-2.5 py-2 text-left transition-colors",
                  selected?.id === section.id
                    ? "bg-brand-wash text-brand"
                    : "text-ink-58 hover:bg-paper hover:text-ink",
                )}
              >
                <span className="tabular flex-none text-[11.5px] font-bold">
                  {section.number ?? index + 1}
                </span>
                <span className="min-w-0 flex-1 text-[12.5px] font-semibold">
                  {section.title}
                </span>
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 flex-none rounded-full",
                    section.status === "EMPTY" ? "bg-line" : "bg-ok",
                  )}
                  aria-hidden
                />
              </button>

              <div className="flex gap-0.5 px-2 pb-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <IconAction
                  label="Monter"
                  onClick={() => move(section, -1)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" strokeWidth={2} />
                </IconAction>
                <IconAction
                  label="Descendre"
                  onClick={() => move(section, 1)}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="h-3 w-3" strokeWidth={2} />
                </IconAction>
                <IconAction
                  label="Supprimer le chapitre"
                  onClick={() => removeSection(section)}
                >
                  <Trash2 className="h-3 w-3" strokeWidth={2} />
                </IconAction>
              </div>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
          onClick={addSection}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Ajouter un chapitre
        </Button>
      </aside>

      {/* ---------- Editeur ---------- */}
      <section className="min-w-0">
        {!selected ? (
          <Notice>Selectionnez un chapitre dans le plan.</Notice>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="tabular flex-none text-[13px] font-bold text-ink-42">
                  {selected.number}
                </span>
                <Input
                  defaultValue={selected.title}
                  key={selected.id}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && value !== selected.title) {
                      renameSection(selected, value);
                    }
                  }}
                  aria-label="Titre du chapitre"
                  className="h-9 font-bold"
                />
              </div>
              <Badge tone={STATUS_LABELS[selected.status].tone}>
                {STATUS_LABELS[selected.status].label}
              </Badge>
            </div>

            {selected.brief ? (
              <p className="mt-3 rounded-[8px] border border-line bg-paper px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-58">
                <span className="font-bold text-ink">
                  Ce que ce chapitre doit demontrer.
                </span>{" "}
                {selected.brief}
              </p>
            ) : null}

            {error ? (
              <div className="mt-4">
                <Notice tone="risk">{error}</Notice>
              </div>
            ) : null}

            {toConfirm.length > 0 ? (
              <div className="mt-4">
                <Notice tone="warn" title="A completer par vos soins">
                  <p className="mt-1">
                    Ces points n&apos;etaient pas couverts par les sources
                    disponibles. Ils n&apos;ont pas ete inventes.
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {toConfirm.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </Notice>
              </div>
            ) : null}

            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDirty(true);
              }}
              rows={24}
              placeholder="Redigez ce chapitre, ou lancez une premiere redaction depuis les outils a droite."
              className="mt-4 w-full rounded-[10px] border border-line bg-white px-4 py-3.5 text-[14px] leading-[1.75] focus:border-brand focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => save()}
                disabled={!dirty || busy !== null}
              >
                {busy === "save" ? "Enregistrement..." : "Enregistrer"}
              </Button>

              {selected.status !== "EMPTY" ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => save("VALIDATED")}
                  disabled={busy !== null}
                >
                  Valider le chapitre
                </Button>
              ) : null}

              <span className="tabular text-[12.5px] text-ink-42">
                {words} mot{words > 1 ? "s" : ""}
                {selected.word_target
                  ? ` sur environ ${selected.word_target} attendus`
                  : ""}
              </span>

              {dirty ? (
                <span className="text-[12.5px] font-semibold text-warn">
                  Modifications non enregistrees
                </span>
              ) : null}
            </div>
          </>
        )}
      </section>

      {/* ---------- Sources et outils ---------- */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="mb-3 text-[13px] font-bold">Redaction assistee</h2>

        <div className="space-y-1.5">
          <Button
            type="button"
            className="w-full justify-start"
            onClick={() => runAction("generate")}
            disabled={busy !== null || !selected}
          >
            {busy === "generate" ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            )}
            {selected?.status === "EMPTY" ? "Rediger" : "Rediger a nouveau"}
          </Button>

          {selected?.status !== "EMPTY"
            ? ACTIONS.map((action) => (
                <Button
                  key={action.key}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => runAction(action.key)}
                  disabled={busy !== null}
                  title={action.hint}
                >
                  {busy === action.key ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      strokeWidth={1.8}
                    />
                  ) : null}
                  {action.label}
                </Button>
              ))
            : null}
        </div>

        <h2 className="mt-8 mb-3 text-[13px] font-bold">Sources</h2>
        {!selected || selected.memory_sources.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-ink-42">
            Aucune source rattachee a ce chapitre. Les sources apparaissent une
            fois la redaction lancee.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {selected.memory_sources.map((source) => (
              <li
                key={source.id}
                className="flex items-start gap-2 rounded-[7px] border border-line bg-paper px-2.5 py-2"
              >
                <FileText
                  className="mt-0.5 h-3 w-3 flex-none text-ink-42"
                  strokeWidth={1.8}
                />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold">{source.label}</p>
                  <p className="text-[10.5px] text-ink-42">
                    {source.origin === "DCE"
                      ? "Dossier de consultation"
                      : "Base entreprise"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-6 w-6 items-center justify-center rounded-[5px] text-ink-42 transition-colors hover:bg-paper hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
