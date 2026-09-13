"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MemorySection, MemorySource } from "@/lib/data/memory";
import {
  readableCompanyLabel,
  shortDocumentName,
} from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

type Action = "generate" | "improve" | "shorten" | "expand" | "concrete";

const ACTIONS: Array<{ key: Action; label: string; hint: string }> = [
  { key: "improve", label: "Améliorer", hint: "Clarifier sans rien ajouter" },
  { key: "concrete", label: "Rendre concret", hint: "Remplacer le général par vos éléments réels" },
  { key: "expand", label: "Développer", hint: "Approfondir ce qui est étayé" },
  { key: "shorten", label: "Raccourcir", hint: "Retirer les redites" },
];

const RUNNING_LABELS: Record<Action, string> = {
  generate: "Rédaction du chapitre…",
  improve: "Amélioration du texte…",
  shorten: "Raccourcissement du texte…",
  expand: "Développement du texte…",
  concrete: "Recherche d'éléments concrets…",
};

const STATUS_LABELS: Record<
  MemorySection["status"],
  { label: string; tone: "neutral" | "brand" | "ok" }
> = {
  EMPTY: { label: "À rédiger", tone: "neutral" },
  GENERATED: { label: "Rédigé", tone: "brand" },
  EDITED: { label: "Modifié", tone: "brand" },
  VALIDATED: { label: "Validé", tone: "ok" },
};

function sourceTitle(source: MemorySource) {
  if (source.origin === "ENTREPRISE") return readableCompanyLabel(source.label);
  // "01_RC_Reglement.pdf, page 2" -> "RC Reglement", "p. 2"
  const [file, ...rest] = source.label.split(", ");
  const where = rest.join(", ").replace(/^page\s+/i, "p. ");
  return where ? `${shortDocumentName(file)}, ${where}` : shortDocumentName(file);
}

export function MemoryEditor({
  projectId,
  organizationId,
  sections,
  initialSectionId,
}: {
  projectId: string;
  organizationId: string;
  sections: MemorySection[];
  initialSectionId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState(
    (initialSectionId && sections.some((s) => s.id === initialSectionId)
      ? initialSectionId
      : sections[0]?.id) ?? "",
  );
  const [draft, setDraft] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<Action | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Points a completer, conserves par chapitre : ils ne disparaissent pas au
  // rafraichissement qui suit la redaction.
  const [toConfirm, setToConfirm] = useState<Record<string, string[]>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? sections[0] ?? null,
    [sections, selectedId],
  );

  // Le brouillon suit le chapitre affiche, sauf si l'utilisateur a des
  // modifications non enregistrees : on ne les ecrase jamais.
  useEffect(() => {
    if (dirty) return;
    setDraft(selected?.content ?? "");
  }, [selected?.id, selected?.content, dirty]);

  // La zone de texte grandit avec son contenu : pas de double defilement.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 420)}px`;
  }, [draft, selected?.id]);

  // Quitter la page avec des modifications non enregistrees demande confirmation.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const progress = useMemo(() => {
    const written = sections.filter((s) => s.status !== "EMPTY").length;
    return {
      written,
      pct: sections.length === 0 ? 0 : Math.round((written / sections.length) * 100),
    };
  }, [sections]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const target = selected?.word_target ?? null;

  function select(section: MemorySection) {
    if (section.id === selected?.id) return;
    if (
      dirty &&
      !window.confirm(
        "Vos modifications de ce chapitre ne sont pas enregistrées. Les abandonner ?",
      )
    ) {
      return;
    }
    setDirty(false);
    setError(null);
    setSelectedId(section.id);
    // Adresse partageable sans recharger la page.
    window.history.replaceState(null, "", `${pathname}?chapitre=${section.id}`);
  }

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
      setError("Le chapitre n'a pas pu être enregistré.");
      return;
    }
    setDirty(false);
    router.refresh();
  }

  async function runAction(action: Action) {
    if (!selected) return;

    if (dirty) {
      setError(
        "Enregistrez ou annulez vos modifications avant de relancer la rédaction.",
      );
      return;
    }

    setBusy(action);
    setError(null);

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
        setError(payload.message ?? "La rédaction n'a pas pu aboutir.");
        setBusy(null);
        return;
      }

      setToConfirm((prev) => ({
        ...prev,
        [selected.id]: payload.outcome?.toConfirm ?? [],
      }));
    } catch {
      setError("La rédaction n'a pas pu aboutir. Merci de relancer.");
      setBusy(null);
      return;
    }

    setBusy(null);
    router.refresh();
  }

  async function addSection() {
    const supabase = createClient();
    const { data } = await supabase
      .from("memory_sections")
      .insert({
        organization_id: organizationId,
        project_id: projectId,
        position: sections.length,
        number: String(sections.length + 1).padStart(2, "0"),
        title: "Nouveau chapitre",
        status: "EMPTY",
      })
      .select("id")
      .single();
    if (data?.id) {
      setDirty(false);
      setSelectedId(data.id as string);
    }
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
    if (selected?.id === section.id) {
      setDirty(false);
      setSelectedId(sections.find((s) => s.id !== section.id)?.id ?? "");
    }
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

  const selectedIndex = selected
    ? sections.findIndex((s) => s.id === selected.id)
    : -1;
  const pending = selected ? (toConfirm[selected.id] ?? []) : [];
  const dceSources = selected?.memory_sources.filter((s) => s.origin === "DCE") ?? [];
  const companySources =
    selected?.memory_sources.filter((s) => s.origin === "ENTREPRISE") ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_290px]">
      {/* ---------- Plan ---------- */}
      <aside className="order-1 lg:sticky lg:top-[72px] lg:order-none lg:self-start">
        <div className="rounded-[12px] border border-line bg-white p-3 shadow-card">
          <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
            <h2 className="text-[13.5px] font-semibold">Plan du mémoire</h2>
            <span className="tabular text-[12px] font-semibold text-ink-42">
              {progress.written}/{sections.length}
            </span>
          </div>
          <span className="app-ui__bar mx-1.5 mt-2.5 mb-3 !block">
            <i style={{ width: `${progress.pct}%` }} />
          </span>

          <ol className="space-y-0.5">
            {sections.map((section, index) => {
              const active = selected?.id === section.id;
              return (
                <li key={section.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => select(section)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-[8px] px-2 py-2 pr-14 text-left transition-colors",
                      active
                        ? "bg-brand-wash text-brand"
                        : "text-ink-70 hover:bg-paper hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[10px] font-bold",
                        section.status === "EMPTY"
                          ? "border border-line bg-white text-ink-42"
                          : section.status === "VALIDATED"
                            ? "bg-ok text-white"
                            : "bg-brand/85 text-white",
                      )}
                      aria-hidden
                    >
                      {section.status === "EMPTY" ? index + 1 : <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 text-[12.5px] leading-snug font-medium">
                      {section.title}
                    </span>
                  </button>

                  <div className="absolute top-1.5 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconAction
                      label="Monter"
                      onClick={() => move(section, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                    </IconAction>
                    <IconAction
                      label="Descendre"
                      onClick={() => move(section, 1)}
                      disabled={index === sections.length - 1}
                    >
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                    </IconAction>
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={addSection}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-line px-3 py-2 text-[12.5px] font-medium text-ink-58 transition-colors hover:border-brand hover:text-brand"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Ajouter un chapitre
          </button>
        </div>
      </aside>

      {/* ---------- Editeur ---------- */}
      {/* Sur petit ecran, les outils passent avant le texte : pas de long
          defilement pour lancer une redaction. */}
      <section className="order-3 min-w-0 lg:order-none">
        {!selected ? (
          <Notice>Sélectionnez un chapitre dans le plan.</Notice>
        ) : (
          <div className="rounded-[14px] border border-line bg-white shadow-card">
            <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-5 py-3.5 sm:px-7">
              <span className="tabular text-[13px] font-semibold text-ink-42">
                Chapitre {selectedIndex + 1}
              </span>
              <Badge tone={STATUS_LABELS[selected.status].tone}>
                {STATUS_LABELS[selected.status].label}
              </Badge>
              <div className="ml-auto">
                <ConfirmButton
                  label="Supprimer ce chapitre"
                  confirmLabel="Supprimer le chapitre"
                  onConfirm={() => removeSection(selected)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </ConfirmButton>
              </div>
            </div>

            <div className="px-5 pt-5 pb-6 sm:px-7">
              <textarea
                defaultValue={selected.title}
                key={selected.id}
                rows={Math.max(1, Math.ceil(selected.title.length / 46))}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== selected.title) {
                    renameSection(selected, value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Titre du chapitre"
                className="-ml-1 block w-full resize-none rounded-[6px] border border-transparent bg-transparent px-1 py-0.5 text-[21px] leading-snug font-semibold tracking-[-0.02em] hover:border-line focus:border-brand focus:outline-none"
              />

              {selected.brief ? (
                <p className="mt-3 rounded-[10px] bg-paper px-4 py-3 text-[13px] leading-relaxed text-ink-58">
                  <span className="font-semibold text-ink-70">
                    Ce que ce chapitre doit démontrer :{" "}
                  </span>
                  {selected.brief}
                </p>
              ) : null}

              {error ? (
                <div className="mt-4">
                  <Notice tone="risk">{error}</Notice>
                </div>
              ) : null}

              {pending.length > 0 ? (
                <div className="mt-4">
                  <Notice tone="warn" title="À compléter par vos soins">
                    <p>
                      Ces points n&apos;étaient pas couverts par les sources
                      disponibles. Ils n&apos;ont pas été inventés : complétez-les
                      dans le texte ou dans votre base entreprise.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {pending.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </Notice>
                </div>
              ) : null}

              {busy && busy !== "save" ? (
                <div className="mt-5 flex items-center gap-3 rounded-[10px] border border-brand/15 bg-brand-wash px-4 py-3 text-[13px] font-medium text-brand">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
                  {RUNNING_LABELS[busy]} Cela prend généralement moins d&apos;une minute.
                </div>
              ) : null}

              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setDirty(true);
                }}
                disabled={busy !== null && busy !== "save"}
                placeholder="Rédigez ce chapitre, ou lancez une première rédaction avec « Rédiger »."
                className="mt-5 block w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[1.8] text-ink placeholder:text-ink-42 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-b-[14px] border-t border-line-soft bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
              <Button
                type="button"
                onClick={() => save()}
                disabled={!dirty || busy !== null}
              >
                {busy === "save" ? "Enregistrement…" : "Enregistrer"}
              </Button>

              {dirty ? (
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => {
                    setDirty(false);
                    setDraft(selected.content ?? "");
                  }}
                  disabled={busy !== null}
                >
                  Annuler
                </Button>
              ) : selected.status !== "EMPTY" && selected.status !== "VALIDATED" ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => save("VALIDATED")}
                  disabled={busy !== null}
                >
                  <Check className="h-4 w-4" strokeWidth={2} />
                  Valider le chapitre
                </Button>
              ) : null}

              <span className="ml-auto flex items-center gap-2 text-[12.5px] text-ink-42">
                {dirty ? (
                  <span className="font-semibold text-warn">Non enregistré</span>
                ) : null}
                <span className="tabular">
                  {words} mot{words > 1 ? "s" : ""}
                  {target ? ` / ${target} visés` : ""}
                </span>
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ---------- Outils et sources ---------- */}
      <aside className="order-2 space-y-4 lg:order-none lg:col-start-2 xl:sticky xl:top-[72px] xl:col-start-auto xl:self-start">
        <div className="rounded-[12px] border border-line bg-white p-4 shadow-card">
          <h2 className="text-[13.5px] font-semibold">Rédaction assistée</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-42">
            Uniquement à partir du DCE et de votre base entreprise.
          </p>

          <Button
            type="button"
            className="mt-3 w-full"
            onClick={() => runAction("generate")}
            disabled={busy !== null || !selected}
          >
            {busy === "generate" ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            )}
            {selected?.status === "EMPTY" ? "Rédiger" : "Rédiger à nouveau"}
          </Button>

          {selected && selected.status !== "EMPTY" ? (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => runAction(action.key)}
                  disabled={busy !== null}
                  title={action.hint}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-[8px] border border-line text-[12.5px] font-medium text-ink-70 transition-colors hover:border-brand hover:text-brand disabled:opacity-45"
                >
                  {busy === action.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
                  ) : null}
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[12px] border border-line bg-white p-4 shadow-card">
          <h2 className="text-[13.5px] font-semibold">
            Sources du chapitre
            {selected && selected.memory_sources.length > 0 ? (
              <span className="ml-1.5 text-ink-42">
                ({selected.memory_sources.length})
              </span>
            ) : null}
          </h2>
          {!selected || selected.memory_sources.length === 0 ? (
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-42">
              Aucune source rattachée. Elles apparaissent après la rédaction.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              <SourceGroup title="Dossier de consultation" sources={dceSources} company={false} />
              <SourceGroup title="Base entreprise" sources={companySources} company />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function SourceGroup({
  title,
  sources,
  company,
}: {
  title: string;
  sources: MemorySource[];
  company: boolean;
}) {
  if (sources.length === 0) return null;
  const Icon = company ? Building2 : FileText;

  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-medium text-ink-42">{title}</p>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li
            key={source.id}
            className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-70"
            title={source.label}
          >
            <Icon
              className={cn(
                "mt-0.5 h-3.5 w-3.5 flex-none",
                company ? "text-brand" : "text-ink-42",
              )}
              strokeWidth={1.8}
            />
            <span className="min-w-0">{sourceTitle(source)}</span>
          </li>
        ))}
      </ul>
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
      className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-white text-ink-42 shadow-card transition-colors hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
