"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { Notice } from "@/components/ui/notice";

type Hit = {
  id: string;
  label: string;
  excerpt: string;
  match: "sens" | "mots" | "sens et mots";
  kind: "Fiche" | "Bibliothèque";
  href: string;
};

type Result = { semantic: boolean; searched: number; results: Hit[] };

const MATCH_LABELS: Record<Hit["match"], string> = {
  sens: "Trouvé par le sens",
  mots: "Mots communs",
  "sens et mots": "Sens et mots communs",
};

/**
 * Recherche dans la base entreprise.
 *
 * On pose la question comme un acheteur la poserait ("astreinte 24 h",
 * "travaux en site occupé") : la reponse remonte avec sa fiche ou son document
 * d'origine. C'est le meme classement que celui qui choisit les preuves du
 * memoire : ce qu'on ne trouve pas ici, la redaction ne le trouvera pas non plus.
 */
export function CompanySearch() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(Result & { query: string }) | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/company/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message ?? "La recherche n'a pas pu aboutir.");
        setResult(null);
      } else {
        setResult({ ...(payload as Result), query: q });
      }
    } catch {
      setError("La recherche n'a pas pu aboutir. Réessayez dans un instant.");
    }
    setBusy(false);
  }

  function clear() {
    setQuery("");
    setResult(null);
    setError(null);
  }

  return (
    <section className="rounded-[12px] border border-line bg-white p-4 shadow-card sm:p-5">
      <form onSubmit={search} className="flex flex-wrap items-center gap-2" role="search">
        <label htmlFor={inputId} className="sr-only">
          Rechercher dans votre base entreprise
        </label>
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-42"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={300}
            placeholder="Posez la question comme un acheteur : astreinte, site occupé, désamiantage…"
            className="h-10 w-full rounded-full border border-line bg-white pr-9 pl-9 text-[13.5px] transition-colors placeholder:text-ink-42 hover:border-ink-42 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={clear}
              className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-42 transition-colors hover:bg-paper hover:text-ink"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={busy || query.trim().length < 2}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-45"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden /> : null}
          Rechercher
        </button>
      </form>

      {error ? (
        <Notice tone="risk" className="mt-3">
          {error}
        </Notice>
      ) : null}

      {result ? (
        <div className="mt-4" aria-live="polite">
          <p className="mb-2 text-[12.5px] text-ink-58">
            {result.results.length === 0
              ? `Aucun élément de votre base ne répond à « ${result.query} ».`
              : `${result.results.length} résultat${result.results.length > 1 ? "s" : ""} pour « ${result.query} », parmi ${result.searched} fiches et passages`}
            {result.semantic ? "" : " · recherche par mots uniquement"}
          </p>

          {result.results.length === 0 ? (
            <p className="rounded-[8px] border border-dashed border-line px-4 py-4 text-[13px] leading-relaxed text-ink-58">
              Si l&apos;information existe dans votre entreprise, ajoutez-la à la
              base : sinon, elle ne pourra pas servir de preuve dans vos mémoires.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft overflow-hidden rounded-[10px] border border-line">
              {result.results.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={hit.href}
                    className="group block px-4 py-3 transition-colors hover:bg-paper"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[13.5px] font-semibold group-hover:text-brand">
                        {hit.label}
                      </span>
                      <span className="rounded-[5px] bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-ink-70">
                        {hit.kind}
                      </span>
                      <span className="text-[11.5px] text-ink-58">{MATCH_LABELS[hit.match]}</span>
                      <ArrowRight
                        className="ml-auto h-3.5 w-3.5 text-ink-42 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    {hit.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-70">
                        {hit.excerpt}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
