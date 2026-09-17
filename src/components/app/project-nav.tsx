"use client";

import * as React from "react";
import Link, { useLinkStatus } from "next/link";
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

/**
 * Barre de progression du clic.
 *
 * Sur un dossier lourd, l'etape demandee met parfois une seconde a s'afficher.
 * Sans retour immediat, l'utilisateur reclique. Le trait sous l'etape indique
 * que la demande est partie.
 */
function StepPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="app-ui__step-wait" aria-hidden /> : null;
}

export function ProjectNav({
  projectId,
  steps,
}: {
  projectId: string;
  steps: Partial<Record<StepSegment, StepState>>;
}) {
  const pathname = usePathname();
  const base = `/app/dossiers/${projectId}`;
  const listRef = React.useRef<HTMLOListElement>(null);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  // Sous 1366 px la barre depasse l'ecran. On ne signale le defilement que
  // lorsqu'il reste vraiment des etapes a voir, et du bon cote : un degrade
  // permanent finit par etre ignore.
  const [edges, setEdges] = React.useState<"none" | "start" | "end" | "both">(
    "none",
  );

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const hidden = list.scrollWidth - list.clientWidth;
      if (hidden <= 1) return setEdges("none");
      const start = list.scrollLeft > 1;
      const end = list.scrollLeft < hidden - 1;
      setEdges(start && end ? "both" : start ? "start" : end ? "end" : "none");
    };

    measure();
    list.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  // L'etape ouverte doit rester visible, y compris apres un changement de page
  // depuis le bouton "Suivant" ou depuis une autre partie de l'ecran.
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav className="app-ui__steps" aria-label="Étapes du dossier">
      <ol ref={listRef} className="app-ui__steps-list" data-edges={edges}>
        {PROJECT_SECTIONS.map(({ segment, label }, index) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = pathname === href;
          const step = steps[segment];

          return (
            <li key={label}>
              <Link
                ref={active ? activeRef : undefined}
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
                <StepPending />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
