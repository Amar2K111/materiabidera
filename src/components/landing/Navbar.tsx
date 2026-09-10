"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CalendlyDemoLink } from "./CalendlyDemoLink";

const LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#workflow", label: "Comment ça marche" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#securite", label: "Sécurité" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Barre de navigation : etat colle au defilement (bordure qui apparait) et
 * menu mobile. Reprend le comportement du script de la page HTML d'origine.
 */
export function Navbar({
  secondaryHref,
  secondaryLabel,
}: {
  secondaryHref: string;
  secondaryLabel: string;
}) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${stuck ? " is-stuck" : ""}`} id="nav">
      <div className="wrap nav-in">
        <Link
          href="/#top"
          className="brand"
          aria-label="MateriaBTP — retour en haut de page"
          onClick={() => setOpen(false)}
        >
          <BrandLogo height={26} priority />
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <Link className="nav-login" href={secondaryHref}>
            {secondaryLabel}
          </Link>
          <CalendlyDemoLink className="btn btn--primary btn--sm">
            Réserver une démo
          </CalendlyDemoLink>
          <button
            type="button"
            className="burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        className={`mobile-menu${open ? " is-open" : ""}`}
        id="mobile-menu"
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("a") || t.closest(".btn-calendly")) setOpen(false);
        }}
      >
        <div className="wrap">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
          <CalendlyDemoLink className="btn btn--primary">
            Réserver une démo
          </CalendlyDemoLink>
          <Link
            className="btn btn--ghost"
            href={secondaryHref}
            style={{ width: "100%", marginTop: 10 }}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
