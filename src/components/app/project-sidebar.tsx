"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  CircleCheck,
  ListChecks,
  Target,
  BookMarked,
  ShieldCheck,
  CheckSquare,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PROJECT_SECTIONS } from "@/components/app/project-nav";

const ICONS = {
  "": LayoutDashboard,
  documents: FileText,
  analyse: ScanSearch,
  "go-no-go": CircleCheck,
  exigences: ListChecks,
  strategie: Target,
  memoire: BookMarked,
  controle: ShieldCheck,
  checklist: CheckSquare,
  export: Download,
} as const;

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/app/dossiers/${projectId}`;

  return (
    <aside className="app-ui__project-side" aria-label="Sections du dossier">
      <p className="app-ui__nav-label">Dossier</p>
      <nav className="app-ui__nav">
        {PROJECT_SECTIONS.map(({ segment, label, enabled }) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = pathname === href;
          const Icon = ICONS[segment as keyof typeof ICONS] ?? LayoutDashboard;

          if (!enabled) {
            return (
              <span
                key={label}
                className="app-ui__nav-link cursor-not-allowed opacity-45"
                title="Cette etape n'est pas encore en service"
              >
                <Icon />
                {label}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("app-ui__nav-link", active && "is-active")}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
