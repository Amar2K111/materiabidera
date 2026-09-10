/**
 * Elements communs a tous les prompts (section 33).
 *
 * Chaque prompt de BIDERA declare un role, un objectif, ses sources, ses
 * regles, son format de sortie, et l'interdiction d'inventer.
 */

/** Regles anti-invention, reprises telles quelles dans chaque prompt (section 21). */
export const NO_INVENTION_RULES = `REGLES ABSOLUES

1. Tu ne dois JAMAIS inventer une information. Ni chiffre, ni date, ni delai,
   ni montant, ni nom de client, ni reference de chantier, ni effectif, ni
   materiel, ni qualification, ni certification, ni resultat.
2. Tu ne rapportes que ce qui figure litteralement dans les extraits fournis.
3. Si une information demandee ne figure pas dans les extraits, tu ecris
   exactement : "Information non trouvee dans les sources disponibles."
   Tu ne proposes aucune valeur plausible a la place.
4. Tu ne deduis pas une information absente a partir d'usages du secteur.
5. Chaque affirmation que tu produis doit citer le ou les extraits qui la
   justifient, par leur identifiant.
6. Tu n'inventes jamais un identifiant d'extrait. Tu ne cites que des
   identifiants presents dans les extraits fournis.
7. Tu reponds en francais, dans le vocabulaire des marches publics et prives
   du batiment et des travaux publics.`;

/** Un extrait numerote, tel qu'il est presente au modele. */
export type Excerpt = {
  /** Identifiant court et stable, du type "E12". */
  id: string;
  /** Nom du fichier d'origine. */
  documentName: string;
  /** Libelle de l'emplacement, par exemple "page 18". */
  label: string;
  text: string;
};

/**
 * Met en forme les extraits transmis au modele.
 *
 * Le modele ne voit jamais un numero de page brut : il ne manipule que des
 * identifiants d'extraits, que l'application seule sait retraduire en
 * document et en page reels. Une citation ne peut donc pas etre fabriquee.
 */
export function renderExcerpts(excerpts: Excerpt[]): string {
  return excerpts
    .map(
      (e) =>
        `[${e.id}] ${e.documentName} — ${e.label}\n${e.text}`,
    )
    .join("\n\n---\n\n");
}

/** Budget de caracteres par extrait, pour rester dans la fenetre du modele. */
export const MAX_EXCERPT_CHARS = 6000;

/** Budget total de caracteres transmis en une passe. */
export const MAX_TOTAL_CHARS = 400_000;

/** Tronque un extrait trop long en signalant la coupure. */
export function clampExcerpt(text: string): string {
  if (text.length <= MAX_EXCERPT_CHARS) return text;
  return `${text.slice(0, MAX_EXCERPT_CHARS)}\n[extrait tronque]`;
}
