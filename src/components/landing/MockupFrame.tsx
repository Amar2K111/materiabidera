import type { ReactNode } from "react";

/**
 * Cadre commun des mockups produit ("Réhabilitation d'un groupe scolaire" etc.).
 *
 * Factorise la barre superieure (marque BIDERA, fil d'ariane, tags de droite)
 * et le pied optionnel, repetes a l'identique dans chaque section de la page
 * marketing. Le corps reste libre : chaque mockup a un contenu different
 * (barre laterale ou non, tableaux, listes).
 *
 * L'ensemble est traite comme une seule image decrite par role="img" et
 * aria-label : c'est une illustration marketing, pas une vraie interface, et
 * elle ne doit jamais etre parcourue element par element par un lecteur
 * d'ecran (section 8 du cahier des charges).
 */
export function MockupFrame({
  ariaLabel,
  crumb,
  right,
  flat = false,
  foot,
  children,
}: {
  ariaLabel: string;
  crumb: ReactNode;
  right?: ReactNode;
  flat?: boolean;
  foot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={flat ? "ui ui--flat" : "ui"} role="img" aria-label={ariaLabel}>
      <div className="ui-top">
        <div className="ui-top-l">
          <span className="ui-brand">
            <i />
            BIDERA
          </span>
          <span className="ui-crumb">{crumb}</span>
        </div>
        {right ? <div className="ui-top-r">{right}</div> : null}
      </div>

      {children}

      {foot ? <div className="ui-foot">{foot}</div> : null}
    </div>
  );
}
