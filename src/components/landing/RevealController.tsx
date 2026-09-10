"use client";

import { useEffect } from "react";

/**
 * Apparition douce des blocs marques ".rv" / ".rv-group" au defilement.
 *
 * Reprend fidelement le script de la page HTML d'origine : observation par
 * IntersectionObserver, ajout de la classe "in" une seule fois, stagger leger
 * sur les groupes, et bascule immediate si le mouvement reduit est demande.
 */
export function RevealController() {
  useEffect(() => {
    function initStaggerGroups() {
      document.querySelectorAll<HTMLElement>(".landing .rv-group").forEach((group) => {
        let i = 0;
        for (const child of group.children) {
          if (child instanceof HTMLElement && child.classList.contains("rv-item")) {
            child.style.setProperty("--rv-i", String(i));
            i += 1;
          }
        }
      });
    }

    function isNearViewport(el: Element) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    }

    initStaggerGroups();

    const items = document.querySelectorAll<HTMLElement>(".landing .rv, .landing .rv-group");
    if (items.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const narrow = window.matchMedia("(max-width: 640px)").matches;

    items.forEach((el) => {
      if (isNearViewport(el)) el.classList.add("in");
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin: narrow ? "0px 0px -4% 0px" : "0px 0px -6% 0px",
        threshold: 0.08,
      },
    );

    items.forEach((el) => {
      if (!el.classList.contains("in")) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
