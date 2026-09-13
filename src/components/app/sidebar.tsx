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
  {
    href: "/app",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    accent: "is-accent-blue",
  },
  {
    href: "/app/dossiers",
    label: "Dossiers AO",
    icon: FolderKanban,
    accent: "is-accent-blue",
  },
  {
    href: "/app/base-entreprise",
    label: "Base entreprise",
    icon: Building2,
    accent: "is-accent-purple",
  },
  {
    href: "/app/bibliotheque",
    label: "Bibliothèque",
    icon: Library,
    accent: "is-accent-teal",
  },
  {
    href: "/app/parametres",
    label: "Paramètres",
    icon: Settings,
    accent: "is-accent-blue",
  },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="app-ui__nav" aria-label="Navigation principale">
      {NAV.map(({ href, label, icon: Icon, accent }) => {
        const active =
          href === "/app" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "app-ui__nav-link",
              active && "is-active",
              active && accent,
            )}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
