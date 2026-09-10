"use client";

import { useEffect } from "react";

/** Accordeon FAQ — meme comportement que le script de la page HTML d'origine. */
export function FaqController() {
  useEffect(() => {
    const questions = document.querySelectorAll<HTMLButtonElement>(".landing .faq-q");

    function onResize() {
      questions.forEach((q) => {
        if (q.getAttribute("aria-expanded") === "true") {
          const panel = q.parentElement?.nextElementSibling as HTMLElement | null;
          if (panel) panel.style.height = `${panel.scrollHeight}px`;
        }
      });
    }

    questions.forEach((q) => {
      const panel = q.parentElement?.nextElementSibling as HTMLElement | null;
      if (!panel) return;

      q.addEventListener("click", () => {
        const isOpen = q.getAttribute("aria-expanded") === "true";
        questions.forEach((other) => {
          if (other !== q) {
            other.setAttribute("aria-expanded", "false");
            const otherPanel = other.parentElement?.nextElementSibling as HTMLElement | null;
            if (otherPanel) otherPanel.style.height = "0px";
          }
        });
        q.setAttribute("aria-expanded", String(!isOpen));
        panel.style.height = isOpen ? "0px" : `${panel.scrollHeight}px`;
      });
    });

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return null;
}
