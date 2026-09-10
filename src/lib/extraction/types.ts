/**
 * Unite de texte extraite d'un document, avec de quoi citer sa provenance.
 *
 * Le PDF est le seul format reellement pagine. Pour les autres, pageNumber
 * reste nul et le libelle porte l'information utile (nom de feuille, section).
 * On ne fabrique jamais un numero de page qui n'existe pas.
 */
export type ExtractedUnit = {
  pageNumber: number | null;
  label: string;
  text: string;
};

export type ExtractionResult = {
  units: ExtractedUnit[];
  /** Nombre de pages du document, quand la notion existe. */
  pageCount: number | null;
  /**
   * Vrai lorsque le fichier est lisible mais ne contient aucun texte
   * selectionnable : document scarne, donc a traiter par reconnaissance
   * optique avant toute analyse.
   */
  needsOcr: boolean;
};

export class ExtractionError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}
