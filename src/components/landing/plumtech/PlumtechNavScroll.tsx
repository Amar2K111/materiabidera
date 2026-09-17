"use client";

import { useEffect } from "react";

const HIDDEN_CLASS = "is-nav-hidden";
const MIN_SCROLL = 72;
const DELTA = 8;

/** Masque la nav au scroll bas, la reaffiche au scroll haut. */
export function PlumtechNavScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".plumtech-landing header");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;

      if (y <= MIN_SCROLL) {
        header.classList.remove(HIDDEN_CLASS);
      } else if (y - lastY > DELTA) {
        header.classList.add(HIDDEN_CLASS);
      } else if (lastY - y > DELTA) {
        header.classList.remove(HIDDEN_CLASS);
      }

      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      header.classList.remove(HIDDEN_CLASS);
    };
  }, []);

  return null;
}
