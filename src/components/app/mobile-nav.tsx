"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/app/sidebar";

/** Navigation repliable sous la largeur bureau (section 28). */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04] text-ink-58"
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.8} />
        ) : (
          <Menu className="h-4 w-4" strokeWidth={1.8} />
        )}
      </button>

      {open ? (
        <div
          className="app-ui__mobile-drawer absolute inset-x-0 top-14 z-40 p-3"
          onClick={() => setOpen(false)}
        >
          <SidebarNav />
        </div>
      ) : null}
    </div>
  );
}
