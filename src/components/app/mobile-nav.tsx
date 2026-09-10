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
        className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-line"
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.8} />
        ) : (
          <Menu className="h-4 w-4" strokeWidth={1.8} />
        )}
      </button>

      {open ? (
        <div
          className="absolute inset-x-0 top-14 z-40 border-b border-line bg-white p-3 shadow-card"
          onClick={() => setOpen(false)}
        >
          <SidebarNav />
        </div>
      ) : null}
    </div>
  );
}
