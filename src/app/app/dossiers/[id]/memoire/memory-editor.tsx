"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import type { MemorySection, MemorySource, SectionVersion } from "@/lib/data/memory";
import { COVERAGE_LABELS, type CoverageStatus } from "@/lib/requirements";
import { formatDateTime } from "@/lib/projects";
import {
  readableCompanyLabel,
  shortDocumentName,
} from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";
import { WriteAllProgress, useWriteAll } from "./write-all";

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

export type SectionRequirement = {
  text: string;
  mandatory: boolean;
  /** Statut constate par le dernier controle, si disponible. */
  coverage: CoverageStatus | null;
  covered: boolean;
};

export type SectionAlert = {
  id: string;
  severity: "BLOCKING" | "IMPORTANT" | "MINOR";
  title: string;
};

/** Ce que la version conservee precedait. */
const VERSION_ORIGINS: Record<string, string> = {
  generation: "Avant nouvelle rédaction",
  improve: "Avant amélioration",
  shorten: "Avant raccourcissement",
  expand: "Avant développement",
  concrete: "Avant « Rendre concret »",
  fix: "Avant correction du contrôle",
  restauration: "Avant restauration",
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
  requirements,
  alerts,
  versionsEnabled,
  initialSectionId,
  autoWriteAll = false,
}: {
  projectId: string;
  organizationId: string;
  sections: MemorySection[];
  requirements: Record<string, SectionRequirement>;
  alerts: Record<string, SectionAlert[]>;
  versionsEnabled: boolean;
  initialSectionId?: string | null;
  /** Lance la redaction de tout le memoire des l'ouverture (plan tout juste construit). */
  autoWriteAll?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState(
    (initialSectionId && sections.some((s) => s.id === initialSectionId)
      ? initialSectionId
      : sections[0]?.id) ?? "",
  );
  const [edited, setEdited] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<Action | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Points a completer, conserves par chapitre : ils ne disparaissent pas au
  // rafraichissement qui suit la redaction.
  const [toConfirm, setToConfirm] = useState<Record<string, string[]>>({});

  // --- Redaction de tout le memoire ------------------------------------------
  const onChapterWritten = useCallback((sectionId: string, items: string[]) => {
    setToConfirm((prev) => ({ ...prev, [sectionId]: items }));
  }, []);
  const writeAll = useWriteAll({ projectId, onChapterWritten });
  const writing = writeAll.state.running;
  const writingId = writing ? writeAll.state.queue[writeAll.state.current]?.id : null;
  const emptySections = sections.filter((s) => s.status === "EMPTY");
  // Toute action sur le texte attend la fin de la redaction en cours.
  const locked = busy !== null || writing;

  function startWriteAll(scope: "remaining" | "all") {
    if (dirty) {
      setError("Enregistrez ou annulez vos modifications avant de lancer la rédaction.");
      return;
    }
    const targets = scope === "remaining" ? emptySections : sections;
    if (
      scope === "all" &&
      !window.confirm(
        versionsEnabled
          ? `Réécrire les ${sections.length} chapitres ? Le texte actuel de chaque chapitre est conservé dans son historique et peut être restauré.`
          : `Réécrire les ${sections.length} chapitres ? Le texte actuel sera remplacé.`,
      )
    ) {
      return;
    }
    setError(null);
    void writeAll.start(targets.map((s) => ({ id: s.id, title: s.title })));
  }

  // Plan tout juste construit depuis « Construire le plan et tout rédiger » :
  // la redaction demarre seule. Le parametre est retire de l'adresse pour
  // qu'un rechargement de la page ne la relance pas.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoWriteAll || autoStarted.current) return;
    const timer = setTimeout(() => {
      autoStarted.current = true;
      window.history.replaceState(null, "", window.location.pathname);
      void writeAll.start(
        sections.filter((s) => s.status === "EMPTY").map((s) => ({ id: s.id, title: s.title })),
      );
    }, 0);
    return () => clearTimeout(timer);
    // Une seule fois, a l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [versions, setVersions] = useState<SectionVersion[] | null>(null);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? sections[0] ?? null,
    [sections, selectedId],
  );

  // Historique du chapitre : recharge a chaque changement de texte enregistre.
  useEffect(() => {
    if (!versionsEnabled || !selected) return;
    let cancelled = false;
    createClient()
      .from("memory_section_versions")
      .select("id, content, origin, created_at")
      .eq("section_id", selected.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!cancelled) setVersions((data ?? []) as SectionVersion[]);
      });
    return () => {
      cancelled = true;
    };
  }, [versionsEnabled, selected?.id, selected?.content, selected]);

  // Le texte affiche suit le chapitre enregistre, sauf si l'utilisateur a des
  // modifications non enregistrees : on ne les ecrase jamais.
  const draft = dirty ? edited : (selected?.content ?? "");

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
    if (!selected || writing) return;

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

  /** Restaure une version : le texte actuel est lui-meme conserve avant. */
  async function restore(version: SectionVersion) {
    if (!selected || writing) return;
    if (dirty) {
      setError("Enregistrez ou annulez vos modifications avant de restaurer une version.");
      return;
    }
    setBusy("save");
    setError(null);

    const supabase = createClient();
    if ((selected.content ?? "").trim()) {
      const { error: keepError } = await supabase.from("memory_section_versions").insert({
        organization_id: organizationId,
        section_id: selected.id,
        content: selected.content,
        origin: "restauration",
      });
      if (keepError) {
        setBusy(null);
        setError("La version actuelle n'a pas pu être conservée : restauration annulée.");
        return;
      }
    }
    const { error: updateError } = await supabase
      .from("memory_sections")
      .update({ content: version.content, status: "EDITED" })
      .eq("id", selected.id);

    setBusy(null);
    if (updateError) {
      setError("La version n'a pas pu être restaurée.");
      return;
    }
    router.refresh();
  }

  async function addSection() {
    if (writing) return;
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
    if (writing) return;
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
    if (writing) return;
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
  const linkedRequirements = (selected?.requirement_ids ?? [])
    .map((id) => ({ id, ...requirements[id] }))
    .filter((r) => r.text);
  const sectionAlerts = selected ? (alerts[selected.id] ?? []) : [];

  return (
    <div className="space-y-5">
    <WriteAllProgress
      projectId={projectId}
      state={writeAll.state}
      onStop={writeAll.stop}
      onDismiss={writeAll.dismiss}
      onResume={() => startWriteAll("remaining")}
      // Les chapitres que la file vient d'ecrire comptent avant meme le rafraichissement.
      memoWritten={
        sections.filter((s) => s.status !== "EMPTY" || writeAll.state.written.includes(s.id)).length
      }
      memoTotal={sections.length}
    />
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

          <div className="mb-3 px-0.5">
            {emptySections.length > 0 ? (
              <Button
                type="button"
                className="w-full"
                onClick={() => startWriteAll("remaining")}
                disabled={locked}
              >
                {writing ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                )}
                {writing
                  ? "Rédaction en cours…"
                  : emptySections.length === sections.length
                    ? "Rédiger tout le mémoire"
                    : emptySections.length === 1
                      ? "Rédiger le chapitre restant"
                      : `Rédiger les ${emptySections.length} chapitres restants`}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => startWriteAll("all")}
                disabled={locked}
              >
                {writing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                )}
                {writing ? "Rédaction en cours…" : "Réécrire tout le mémoire"}
              </Button>
            )}
          </div>

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
                        section.id === writingId
                          ? "border border-brand/30 bg-brand-wash"
                          : section.status === "EMPTY"
                          ? "border border-line bg-white text-ink-42"
                          : section.status === "VALIDATED"
                            ? "bg-ok text-white"
                            : "bg-brand/85 text-white",
                      )}
                      aria-hidden
                    >
                      {section.id === writingId ? (
                        <Loader2 className="h-3 w-3 animate-spin text-brand" strokeWidth={2.5} />
                      ) : section.status === "EMPTY" ? (
                        index + 1
                      ) : (
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-[12.5px] leading-snug font-medium">
                      {section.title}
                    </span>
                  </button>

                  <div className="absolute top-1.5 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconAction
                      label="Monter"
                      onClick={() => move(section, -1)}
                      disabled={index === 0 || writing}
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                    </IconAction>
                    <IconAction
                      label="Descendre"
                      onClick={() => move(section, 1)}
                      disabled={index === sections.length - 1 || writing}
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
            disabled={writing}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-line px-3 py-2 text-[12.5px] font-medium text-ink-58 transition-colors hover:border-brand hover:text-brand disabled:opacity-45"
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
                  disabled={writing}
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

              {selected.criterion_ref ? (
                <p className="mt-2 text-[12.5px] text-ink-58">
                  Critère de notation traité :{" "}
                  <span className="font-medium text-ink-70">{selected.criterion_ref}</span>
                </p>
              ) : null}

              {linkedRequirements.length > 0 ? (
                <details className="group mt-3 rounded-[10px] border border-line-soft">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-[12.5px] font-semibold text-ink-70">
                    Exigences à traiter dans ce chapitre ({linkedRequirements.length})
                    <ChevronDown
                      className="h-3.5 w-3.5 text-ink-42 transition-transform group-open:rotate-180"
                      strokeWidth={2}
                    />
                  </summary>
                  <ul className="divide-y divide-line-soft border-t border-line-soft">
                    {linkedRequirements.map((r) => {
                      const coverage = r.coverage
                        ? COVERAGE_LABELS[r.coverage]
                        : r.covered
                          ? COVERAGE_LABELS.covered
                          : null;
                      return (
                        <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-2">
                          <Link
                            href={`/app/dossiers/${projectId}/exigences?exigence=${r.id}`}
                            className="min-w-0 text-[12.5px] leading-snug text-ink-70 hover:text-brand"
                          >
                            {r.mandatory ? (
                              <span className="mr-1.5 font-semibold text-ink">Obligatoire ·</span>
                            ) : null}
                            {r.text}
                          </Link>
                          {coverage ? (
                            <Badge tone={coverage.tone} className="flex-none">
                              {coverage.label}
                            </Badge>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ) : null}

              {sectionAlerts.length > 0 ? (
                <div className="mt-3 rounded-[10px] border border-warn/25 bg-warn-wash px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-warn">
                      {sectionAlerts.length} point{sectionAlerts.length > 1 ? "s" : ""} relevé
                      {sectionAlerts.length > 1 ? "s" : ""} par le contrôle
                    </p>
                    <Link
                      href={`/app/dossiers/${projectId}/controle`}
                      className="text-[12px] font-semibold text-brand"
                    >
                      Voir et corriger
                    </Link>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-[12.5px] leading-snug text-ink-70">
                    {sectionAlerts.slice(0, 4).map((a) => (
                      <li key={a.id}>
                        <span
                          className={cn(
                            "font-semibold",
                            a.severity === "BLOCKING" ? "text-risk" : "text-ink-58",
                          )}
                        >
                          {a.severity === "BLOCKING"
                            ? "Critique"
                            : a.severity === "IMPORTANT"
                              ? "Important"
                              : "Amélioration"}
                        </span>{" "}
                        · {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
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
                  setEdited(e.target.value);
                  setDirty(true);
                }}
                disabled={(busy !== null && busy !== "save") || writing}
                placeholder="Rédigez ce chapitre, ou lancez une première rédaction avec « Rédiger »."
                className="mt-5 block w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[1.8] text-ink placeholder:text-ink-42 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-b-[14px] border-t border-line-soft bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
              <Button
                type="button"
                onClick={() => save()}
                disabled={!dirty || locked}
              >
                {busy === "save" ? "Enregistrement…" : "Enregistrer"}
              </Button>

              {dirty ? (
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => {
                    setDirty(false);
                  }}
                  disabled={locked}
                >
                  Annuler
                </Button>
              ) : selected.status !== "EMPTY" && selected.status !== "VALIDATED" ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => save("VALIDATED")}
                  disabled={locked}
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
            disabled={locked || !selected}
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
                  disabled={locked}
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

        {versionsEnabled && selected ? (
          <div className="rounded-[12px] border border-line bg-white p-4 shadow-card">
            <h2 className="text-[13.5px] font-semibold">Historique du chapitre</h2>
            {versions === null ? (
              <p className="mt-2 text-[12.5px] text-ink-42">Chargement…</p>
            ) : versions.length === 0 ? (
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-42">
                Chaque nouvelle rédaction conserve la version précédente ici.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-2">
                {versions.map((v) => (
                  <li key={v.id} className="rounded-[8px] border border-line-soft px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-ink-70">
                        {VERSION_ORIGINS[v.origin] ?? "Version précédente"}
                      </span>
                      <button
                        type="button"
                        onClick={() => restore(v)}
                        disabled={locked}
                        title="Le texte actuel est conservé dans l'historique"
                        className="rounded-[6px] px-1.5 py-0.5 text-[12px] font-semibold text-brand hover:bg-brand-wash disabled:opacity-45"
                      >
                        Restaurer
                      </button>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-ink-42">
                      {formatDateTime(v.created_at)} ·{" "}
                      {v.content.trim().split(/\s+/).length} mots
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-58">
                      {v.content.replace(/[#*|]/g, "").slice(0, 180)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </aside>
    </div>
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
