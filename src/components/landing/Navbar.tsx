"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CalendlyDemoLink } from "./CalendlyDemoLink";
import { DemoAccessButton } from "./DemoAccessButton";

function FlagFr() {
  return (
    <svg
      className="nav-lang-flag"
      viewBox="0 0 16 16"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 0H0V16H16V0Z" fill="#fff" />
      <path d="M5.33333 0H0V16H5.33333V0Z" fill="#1035BB" />
      <path d="M10.6668 0H5.3335V16H10.6668V0Z" fill="#fff" />
      <path d="M15.9998 0H10.6665V16H15.9998V0Z" fill="#E5283F" />
    </svg>
  );
}

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

/** Barre flottante type MateriaBTP : pilule sombre, ancres internes, CTA démo. */
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
