"use client";

import { useEffect, useState } from "react";

export function Banner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("tc-annonce-cartographie-ia-2026")) {
        document.documentElement.classList.add("banner-off");
        setVisible(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("tc-annonce-cartographie-ia-2026", "1");
    } catch {
      /* ignore */
    }
    document.documentElement.classList.add("banner-off");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="banner fixed inset-x-0 top-0 z-[60] bg-midnight text-white">
      <div className="mx-auto flex h-[var(--banner-h)] w-full max-w-6xl items-center justify-center gap-3 px-6 lg:px-8">
        <a
          href="/demo"
          target="_blank"
          rel="noopener"
          className="arrow-link flex min-w-0 items-center gap-2.5 text-[13px] leading-tight"
        >
          <img
            src="/labels/osez-ia.png"
            alt="Osez l'IA"
            width={320}
            height={232}
            className="hidden h-6 w-auto shrink-0 sm:block"
          />
          <span className="min-w-0 sm:truncate">
            <span className="hidden sm:inline">
              <span className="font-semibold">Sélectionné puis référencé</span> dans la Cartographie
              des Fournisseurs IA 2026 du Hub France IA.{" "}
              <span className="font-semibold underline decoration-white/40 underline-offset-2">
                Voir notre fiche
              </span>
            </span>
            <span className="sm:hidden">
              <span className="font-semibold">Sélectionné puis référencé</span> dans la Cartographie
              des Fournisseurs IA 2026
            </span>
          </span>
          <span className="arrow shrink-0" aria-hidden="true">
            →
          </span>
        </a>
        <button
          type="button"
          aria-label="Masquer l'annonce"
          onClick={dismiss}
          className="-mr-1.5 shrink-0 rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
