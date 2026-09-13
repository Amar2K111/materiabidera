"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CalendlyDemoLink } from "./CalendlyDemoLink";
import { DemoAccessButton } from "./DemoAccessButton";

const LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#workflow", label: "Comment ça marche" },
  { href: "#faq", label: "Ressources" },
] as const;

const MOBILE_LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#workflow", label: "Comment ça marche" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#securite", label: "Sécurité" },
  { href: "#faq", label: "FAQ" },
] as const;

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FlagFr() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="nav-lang-flag"
      aria-hidden="true"
    >
      <clipPath id="nav-fr-flag-clip">
        <circle cx="12" cy="12" r="12" />
      </clipPath>
      <g clipPath="url(#nav-fr-flag-clip)">
        <rect width="8" height="24" x="0" fill="#0055A4" />
        <rect width="8" height="24" x="8" fill="#FFFFFF" />
        <rect width="8" height="24" x="16" fill="#EF4135" />
      </g>
    </svg>
  );
}

/** Barre flottante type MateriaBTP : pilule sombre, liens chevron, CTA bleu MateriaBTP. */
export function Navbar({
  secondaryHref,
  secondaryLabel,
}: {
  secondaryHref: string;
  secondaryLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <header className="nav" id="nav">
      <div className="nav-shell">
        <Link
          href="/#top"
          className="nav-brand"
          aria-label="MateriaBTP — retour en haut de page"
          onClick={() => setOpen(false)}
        >
          <BrandLogo height={26} priority variant="default" />
        </Link>

        <nav className="nav-links" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <a key={l.href} className="nav-link" href={l.href}>
              {l.label}
              <ChevronDown />
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-lang"
            aria-label="Langue : français"
          >
            <FlagFr />
            FR
          </button>
          <DemoAccessButton className="nav-demo-btn nav-demo-btn--ghost" />
          <CalendlyDemoLink className="nav-demo-btn">
            Réserver une démo
          </CalendlyDemoLink>
          <button
            type="button"
            className="nav-burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
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
        <ul>
          {MOBILE_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <DemoAccessButton className="nav-demo-btn nav-demo-btn--block nav-demo-btn--ghost" />
        <CalendlyDemoLink className="nav-demo-btn nav-demo-btn--block">
          Réserver une démo
        </CalendlyDemoLink>
        <Link className="nav-login" href={secondaryHref}>
          {secondaryLabel}
        </Link>
      </div>
    </header>
  );
}
