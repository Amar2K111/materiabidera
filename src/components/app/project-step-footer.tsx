"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { PROJECT_SECTIONS } from "@/components/app/project-nav";

function currentSectionIndex(pathname: string, base: string): number {
  for (let i = PROJECT_SECTIONS.length - 1; i >= 0; i -= 1) {
    const { segment } = PROJECT_SECTIONS[i];
    if (segment === "") {
      if (pathname === base) return i;
      continue;
    }
    const href = `${base}/${segment}`;
    if (pathname === href || pathname.startsWith(`${href}/`)) return i;
  }
  return -1;
}

/**
 * Passage a l'etape suivante, en fin de contenu (section 5).
 *
 * Deux regles tirees des tests : ne jamais recouvrir le contenu de l'etape, et
 * ne jamais envoyer sur une etape qui refusera de travailler. La cible est donc
 * l'action reellement faisable, calculee cote serveur par nextStepFor, et non
 * l'etape suivante dans l'ordre du plan.
 */
export function ProjectStepFooter({
  projectId,
  nextSegment,
  nextLabel,
}: {
  projectId: string;
  /** Segment de l'action recommandee pour ce dossier, dans son etat actuel. */
  nextSegment: string;
  /** Libelle d'action, par exemple "Analyser le DCE". */
  nextLabel: string;
}) {
  const pathname = usePathname();
  const base = `/app/dossiers/${projectId}`;
  const index = currentSectionIndex(pathname, base);
  if (index < 0) return null;

  const href = (segment: string) => (segment ? `${base}/${segment}` : base);
  const target = PROJECT_SECTIONS.findIndex((s) => s.segment === nextSegment);

  // L'action recommandee est en aval : c'est la suite naturelle du parcours.
  if (target > index) {
    return (
      <div className="app-ui__step-footer">
        <p className="app-ui__step-footer-hint">Étape suivante</p>
        <Link
          href={href(nextSegment)}
          className={buttonClass({ className: "app-ui__step-footer-btn" })}
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    );
  }

  // L'utilisateur a pris de l'avance : l'etape ouverte ne pourra pas aboutir
  // tant que l'action recommandee n'est pas faite. On ramene en arriere.
  if (target >= 0 && target < index) {
    return (
      <div className="app-ui__step-footer">
        <p className="app-ui__step-footer-hint">À faire avant de poursuivre</p>
        <Link
          href={href(nextSegment)}
          className={buttonClass({
            variant: "ghost",
            className: "app-ui__step-footer-btn",
          })}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {nextLabel}
        </Link>
      </div>
    );
  }

  // Le travail a faire est sur cette page meme. On annonce la suite sans y
  // envoyer : l'etape suivante afficherait un ecran vide.
  const after = PROJECT_SECTIONS[index + 1];
  if (!after) return null;

  return (
    <div className="app-ui__step-footer">
      <p className="app-ui__step-footer-hint">
        Ensuite : <b>{after.label}</b>, une fois cette étape terminée.
      </p>
    </div>
  );
}
