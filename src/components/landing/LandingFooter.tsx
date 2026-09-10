import { BrandLogo } from "@/components/brand/BrandLogo";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand">
              <BrandLogo height={26} />
            </div>
            <p className="foot-tag">
              L’IA des appels d’offres BTP, du DCE au mémoire technique exporté.
            </p>
          </div>
          <div>
            <h4>Produit</h4>
            <ul className="foot-l">
              <li>Analyse DCE</li>
              <li>Go / No-Go</li>
              <li>Exigences</li>
              <li>Base entreprise</li>
              <li>Mémoire technique</li>
              <li>Contrôle et checklist</li>
            </ul>
          </div>
          <div>
            <h4>Entreprise</h4>
            <ul className="foot-l">
              <li>À propos</li>
              <li>Sécurité</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4>Ressources</h4>
            <ul className="foot-l">
              <li>FAQ</li>
              <li>Documentation</li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© {year} MateriaBTP. Tous droits réservés.</span>
          <span>[EMAIL] · [ADRESSE] · [SIREN] · [MENTIONS LÉGALES]</span>
        </div>
      </div>
    </footer>
  );
}
