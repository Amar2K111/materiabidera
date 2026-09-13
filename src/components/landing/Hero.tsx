import { CalendlyDemoLink } from "./CalendlyDemoLink";
import { DemoAccessButton } from "./DemoAccessButton";
import { HeroVisual } from "./HeroVisual";

const CHECKS = [
  "Analyse de DCE",
  "Exigences tracées",
  "Mémoire technique",
  "Export Word et PDF",
] as const;

function HeroCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="hero-check-icon"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 10-10" />
    </svg>
  );
}

/**
 * Section d'ouverture — capture dashboard MateriaBTP (style AutogenAI).
 */
export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg__grid" />
      </div>
      <div className="hero-inner">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              Transformez vos appels d’offres en{" "}
              <span className="hero-h1-soft">réponses gagnantes</span>
            </h1>

            <p className="hero-lead">
              Conçu pour les entreprises du BTP qui répondent aux appels
              d’offres. MateriaBTP analyse vos DCE, valorise votre savoir-faire
              et vous accompagne jusqu’au mémoire technique vérifié.
            </p>

            <ul className="hero-checks">
              {CHECKS.map((item) => (
                <li key={item}>
                  <HeroCheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="hero-cta-row">
              <CalendlyDemoLink className="btn btn--primary hero-cta-desktop">
                Réserver une démo
              </CalendlyDemoLink>
              <DemoAccessButton className="btn btn--ghost hero-cta-desktop" />
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>
      <div className="hero-mobile-cta">
        <CalendlyDemoLink className="btn btn--primary hero-cta-mobile">
          Réserver une démo
        </CalendlyDemoLink>
        <DemoAccessButton className="btn btn--ghost hero-cta-mobile" />
      </div>
    </section>
  );
}
