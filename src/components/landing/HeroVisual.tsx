import type { ReactNode } from "react";

const USER_PHOTO = "/images/hero-user.jpg";

const STEPS = [
  { label: "Analyse du dossier", pct: 100, tone: "ok" as const, status: "Terminé" },
  { label: "Exigences extraites", pct: 100, tone: "ok" as const, status: "Terminé" },
  { label: "Mémoire technique", pct: 64, tone: "warn" as const, status: "En cours" },
  { label: "Contrôle avant dépôt", pct: 0, tone: null, status: "À faire" },
];

/** Visuel hero : tablette horizontale + photo utilisateur + progression (style Tenderbolt). */
export function HeroVisual({ children }: { children: ReactNode }) {
  return (
    <figure
      className="hero-visual rv"
      aria-label="Professionnelle utilisant BIDERA sur tablette pour préparer une réponse à un appel d’offres BTP"
    >
      <div className="hero-tablet-wrap">
        <div className="hero-tablet">
          <div className="hero-tablet-display">{children}</div>
        </div>

        <div className="hero-user-photo">
          <img
            src={USER_PHOTO}
            loading="eager"
            decoding="async"
            alt="Responsable d’entreprise BTP travaillant sur son ordinateur avec BIDERA"
          />
        </div>

        <div className="hero-user-steps">
          <ul aria-hidden="true">
            {STEPS.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span>
                <div className={`hero-step-bar${step.tone ? ` ${step.tone}` : ""}`}>
                  <i style={{ width: `${step.pct}%` }} />
                </div>
                <em>{step.status}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
