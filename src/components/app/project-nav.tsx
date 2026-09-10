"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Colonne vertebrale d'un dossier (section 5).
 *
 * Un onglet dont la brique n'est pas encore en service reste visible mais
 * inactif : l'utilisateur voit le parcours complet sans jamais tomber sur une
 * page vide ou une fonction simulee.
 */
export const PROJECT_SECTIONS = [
  { segment: "", label: "Vue d'ensemble", enabled: true },
  { segment: "documents", label: "Documents", enabled: true },
  { segment: "analyse", label: "Analyse", enabled: true },
  { segment: "go-no-go", label: "Go / No-Go", enabled: true },
  { segment: "exigences", label: "Exigences", enabled: true },
  { segment: "strategie", label: "Strategie", enabled: true },
  { segment: "memoire", label: "Memoire technique", enabled: true },
  { segment: "controle", label: "Controle qualite", enabled: true },
  { segment: "checklist", label: "Checklist", enabled: true },
  { segment: "export", label: "Export", enabled: true },
] as const;

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/app/dossiers/${projectId}`;

  return (
    <nav
      className="-mx-4 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
      aria-label="Sections du dossier"
    >
      <ul className="flex min-w-max gap-1">
        {PROJECT_SECTIONS.map(({ segment, label, enabled }) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = pathname === href;

          if (!enabled) {
            return (
              <li key={label}>
                <span
                  className="block cursor-not-allowed px-3 py-2.5 text-[13px] font-semibold text-ink-42/60"
                  title="Cette etape n'est pas encore en service"
                >
                  {label}
                </span>
              </li>
            );
          }

          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-58 hover:text-ink",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
