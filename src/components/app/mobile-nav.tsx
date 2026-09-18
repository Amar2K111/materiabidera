"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { SidebarNav } from "@/components/app/sidebar";

/** Navigation repliable sous la largeur bureau (section 28). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Le menu se referme des qu'une page est ouverte (ajustement pendant le
  // rendu, sans effet ni rendu supplementaire).
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }

  // Menu ouvert : le focus entre dans le menu, Echap le referme, et la page
  // derriere ne defile plus sous le doigt.
  useEffect(() => {
    if (!open) return;
    drawerRef.current?.querySelector<HTMLElement>("a")?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close(false) : setOpen(true))}
        aria-expanded={open}
        aria-controls="app-mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-70"
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.8} />
        ) : (
          <Menu className="h-4 w-4" strokeWidth={1.8} />
        )}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-ink/30"
            onClick={() => close(true)}
            aria-hidden
          />
          <div
            ref={drawerRef}
            id="app-mobile-menu"
            className="app-ui__mobile-drawer fixed inset-x-0 top-14 z-50 p-3"
          >
            <Link href="/app/dossiers/nouveau" className="app-ui__sidebar-cta">
              <Plus strokeWidth={2.2} aria-hidden />
              Nouveau dossier
            </Link>
            <SidebarNav />
          </div>
        </>
      ) : null}
    </div>
  );
}
