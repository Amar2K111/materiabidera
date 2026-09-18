"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import type { ProjectProgress } from "@/lib/data/projects";
import {
  NEXT_STEP,
  PROJECT_STATUS,
  deadlineLabel,
  formatDate,
} from "@/lib/projects";
import {
  DEFAULT_FILTER,
  applyProjectFilter,
  type ProjectFilter,
} from "@/lib/project-filters";
import { ProjectsFilters } from "./projects-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { OUTCOME_LABELS, type ProjectOutcome } from "@/lib/outcome";

const DECISION = {
  GO: { label: "GO", className: "text-ok" },
  VIGILANCE: { label: "Sous réserve", className: "text-warn" },
  NO_GO: { label: "NO-GO", className: "text-risk" },
} as const;

/** Seuil a partir duquel la barre de recherche aide plus qu'elle n'encombre. */
const FILTERS_FROM = 6;

export function ProjectsTable({
  projects,
  outcomes = {},
}: {
  projects: ProjectProgress[];
  /** Resultat connu, par dossier (migration 0011). */
  outcomes?: Record<string, ProjectOutcome | null>;
}) {
  const [filter, setFilter] = React.useState<ProjectFilter>(DEFAULT_FILTER);
  const visible = React.useMemo(
    () => applyProjectFilter(projects, filter),
    [projects, filter],
  );

  return (
    <div className="space-y-4">
      {projects.length >= FILTERS_FROM ? (
        <ProjectsFilters
          total={projects.length}
          shown={visible.length}
          value={filter}
          onChange={setFilter}
        />
      ) : null}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line px-6 py-12 text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand-wash text-brand">
            <SearchX className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </div>
          <h3 className="text-[15px] font-bold">Aucun dossier ne correspond</h3>
          <p className="mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-ink-58">
            Aucun de vos {projects.length} dossiers ne correspond à cette
            recherche ou à ce filtre.
          </p>
          <Button
            variant="ghost"
            className="mt-5"
            onClick={() => setFilter(DEFAULT_FILTER)}
          >
            Réinitialiser la recherche
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-line bg-white shadow-card">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_110px_140px_150px_minmax(0,1.2fr)] gap-4 border-b border-line bg-paper px-5 py-2.5 text-[12px] font-medium text-ink-42 lg:grid">
            <span>Marché</span>
            <span>Acheteur</span>
            <span>Go / No-Go</span>
            <span>Mémoire</span>
            <span>Date limite</span>
            <span>Prochaine action</span>
          </div>

          <ul className="divide-y divide-line-soft">
            {visible.map((p) => {
              const outcome = outcomes[p.id];
              const status = outcome
                ? { label: OUTCOME_LABELS[outcome].label, tone: OUTCOME_LABELS[outcome].tone }
                : PROJECT_STATUS[p.status];
              const due = deadlineLabel(p.deadline);
              const next = NEXT_STEP[p.status];
              const decision = p.recommendation ? DECISION[p.recommendation] : null;

              return (
                <li key={p.id}>
                  <Link
                    href={`/app/dossiers/${p.id}`}
                    className="group grid gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-paper lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_110px_140px_150px_minmax(0,1.2fr)] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="line-clamp-2 text-[14px] leading-snug font-semibold group-hover:text-brand">
                          {p.name}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {p.reference ? (
                          <span className="text-[12px] text-ink-42">{p.reference}</span>
                        ) : null}
                        {p.is_demo ? <Badge>Dossier exemple</Badge> : null}
                      </div>
                    </div>

                    <p className="line-clamp-2 text-[13px] text-ink-70">
                      {p.buyer ?? <span className="text-ink-42">Non renseigné</span>}
                      {p.lot ? (
                        <span className="block text-[12px] text-ink-42">{p.lot}</span>
                      ) : null}
                    </p>

                    <p className="flex items-baseline gap-1.5 text-[13px]">
                      <span className="text-ink-42 lg:hidden">Go / No-Go :</span>
                      <span
                        className={cn(
                          "tabular text-[16px] font-bold",
                          decision ? decision.className : "text-ink-42",
                        )}
                      >
                        {p.score ?? "—"}
                      </span>
                      {decision ? (
                        <span className="text-[11.5px] font-semibold text-ink-58">
                          {decision.label}
                        </span>
                      ) : null}
                    </p>

                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="text-ink-42 lg:hidden">Mémoire :</span>
                      {p.memoryProgress === null ? (
                        <span className="text-ink-42">—</span>
                      ) : (
                        <>
                          <span className="app-ui__bar max-w-[90px]">
                            <i style={{ width: `${p.memoryProgress}%` }} />
                          </span>
                          <span className="tabular text-[12px] font-semibold">
                            {p.memoryProgress} %
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-[13px]">
                      <span className="text-ink-70">{formatDate(p.deadline)}</span>
                      <span
                        className={cn(
                          "block text-[12px]",
                          due.tone === "risk" && "font-semibold text-risk",
                          due.tone === "warn" && "font-semibold text-warn",
                          due.tone === "neutral" && "text-ink-42",
                        )}
                      >
                        {due.text}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand">
                      {next.label}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
