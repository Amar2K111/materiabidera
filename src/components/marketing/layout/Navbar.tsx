"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/marketing/ui/Logo";
import { ArrowLink } from "@/components/marketing/ui/ArrowLink";
import { NavIcon } from "@/components/marketing/layout/nav-icons";

const dropdownPanelClass = "rounded bg-white p-2.5 shadow-dropdown ring-1 ring-midnight/10";

const productModules = [
  { href: "/produit/analyse-go-no-go", label: "Analyse & Go/No-Go", description: "Exigences, critères et vigilance du DCE, évaluation sourcée", icon: "analyse" },
  { href: "/produit/memoire-technique", label: "Mémoire technique", description: "Plan sur les critères, rédaction depuis votre base, contrôle", icon: "memoire" },
  { href: "/produit/base-de-connaissances", label: "Base entreprise", description: "Références, moyens, méthodes et anciens mémoires", icon: "knowledge" },
];

const solutionLinks = [
  { href: "/solutions/marches-publics", label: "Marchés publics de travaux", description: "DCE, critères pondérés, mémoire noté" },
];

const btpSectorLink = {
  href: "/secteurs/btp-travaux-publics",
  label: "BTP & Travaux publics",
  description: "Pensé pour les entreprises de travaux",
};

const resourceDiscover = [
  { href: "/blog", label: "Blog", description: "Les pièces d'un appel d'offres expliquées" },
  { href: "/glossaire", label: "Glossaire", description: "Les termes des marchés publics" },
  { href: "/cas-clients", label: "Programme pilote", description: "Tester MateriaBTP sur vos dossiers" },
];

const companyLinks = [
  { href: "/a-propos", label: "À propos", description: "Pourquoi MateriaBTP" },
  { href: "/securite", label: "Sécurité", description: "Comment vos données sont traitées" },
  { href: "/contact", label: "Contact", description: "Écrire au fondateur" },
];

const topLinks = [{ href: "/tarifs", label: "Tarifs" }];

function navTriggerClass(linkClass: string) {
  return `flex items-center gap-1 whitespace-nowrap rounded px-3 py-2 text-[15px] font-medium transition-colors ${linkClass}`;
}

function IconBadge({ icon }: { icon: string }) {
  return (
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-iris text-white">
      <NavIcon name={icon} />
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroThemeDark, setHeroThemeDark] = useState(false);
  const [dropdownLocked, setDropdownLocked] = useState(false);
  const isFirstPathRender = useRef(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHeroTheme = () => setHeroThemeDark(document.documentElement.dataset.heroTheme === "dark");
    syncHeroTheme();
    const frame = requestAnimationFrame(syncHeroTheme);
    window.addEventListener("herothemechange", syncHeroTheme);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("herothemechange", syncHeroTheme);
    };
  }, [pathname]);

  // Changement de page : le menu mobile se referme et les sous-menus restent
  // fermes le temps que le pointeur bouge. Ajustement pendant le rendu plutot
  // que dans un effet, pour eviter un second rendu.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMobileOpen(false);
    setDropdownLocked(true);
  }

  // Le focus qui reste sur un lien du menu garderait son sous-menu ouvert.
  useEffect(() => {
    if (isFirstPathRender.current) {
      isFirstPathRender.current = false;
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest("header")) {
      active.blur();
    }
  }, [pathname]);

  useEffect(() => {
    if (!dropdownLocked) return;
    const unlock = () => setDropdownLocked(false);
    window.addEventListener("pointermove", unlock, { once: true });
    const timer = window.setTimeout(unlock, 600);
    return () => {
      window.removeEventListener("pointermove", unlock);
      window.clearTimeout(timer);
    };
  }, [dropdownLocked]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solidNav = scrolled || mobileOpen;
  const darkNav = heroThemeDark && !scrolled && !mobileOpen;
  const linkClass = darkNav ? "text-white/80 hover:text-white" : "text-midnight/70 hover:text-midnight";
  const dropdownVisibilityClass = dropdownLocked
    ? ""
    : "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-[var(--banner-h)] z-50 transition-all duration-300 ${
          solidNav
            ? "bg-white/85 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8"
          aria-label="Navigation principale"
        >
          <Link aria-label="MateriaBTP : Accueil" className="shrink-0" href="/">
            <Logo className="h-[26px] w-auto" />
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            <NavDropdown label="Produit" align="center" linkClass={linkClass} visibilityClass={dropdownVisibilityClass}>
              <div className={`grid w-[720px] grid-cols-[1.1fr_0.9fr] gap-2 ${dropdownPanelClass}`}>
                <div>
                  <p className="px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-pewter">Modules</p>
                  {productModules.map((item) => (
                    <Link key={item.href} className="flex items-start gap-3.5 rounded p-3.5 transition-colors hover:bg-snow" href={item.href}>
                      <IconBadge icon={item.icon} />
                      <span>
                        <span className="block text-[15px] font-semibold text-midnight">{item.label}</span>
                        <span className="mt-0.5 block text-sm text-pewter">{item.description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col rounded bg-snow p-1.5">
                  <Link className="group/sec block rounded p-3.5 transition-colors hover:bg-white" href="/securite">
                    <span className="flex items-center gap-2 text-[15px] font-semibold text-midnight">
                      <NavIcon name="shield" className="h-4 w-4 text-iris" />
                      Sécurité & confidentialité
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-pewter">
                      Isolation par entreprise, chiffrement, prestataires techniques : ce qui arrive à vos documents.
                    </span>
                  </Link>
                  <ArrowLink href="/demo" className="arrow-link mt-auto flex items-center gap-1.5 rounded p-3.5 text-[14px] font-semibold text-iris transition-colors hover:bg-white">
                    Testez sur un de vos AO
                  </ArrowLink>
                </div>
              </div>
            </NavDropdown>

            <NavDropdown label="Solutions" align="center" linkClass={linkClass} visibilityClass={dropdownVisibilityClass}>
              <div className={`grid w-[640px] grid-cols-2 gap-2 ${dropdownPanelClass}`}>
                <div>
                  <p className="px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-pewter">Par type de consultation</p>
                  {solutionLinks.map((item) => (
                    <Link key={item.href} className="block rounded p-3.5 transition-colors hover:bg-snow" href={item.href}>
                      <span className="block text-[15px] font-semibold text-midnight">{item.label}</span>
                      <span className="mt-0.5 block text-sm text-pewter">{item.description}</span>
                    </Link>
                  ))}
                </div>
                <div className="rounded bg-snow p-1.5">
                  <p className="px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-pewter">100 % BTP</p>
                  <Link className="block rounded p-3.5 transition-colors hover:bg-white" href={btpSectorLink.href}>
                    <span className="block text-[15px] font-semibold text-midnight">{btpSectorLink.label}</span>
                    <span className="mt-0.5 block text-sm text-pewter">{btpSectorLink.description}</span>
                  </Link>
                </div>
              </div>
            </NavDropdown>

            {topLinks.map((link) => (
              <Link key={link.href} className={navTriggerClass(linkClass)} href={link.href}>
                {link.label}
              </Link>
            ))}

            <NavDropdown label="Ressources" align="center" linkClass={linkClass} visibilityClass={dropdownVisibilityClass}>
              <div className={`w-[320px] ${dropdownPanelClass}`}>
                <div>
                  {resourceDiscover.map((item) => (
                    <Link key={item.href} className="block rounded px-3.5 py-2.5 transition-colors hover:bg-white" href={item.href}>
                      <span className="block text-[15px] font-semibold text-midnight">{item.label}</span>
                      <span className="mt-0.5 block text-sm text-pewter">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </NavDropdown>

            <NavDropdown label="Entreprise" align="right" linkClass={linkClass} visibilityClass={dropdownVisibilityClass}>
              <div className={`w-[270px] ${dropdownPanelClass}`}>
                {companyLinks.map((item) => (
                  <Link key={item.href} className="flex items-center justify-between gap-3 rounded p-3 transition-colors hover:bg-snow" href={item.href}>
                    <span>
                      <span className="block text-[15px] font-semibold text-midnight">{item.label}</span>
                      <span className="mt-0.5 block text-sm text-pewter">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </NavDropdown>
          </div>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a
              href="/login"
              className={`whitespace-nowrap rounded border px-3.5 py-2 text-[15px] font-medium transition-colors ${
                darkNav
                  ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                  : "border-iris/30 text-iris hover:border-iris hover:bg-periwinkle/50"
              }`}
            >
              Connexion
            </a>
            <ArrowLink
              href="/demo"
              className={`arrow-link inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-4 py-2 text-[15px] font-medium transition-colors ${
                darkNav ? "bg-white text-midnight hover:bg-white/90" : "bg-iris text-white hover:bg-iris-hover"
              }`}
            >
              Testez sur un de vos AO
            </ArrowLink>
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex h-10 w-10 items-center justify-center rounded xl:hidden ${darkNav ? "text-white" : "text-midnight"}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[calc(var(--banner-h)+4rem)] z-40 overflow-y-auto bg-white px-6 pb-10 pt-4 xl:hidden">
          <p className="px-1 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-pewter">Produit</p>
          <div className="space-y-1">
            {productModules.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded p-3 hover:bg-snow" onClick={() => setMobileOpen(false)}>
                <span className="flex h-9 w-9 items-center justify-center rounded bg-iris text-white">
                  <NavIcon name={item.icon} />
                </span>
                <span className="text-[15px] font-semibold text-midnight">{item.label}</span>
              </Link>
            ))}
          </div>

          <p className="px-1 pb-2 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-pewter">Solutions</p>
          <div className="space-y-1">
            {solutionLinks.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>

          <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-pewter">BTP</p>
          <div className="space-y-1">
            <Link href={btpSectorLink.href} className="block rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
              {btpSectorLink.label}
            </Link>
          </div>

          <p className="px-1 pb-2 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-pewter">Ressources</p>
          <div className="space-y-1">
            {resourceDiscover.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>

          <p className="px-1 pb-2 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-pewter">Entreprise</p>
          <div className="space-y-1">
            {companyLinks.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/securite" className="block rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
              Sécurité & confidentialité
            </Link>
          </div>

          <div className="mt-4 space-y-1 border-t border-line pt-4">
            {topLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded p-3 text-[15px] font-semibold text-midnight hover:bg-snow" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>

          <a
            href="/login"
            className="mt-6 flex items-center justify-center rounded border border-iris/30 px-5 py-3.5 text-[15px] font-semibold text-iris hover:border-iris hover:bg-periwinkle/50"
          >
            Connexion
          </a>
          <Link
            href="/demo"
            className="mt-3 flex items-center justify-center rounded bg-iris px-5 py-3.5 text-[15px] font-medium text-white hover:bg-iris-hover"
            onClick={() => setMobileOpen(false)}
          >
            Testez sur un de vos AO
          </Link>
        </div>
      )}
    </>
  );
}

function NavDropdown({
  label,
  align,
  linkClass,
  visibilityClass,
  children,
}: {
  label: string;
  align: "center" | "right";
  linkClass: string;
  visibilityClass: string;
  children: React.ReactNode;
}) {
  const alignClass = align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div className="group relative">
      <button type="button" aria-haspopup="true" className={navTriggerClass(linkClass)}>
        {label}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180">
          <path d="m6 9.5 6 6 6-6" />
        </svg>
      </button>
      <div
        className={`invisible absolute top-full translate-y-1 pt-3 opacity-0 transition-all duration-200 ${visibilityClass} ${alignClass}`}
      >
        {children}
      </div>
    </div>
  );
}
