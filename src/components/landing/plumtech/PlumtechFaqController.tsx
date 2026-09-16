"use client";

import { useEffect } from "react";

const FAQ_HEADING = "Questions fr\u00e9quentes";

function isFaqPanel(el: Element | null): el is HTMLElement {
  return (
    el instanceof HTMLElement &&
    el.classList.contains("grid") &&
    (el.classList.contains("grid-rows-[0fr]") ||
      el.classList.contains("grid-rows-[1fr]"))
  );
}

function findFaqSection(root: Element): HTMLElement | null {
  for (const heading of root.querySelectorAll("h2")) {
    if (heading.textContent?.includes(FAQ_HEADING)) {
      return heading.closest("section");
    }
  }
  return null;
}

function setFaqOpen(button: HTMLButtonElement, open: boolean) {
  const panel = button.nextElementSibling;
  if (!isFaqPanel(panel)) return;

  panel.classList.toggle("grid-rows-[0fr]", !open);
  panel.classList.toggle("grid-rows-[1fr]", open);
  button.setAttribute("aria-expanded", String(open));

  const chevron = button.querySelector("svg");
  chevron?.classList.toggle("rotate-180", open);
}

/** Accordion FAQ for Plumtech markup (grid-rows 0fr / 1fr). */
export function PlumtechFaqController() {
  useEffect(() => {
    const root = document.querySelector(".plumtech-landing");
    if (!root) return;

    const faqSection = findFaqSection(root);
    if (!faqSection) return;

    const buttons = Array.from(
      faqSection.querySelectorAll<HTMLButtonElement>("button[type='button']"),
    ).filter((btn) => isFaqPanel(btn.nextElementSibling));

    const cleanups: Array<() => void> = [];

    buttons.forEach((button) => {
      setFaqOpen(button, false);

      const onClick = () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        buttons.forEach((other) => {
          if (other !== button) setFaqOpen(other, false);
        });
        setFaqOpen(button, !isOpen);
      };

      button.addEventListener("click", onClick);
      cleanups.push(() => button.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
