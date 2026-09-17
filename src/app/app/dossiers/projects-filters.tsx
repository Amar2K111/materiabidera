"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import {
  PROJECT_GROUPS,
  type ProjectFilter,
  type SortKey,
} from "@/lib/project-filters";
import { cn } from "@/lib/utils/cn";

/** Barre de recherche, filtres d'etat et tri de la liste des dossiers. */
export function ProjectsFilters({
  total,
  shown,
  value,
  onChange,
}: {
  total: number;
  shown: number;
  value: ProjectFilter;
  onChange: (next: ProjectFilter) => void;
}) {
  const inputId = React.useId();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
      <div className="relative min-w-[240px] flex-1">
        <label htmlFor={inputId} className="sr-only">
          Rechercher un dossier
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-42"
          strokeWidth={1.8}
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="Rechercher un marché, un acheteur, une référence…"
          className="h-9 w-full rounded-full border border-line bg-white pr-9 pl-9 text-[13.5px] transition-colors placeholder:text-ink-42 hover:border-ink-42 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
        />
        {value.query ? (
          <button
            type="button"
            onClick={() => onChange({ ...value, query: "" })}
            className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-42 transition-colors hover:bg-paper hover:text-ink"
            aria-label="Effacer la recherche"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Filtrer par état d'avancement"
      >
        {PROJECT_GROUPS.map((g) => {
          const active = value.group === g.key;
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...value, group: g.key })}
              className={cn(
                "h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-ink-70 hover:border-ink-42 hover:text-ink",
              )}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-[12.5px] text-ink-58">
        Trier par
        <select
          value={value.sort}
          onChange={(e) =>
            onChange({ ...value, sort: e.target.value as SortKey })
          }
          className="h-8 rounded-full border border-line bg-white px-2.5 text-[12.5px] font-medium text-ink transition-colors hover:border-ink-42 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
        >
          <option value="deadline">Date limite</option>
          <option value="recent">Ajout récent</option>
          <option value="name">Intitulé</option>
        </select>
      </label>

      <p aria-live="polite" className="text-[12.5px] text-ink-58">
        {shown === total
          ? `${total} dossier${total > 1 ? "s" : ""}`
          : `${shown} sur ${total}`}
      </p>
    </div>
  );
}
