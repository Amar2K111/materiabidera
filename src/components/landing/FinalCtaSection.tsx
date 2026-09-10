import { CalendlyDemoLink } from "./CalendlyDemoLink";

export function FinalCtaSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="final rv">
          <div className="final-grid">
            <div>
              <h2>Votre prochain DCE mérite mieux qu’un copier-coller.</h2>
              <p>
                Analysez-le avec BIDERA et transformez-le en une réponse
                structurée, personnalisée et vérifiée.
              </p>
              <div className="btn-row">
                <CalendlyDemoLink className="btn btn--onink">
                  Réserver une démo
                </CalendlyDemoLink>
                <button type="button" className="btn btn--ghost btn-calendly">
                  Demander une démonstration
                </button>
              </div>
            </div>
            <ul className="final-list">
              <li>
                <i aria-hidden="true" />
                Démonstration sur un de vos dossiers réels
              </li>
              <li>
                <i aria-hidden="true" />
                30 minutes, sans installation
              </li>
              <li>
                <i aria-hidden="true" />
                Réponses écrites sur la sécurité et les données
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
