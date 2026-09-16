/**
 * Charte documentaire du memoire technique (design tokens).
 *
 * Source unique de la mise en page : le rendu Word et le rendu PDF lisent ces
 * memes valeurs, pour que les deux fichiers soient deux formats du meme
 * document et ne derivent pas l'un de l'autre.
 *
 * Unites : points typographiques (pt) sauf mention contraire.
 * Module pur, sans dependance.
 */

export const COLORS = {
  /** Bleu nuit principal : titres, en-tetes de tableau. */
  navy: "0E2A47",
  /** Bleu secondaire : sous-titres, lot. */
  blue: "1F5A8A",
  /** Bleu tres clair : encadres, cellules de libelle. */
  sky: "EEF4F8",
  /** Bordure bleu-gris : cadre de page, filets de tableau. */
  border: "D7E4ED",
  /** Accent chaud, rare : filet de couverture. */
  accent: "D58A32",
  /** Texte secondaire : en-tete, pied de page, legendes. */
  muted: "5E6B75",
  /** Texte principal. */
  text: "1B1F23",
  white: "FFFFFF",
  /** Ligne alternee des tableaux. */
  rowAlt: "F8FAFC",
} as const;

/** Couleur au format "#RRGGBB" (rendu PDF). */
export const hex = (color: string) => `#${color}`;

export const FONTS = {
  /**
   * Word : polices Office standard, pour un document modifiable partout.
   * PDF : Inter, police libre embarquee au plus pres d'Aptos (qui n'est pas
   * redistribuable).
   */
  docx: { body: "Aptos", display: "Aptos Display" },
  pdf: { body: "Inter", display: "Inter" },
} as const;

export const SIZES = {
  body: 10,
  /** Interligne (multiple de la taille). */
  lineHeight: 1.08,
  /** Espace apres un paragraphe. */
  paragraphAfter: 5,

  coverTitle: 30,
  coverSubtitle: 17,
  coverCompany: 11,
  coverLabel: 8.5,
  coverValue: 10,

  h1: 17,
  h1Before: 10,
  h1After: 8,
  h2: 13,
  h2Before: 9,
  h2After: 4,
  h3: 11,
  h3Before: 7,
  h3After: 3,

  secondary: 8.5,
  header: 8,
  footer: 7.5,

  table: 8.5,
  tableHeader: 8.5,
  tableCellPaddingV: 3.5,
  tableCellPaddingH: 5,

  calloutTitle: 10.5,
  calloutText: 9.5,

  tocEntry: 10,
} as const;

/** Format de page par defaut (A4 portrait), marges en centimetres. */
export const PAGE = {
  widthPt: 595.28,
  heightPt: 841.89,
  marginTopCm: 1.7,
  marginBottomCm: 1.7,
  marginLeftCm: 1.8,
  marginRightCm: 1.8,
  /** Position de l'en-tete et du pied de page depuis le bord. */
  headerFromEdgeCm: 0.95,
  footerFromEdgeCm: 0.95,
  /** Distance du cadre de page au bord de la feuille. */
  borderFromEdgePt: 18,
  borderWidthPt: 0.5,
} as const;

export const cmToPt = (cm: number) => (cm * 72) / 2.54;
/** Word : 1 cm = 567 twips. */
export const cmToTwips = (cm: number) => Math.round(cm * 567);
/** Word : 1 pt = 20 twips. */
export const ptToTwips = (pt: number) => Math.round(pt * 20);
/** Word : taille de police en demi-points. */
export const ptToHalfPoints = (pt: number) => Math.round(pt * 2);

/** Largeur utile de la page, en points. */
export const CONTENT_WIDTH_PT =
  PAGE.widthPt - cmToPt(PAGE.marginLeftCm) - cmToPt(PAGE.marginRightCm);
