/**
 * Retire les identifiants d'extraits du texte redige par le moteur.
 *
 * Le moteur ne manipule que des identifiants courts (E3, R12, C4, K1, V2, S1).
 * Ils servent a rattacher les sources et n'ont aucun sens pour un lecteur :
 * ils ne doivent apparaitre ni a l'ecran, ni dans le document remis a
 * l'acheteur. Les sources, elles, restent affichees a part.
 *
 * Module sans dependance serveur : utilisable a l'affichage comme a l'export.
 */

const CITATION_ID = /^[CEKRSV]\d{1,3}$/;

/** Normes et recommandations courantes qui ressemblent a un identifiant. */
const LOOKALIKES = new Set(["R408", "R457", "R486", "R489", "R490"]);

/** Intitules de rubriques que le moteur cite parfois comme une source. */
const RUBRIC_LABELS = new Set([
  "objet",
  "acheteur",
  "lot",
  "montant",
  "duree",
  "visite de site",
  "variantes",
  "presentation",
  "presentation de l'entreprise",
  "base entreprise",
]);

function normalize(token: string) {
  return token
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/’/g, "'")
    .toLowerCase()
    .trim();
}

function isId(token: string) {
  return CITATION_ID.test(token) && !LOOKALIKES.has(token);
}

export function stripCitationCodes(text: string): string;
export function stripCitationCodes(text: string | null): string | null;
export function stripCitationCodes(
  text: string | null | undefined,
): string | null | undefined;
export function stripCitationCodes(text: string | null | undefined) {
  if (!text) return text;

  let out = text;

  // Deux passes : "([R16])" se resout en "()" puis disparait.
  for (let pass = 0; pass < 2; pass += 1) {
    out = out.replace(
      /(\s*)([[(])([^[\]()]{1,160})([\])])/g,
      (match, _lead: string, open: string, inner: string) => {
        const tokens = inner
          .split(/[,;]/)
          .map((t) => t.trim())
          .filter(Boolean);
        if (tokens.length === 0) return match;

        const isCitation = (t: string) =>
          isId(t) || RUBRIC_LABELS.has(normalize(t));
        const hasId = tokens.some(isId);
        const isSourceMention =
          tokens.length === 1 &&
          /presentation|base entreprise/.test(normalize(tokens[0])) &&
          RUBRIC_LABELS.has(normalize(tokens[0]));

        // Une parenthese ordinaire, sans identifiant, reste intacte.
        if (!hasId && !isSourceMention) return match;

        const kept = tokens.filter((t) => !isCitation(t));
        if (kept.length === 0) return "";

        const close = open === "[" ? "]" : ")";
        return `${_lead}${open}${kept.join(", ")}${close}`;
      },
    );
    out = out.replace(/\s*\(\s*\)|\s*\[\s*\]/g, "");
  }

  return out
    // Seuls le point et la virgule collent au mot : la typographie francaise
    // garde son espace avant ":", ";", "!" et "?".
    .replace(/[ \t]+([.,])/g, "$1")
    .replace(/[ \t]{2,}/g, " ");
}
