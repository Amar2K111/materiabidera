"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Colonne vertebrale d'un dossier (section 5).
 *
 * Chaque etape affiche son etat reel : a faire, terminee, ou a surveiller.
 * L'utilisateur voit ou il en est et ce qui reste, sans ouvrir chaque page.
 */
export const PROJECT_SECTIONS = [
  { segment: "", label: "Synthèse" },
  { segment: "documents", label: "DCE" },
  { segment: "analyse", label: "Analyse" },
  { segment: "go-no-go", label: "Go / No-Go" },
  { segment: "exigences", label: "Exigences" },
  { segment: "strategie", label: "Stratégie" },
  { segment: "memoire", label: "Mémoire" },
  { segment: "controle", label: "Contrôle" },
  { segment: "checklist", label: "Checklist" },
  { segment: "export", label: "Export" },
] as const;

export type StepSegment = (typeof PROJECT_SECTIONS)[number]["segment"];

export type StepState = {
  state: "todo" | "done" | "warn";
  /** Compteur discret affiche a cote du libelle, par exemple "16/19". */
  count?: string;
  /** Explication au survol. */
  hint?: string;
};

export function ProjectNav({
  projectId,
  steps,
}: {
  projectId: string;
  steps: Partial<Record<StepSegment, StepState>>;
}) {
  const pathname = usePathname();
  const base = `/app/dossiers/${projectId}`;

  return (
    <nav className="app-ui__steps" aria-label="Étapes du dossier">
      <ol className="app-ui__steps-list">
        {PROJECT_SECTIONS.map(({ segment, label }, index) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = pathname === href;
          const step = steps[segment];

          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={step?.hint}
                className={cn("app-ui__step", active && "is-active")}
              >
                {segment === "" ? (
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                ) : (
                  <span
                    className={cn(
                      "app-ui__step-dot",
                      step?.state === "done" && "is-done",
                      step?.state === "warn" && "is-warn",
                    )}
                    aria-hidden
                  >
                    {step?.state === "done" ? (
                      <Check />
                    ) : step?.state === "warn" ? (
                      "!"
                    ) : (
                      index
                    )}
                  </span>
                )}
                {label}
                {step?.count ? (
                  <span className="app-ui__step-count">{step.count}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
