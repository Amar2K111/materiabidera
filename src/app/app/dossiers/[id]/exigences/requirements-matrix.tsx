"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Quote, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  COVERAGE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Requirement,
  type RequirementCategory,
  type RequirementSource,
  type RequirementStatus,
} from "@/lib/requirements";
import { shortDocumentName } from "@/components/app/sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils/cn";

const STATUSES: RequirementStatus[] = ["TO_HANDLE", "COVERED", "MISSING"];

const COVERAGE_TONE = {
  ok: "bg-ok-wash text-ok",
  warn: "bg-warn-wash text-warn",
  risk: "bg-risk-wash text-risk",
  neutral: "bg-line-soft text-ink-58",
};

function shortSource(source: RequirementSource | undefined): string {
  if (!source) return "Sans source";
  const name = source.project_documents
    ? shortDocumentName(source.project_documents.file_name)
    : "Pièce supprimée";
  return source.page_number ? `${name}, p. ${source.page_number}` : name;
}

export function RequirementsMatrix({
  projectId,
  requirements,
  sectionTitles,
  initialOpenId,
}: {
  projectId: string;
  requirements: Requirement[];
  sectionTitles: Record<string, string>;
  initialOpenId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);
  const [filter, setFilter] = useState<RequirementStatus | "ALL">("ALL");
  const [category, setCategory] = useState<RequirementCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // L'exigence ouverte suit l'adresse : un lien depuis le controle qualite
  // ouvre directement la bonne fiche.
  const [linkedId, setLinkedId] = useState(initialOpenId ?? null);
  if ((initialOpenId ?? null) !== linkedId) {
    setLinkedId(initialOpenId ?? null);
    setOpenId(initialOpenId ?? null);
  }

  const counts = useMemo(() => {
    const base = { COVERED: 0, TO_HANDLE: 0, MISSING: 0 };
    for (const r of requirements) base[r.status] += 1;
    return base;
  }, [requirements]);

  const categories = useMemo(
    () =>
      [...new Set(requirements.map((r) => r.category))].sort((a, b) =>
        CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]),
      ),
    [requirements],
  );

  const visible = useMemo(() => {
    const q = query
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    return requirements.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (category !== "ALL" && r.category !== category) return false;
      if (!q) return true;
      return r.text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .includes(q);
    });
  }, [requirements, filter, category, query]);

  const open = requirements.find((r) => r.id === openId) ?? null;
  const coveredPct =
    requirements.length === 0
      ? 0
      : Math.round((counts.COVERED / requirements.length) * 100);

  function openRequirement(id: string | null) {
    setOpenId(id);
    // Adresse partageable sans recharger la page.
    window.history.replaceState(
      null,
      "",
      id ? `${pathname}?exigence=${id}` : pathname,
    );
  }

  async function update(id: string, patch: Partial<Requirement>) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("requirements")
      .update(patch)
      .eq("id", id);

    if (updateError) {
      setError("La modification n'a pas pu être enregistrée.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* --- Couverture ------------------------------------------------------ */}
      <section className="rounded-[14px] border border-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12.5px] font-medium text-ink-42">
              Couverture des exigences
            </p>
            <p className="mt-1 text-[15px] text-ink-70">
              <b className="tabular text-[30px] leading-none font-bold tracking-[-0.03em] text-ink">
                {counts.COVERED}
              </b>{" "}
              sur {requirements.length} couvertes
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-[13px]">
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-ok" /> {counts.COVERED} couvertes
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-warn" /> {counts.TO_HANDLE} à traiter
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-risk" /> {counts.MISSING} manquantes
            </span>
          </div>
        </div>
        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-line-soft">
          <span className="bg-ok" style={{ width: `${coveredPct}%` }} />
          <span
            className="bg-risk"
            style={{
              width: `${requirements.length === 0 ? 0 : (counts.MISSING / requirements.length) * 100}%`,
            }}
          />
        </div>
      </section>

      {error ? <Notice tone="risk">{error}</Notice> : null}

      {/* --- Filtres --------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-42"
            strokeWidth={1.8}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une exigence"
            aria-label="Rechercher une exigence"
            className="h-9 w-full rounded-full border border-line bg-white pr-3 pl-9 text-[13px] placeholder:text-ink-42 focus:border-brand focus:outline-none"
          />
        </div>
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
        {categories.length > 1 ? (
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as RequirementCategory | "ALL")
            }
            aria-label="Filtrer par catégorie"
            className="h-9 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-70 focus:border-brand focus:outline-none"
          >
            <option value="ALL">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {/* --- Liste ------------------------------------------------------------ */}
      {visible.length === 0 ? (
        <Notice>Aucune exigence ne correspond à ces filtres.</Notice>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_190px_90px_110px_20px] gap-4 border-b border-line bg-paper px-4 py-2.5 text-[12px] font-medium text-ink-42 xl:grid">
            <span>Exigence</span>
            <span>Catégorie</span>
            <span>Source</span>
            <span>Priorité</span>
            <span>Statut</span>
            <span />
          </div>
          <ul className="divide-y divide-line-soft">
            {visible.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => openRequirement(r.id)}
                  className={cn(
                    "grid w-full gap-x-4 gap-y-2 px-4 py-3.5 text-left transition-colors hover:bg-paper",
                    "grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_120px_190px_90px_110px_20px] xl:items-center",
                    openId === r.id && "bg-brand-wash/60",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[13.5px] leading-snug font-medium">
                      {r.text}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-42 xl:hidden">
                      <span>{CATEGORY_LABELS[r.category]}</span>
                      <span>{shortSource(r.requirement_sources[0])}</span>
                      <span>Priorité {PRIORITY_LABELS[r.priority].toLowerCase()}</span>
                    </span>
                    {r.mandatory || r.coverage || r.is_manual ? (
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {r.mandatory ? (
                          <span className="rounded-[5px] bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-ink-70">
                            Obligatoire
                          </span>
                        ) : null}
                        {r.coverage ? (
                          <span
                            className={cn(
                              "rounded-[5px] px-1.5 py-0.5 text-[11px] font-semibold",
                              COVERAGE_TONE[COVERAGE_LABELS[r.coverage.status].tone],
                            )}
                          >
                            Mémoire : {COVERAGE_LABELS[r.coverage.status].label.toLowerCase()}
                          </span>
                        ) : null}
                        {r.is_manual ? (
                          <span className="text-[11.5px] text-ink-42">Ajoutée manuellement</span>
                        ) : null}
                      </span>
                    ) : null}
                  </span>
                  <span className="hidden text-[13px] text-ink-70 xl:block">
                    {CATEGORY_LABELS[r.category]}
                  </span>
                  <span
                    className="hidden truncate text-[12.5px] text-ink-58 xl:block"
                    title={r.requirement_sources[0]?.project_documents?.file_name}
                  >
                    {shortSource(r.requirement_sources[0])}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[13px] xl:block",
                      r.priority === "HIGH" ? "font-semibold text-ink" : "text-ink-58",
                    )}
                  >
                    {PRIORITY_LABELS[r.priority]}
                  </span>
                  <span className="col-start-2 row-start-1 self-start xl:col-start-auto xl:row-start-auto xl:self-auto">
                    <Badge tone={STATUS_LABELS[r.status].tone}>
                      {STATUS_LABELS[r.status].label}
                    </Badge>
                  </span>
                  <ChevronRight
                    className="hidden h-4 w-4 text-ink-42 xl:block"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open ? (
        <RequirementPanel
          key={open.id}
          requirement={open}
          projectId={projectId}
          sectionTitles={sectionTitles}
          onClose={() => openRequirement(null)}
          onUpdate={update}
        />
      ) : null}
    </div>
  );
}

function RequirementPanel({
  requirement,
  projectId,
  sectionTitles,
  onClose,
  onUpdate,
}: {
  requirement: Requirement;
  projectId: string;
  sectionTitles: Record<string, string>;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Requirement>) => Promise<void>;
}) {
  const [answer, setAnswer] = useState(requirement.current_answer ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-ink/25"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-[480px] flex-col border-l border-line bg-white shadow-[0_0_40px_rgba(16,24,40,0.12)]"
        role="dialog"
        aria-modal="true"
        aria-label="Détail de l'exigence"
      >
        <header className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold">Détail de l&apos;exigence</h2>
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
          <p className="text-[15px] leading-relaxed font-semibold">
            {requirement.text}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{CATEGORY_LABELS[requirement.category]}</Badge>
            <Badge tone={requirement.priority === "HIGH" ? "warn" : "neutral"}>
              Priorité {PRIORITY_LABELS[requirement.priority].toLowerCase()}
            </Badge>
            {requirement.mandatory ? <Badge tone="risk">Obligatoire</Badge> : null}
          </div>
          {requirement.criterion_ref ? (
            <p className="mt-2 text-[12.5px] text-ink-58">
              Critère concerné : <span className="font-medium text-ink-70">{requirement.criterion_ref}</span>
            </p>
          ) : null}

          {requirement.coverage ? (
            <section className="mt-6 rounded-[10px] border border-line p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[12.5px] font-semibold text-ink-42">
                  Couverture dans le mémoire
                </h3>
                <Badge tone={COVERAGE_LABELS[requirement.coverage.status].tone}>
                  {COVERAGE_LABELS[requirement.coverage.status].label}
                </Badge>
              </div>
              {requirement.coverage.present.length > 0 ? (
                <div className="mt-2.5">
                  <p className="text-[12px] font-medium text-ok">Déjà présent</p>
                  <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[13px] leading-relaxed text-ink-70">
                    {requirement.coverage.present.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {requirement.coverage.missing.length > 0 ? (
                <div className="mt-2.5">
                  <p className="text-[12px] font-medium text-warn">Manquant</p>
                  <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[13px] leading-relaxed text-ink-70">
                    {requirement.coverage.missing.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {requirement.coverage.sectionIds.some((id) => sectionTitles[id]) ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {requirement.coverage.sectionIds
                    .filter((id) => sectionTitles[id])
                    .map((id) => (
                      <Link
                        key={id}
                        href={`/app/dossiers/${projectId}/memoire?chapitre=${id}`}
                        className="rounded-[6px] bg-brand-wash px-2 py-1 text-[12px] font-medium text-brand hover:bg-brand/10"
                      >
                        {sectionTitles[id]}
                      </Link>
                    ))}
                </div>
              ) : null}
              <p className="mt-2.5 text-[11.5px] text-ink-42">
                Constaté lors du dernier contrôle qualité.
              </p>
            </section>
          ) : null}

          <section className="mt-6">
            <h3 className="text-[12.5px] font-semibold text-ink-42">Sources</h3>
            {requirement.requirement_sources.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-42">
                Aucune source rattachée.
              </p>
            ) : (
              <ul className="mt-2 space-y-2.5">
                {requirement.requirement_sources.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-[10px] border border-line bg-paper p-3"
                  >
                    <p
                      className="text-[12.5px] font-semibold"
                      title={s.project_documents?.file_name}
                    >
                      {shortSource(s)}
                    </p>
                    {s.quote ? (
                      <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-ink-70 italic">
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
              <h3 className="text-[12.5px] font-semibold text-ink-42">
                Ce que la réponse doit apporter
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-70">
                {requirement.expected_answer}
              </p>
            </section>
          ) : null}

          {requirement.buyer_intent ? (
            <section className="mt-6 rounded-[10px] border border-dashed border-line bg-paper p-3.5">
              <h3 className="text-[12.5px] font-semibold text-ink-42">
                Interprétation : attente implicite de l&apos;acheteur
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-70">
                {requirement.buyer_intent}
              </p>
              <p className="mt-1.5 text-[11.5px] text-ink-42">
                Lecture proposée par MateriaBTP, pas une exigence écrite du dossier.
              </p>
            </section>
          ) : null}

          <section className="mt-6">
            <h3 className="text-[12.5px] font-semibold text-ink-42">
              Votre réponse
            </h3>
            <Textarea
              rows={5}
              className="mt-2"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Notez comment votre entreprise répond à cette exigence, ou dans quelle pièce de l'offre elle est traitée."
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              disabled={saving || answer === (requirement.current_answer ?? "")}
              onClick={async () => {
                setSaving(true);
                await onUpdate(requirement.id, { current_answer: answer });
                setSaving(false);
              }}
            >
              {saving ? "Enregistrement…" : "Enregistrer la réponse"}
            </Button>
          </section>
        </div>

        <footer className="flex-none border-t border-line px-5 py-4">
          <h3 className="text-[12.5px] font-semibold text-ink-42">Statut</h3>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdate(requirement.id, { status: s })}
                aria-pressed={requirement.status === s}
                className={cn(
                  "rounded-[8px] border px-2 py-2 text-[13px] font-semibold transition-colors",
                  requirement.status === s
                    ? s === "COVERED"
                      ? "border-ok bg-ok-wash text-ok"
                      : s === "MISSING"
                        ? "border-risk bg-risk-wash text-risk"
                        : "border-warn bg-warn-wash text-warn"
                    : "border-line text-ink-58 hover:border-ink-42",
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
        "h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        active
          ? "border-brand bg-brand-wash text-brand"
          : "border-line bg-white text-ink-58 hover:border-ink-42",
      )}
    >
      {label}
    </button>
  );
}
