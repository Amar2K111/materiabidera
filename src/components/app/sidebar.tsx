"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Library,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/dossiers", label: "Dossiers", icon: FolderKanban },
  { href: "/app/base-entreprise", label: "Base entreprise", icon: Building2 },
  { href: "/app/bibliotheque", label: "Bibliotheque", icon: Library },
  { href: "/app/parametres", label: "Parametres", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Navigation principale">
      {NAV.map(({ href, label, icon: Icon }) => {
        // "/app" ne doit pas rester actif sur les sous-sections.
        const active =
          href === "/app" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold transition-colors",
              active
                ? "bg-brand-wash text-brand"
                : "text-ink-58 hover:bg-paper hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 flex-none" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
