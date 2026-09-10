"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { CALENDLY_DEMO_URL } from "@/lib/calendly";

export function DemoModal() {
  const [open, setOpen] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const mountCalendly = useCallback(() => {
    if (mountedRef.current || !embedRef.current || !window.Calendly?.initInlineWidget) {
      return;
    }
    window.Calendly.initInlineWidget({
      url: CALENDLY_DEMO_URL,
      parentElement: embedRef.current,
    });
    mountedRef.current = true;
  }, []);

  const openModal = useCallback(() => {
    setOpen(true);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeBtnRef.current?.focus());
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    if (open) mountCalendly();
  }, [open, mountCalendly]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".btn-calendly")) {
        e.preventDefault();
        openModal();
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openModal]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={mountCalendly}
      />

      <div
        id="demo-modal"
        className={`demo-modal${open ? " is-open" : ""}`}
        aria-hidden={open ? "false" : "true"}
      >
        <div className="demo-modal__backdrop" onClick={closeModal} />
        <div
          className="demo-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          <aside className="demo-modal__intro">
            <div>
              <div className="demo-modal__brand">
                <i aria-hidden="true" />
                BIDERA
              </div>
              <h2 id="demo-modal-title">
                Votre prochain <em>appel d’offres</em> en 30 minutes
              </h2>
              <p>
                Découvrez comment BIDERA structure votre réponse, de l’analyse
                du DCE au mémoire technique vérifié.
              </p>
            </div>
            <ul className="demo-modal__points">
              <li>Analyse en direct d’un de vos DCE en cours</li>
              <li>Parcours BIDERA de bout en bout sur votre cas</li>
              <li>
                Réponses claires sur l’adéquation, la sécurité et l’adoption
              </li>
            </ul>
            <p className="demo-modal__meta">
              30 min · visioconférence · sans engagement
            </p>
          </aside>
          <div className="demo-modal__main">
            <div className="demo-modal__head">
              <div className="demo-modal__steps" aria-hidden="true">
                <span className="is-on">
                  <i /> Choisir un créneau
                </span>
                <span>
                  <i /> Confirmer
                </span>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                className="demo-modal__close"
                aria-label="Fermer"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className="demo-modal__embed" id="calendly-embed" ref={embedRef} />
          </div>
        </div>
      </div>
    </>
  );
}
