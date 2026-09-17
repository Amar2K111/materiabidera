"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
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
  },
  {
    href: "/app/dossiers",
    label: "Dossiers",
    icon: FolderOpen,
  },
  {
    href: "/app/base-entreprise",
    label: "Base entreprise",
    icon: Building2,
  },
  {
    href: "/app/bibliotheque",
    label: "Bibliothèque",
    icon: Library,
  },
  {
    href: "/app/parametres",
    label: "Paramètres",
    icon: Settings,
  },
] as const;

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="app-ui__nav" aria-label="Navigation principale">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/app" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "app-ui__nav-link",
              active && "is-active",
              collapsed && "is-collapsed",
            )}
          >
            <Icon />
            <span className="app-ui__sidebar-text">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
