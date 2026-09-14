/**
 * Rapprochement des exigences entre deux analyses d'un meme dossier.
 *
 * Relancer l'analyse ne doit pas detruire le travail fait sur les exigences :
 * statut fixe par l'utilisateur, reponse saisie, rattachement aux chapitres,
 * couverture constatee. D'une analyse a l'autre, le moteur reformule souvent
 * une exigence, la decoupe en deux ou en fusionne deux : l'egalite du texte ne
 * suffit donc pas. Trois signaux sont combines :
 *   - le vocabulaire partage (coefficient de Dice) ;
 *   - l'inclusion (une exigence decoupee reste contenue dans l'ancienne) ;
 *   - le passage du DCE cite (meme document, meme page).
 *
 * Module pur, sans dependance.
 */

import { tokenize } from "./relevance.ts";

export type MatchableRequirement = {
  text: string;
  category: string;
  /** Passages cites, du type "documentId|page". Facultatif. */
  anchors?: string[];
};

/** Vocabulaire partage suffisant pour conclure a la meme exigence. */
export const MATCH_THRESHOLD = 0.55;
/** Une exigence presque entierement contenue dans l'autre : decoupage. */
export const CONTAINMENT_THRESHOLD = 0.75;
/** Avec le meme passage du DCE cite, un rapprochement plus lache suffit. */
export const ANCHORED_THRESHOLD = 0.3;
/**
 * Proximite de sens au-dela de laquelle deux formulations tres differentes
 * designent la meme exigence ("les variantes ne sont pas autorisees" et
 * "l'offre ne doit pas comporter de variantes"). Echelle observee sur des
 * exigences BTP : ~0,80 pour des exigences distinctes, 0,85 et plus pour une
 * meme exigence reformulee.
 */
export const SEMANTIC_MATCH_THRESHOLD = 0.85;
/** Un minimum de vocabulaire commun reste exige pour un rapprochement par le sens. */
export const SEMANTIC_MIN_OVERLAP = 0.2;

function terms(text: string): Set<string> {
  return new Set(tokenize(text));
}

function shared(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

/** Coefficient de Dice sur les termes normalises (0 : rien en commun, 1 : identiques). */
export function similarity(a: string, b: string): number {
  const left = terms(a);
  const right = terms(b);
  if (left.size === 0 || right.size === 0) return 0;
  return (2 * shared(left, right)) / (left.size + right.size);
}

/** Part du texte le plus court reprise par l'autre (0 a 1). */
export function containment(a: string, b: string): number {
  const left = terms(a);
  const right = terms(b);
  if (left.size === 0 || right.size === 0) return 0;
  return shared(left, right) / Math.min(left.size, right.size);
}

/**
 * Associe chaque nouvelle exigence a au plus une exigence precedente.
 *
 * Les paires sont retenues de la plus proche a la moins proche, chaque exigence
 * ne servant qu'une fois. Une categorie identique et un passage du DCE commun
 * departagent, sans jamais suffire a eux seuls.
 *
 * Retourne, pour chaque indice de `next`, l'indice apparie dans `previous`.
 */
export function matchRequirements(
  previous: MatchableRequirement[],
  next: MatchableRequirement[],
  options: {
    threshold?: number;
    /** Proximite de sens entre une exigence precedente et une nouvelle, si disponible. */
    semantic?: (previousIndex: number, nextIndex: number) => number;
  } = {},
): Map<number, number> {
  const threshold = options.threshold ?? MATCH_THRESHOLD;
  const pairs: Array<{ prev: number; next: number; score: number }> = [];

  next.forEach((candidate, nextIndex) => {
    previous.forEach((existing, prevIndex) => {
      const dice = similarity(candidate.text, existing.text);
      const inclusion = containment(candidate.text, existing.text);
      const sameAnchor = (candidate.anchors ?? []).some((a) =>
        (existing.anchors ?? []).includes(a),
      );
      const meaning = options.semantic?.(prevIndex, nextIndex) ?? 0;

      const eligible =
        dice >= threshold ||
        inclusion >= CONTAINMENT_THRESHOLD ||
        (sameAnchor && dice >= ANCHORED_THRESHOLD) ||
        // Le sens ne suffit jamais seul : deux exigences distinctes d'un meme
        // dossier se ressemblent beaucoup.
        (meaning >= SEMANTIC_MATCH_THRESHOLD && dice >= SEMANTIC_MIN_OVERLAP);
      if (!eligible) return;

      pairs.push({
        prev: prevIndex,
        next: nextIndex,
        score:
          dice +
          0.15 * inclusion +
          Math.max(0, meaning - SEMANTIC_MATCH_THRESHOLD) * 2 +
          (sameAnchor ? 0.1 : 0) +
          (candidate.category === existing.category ? 0.05 : 0),
      });
    });
  });

  pairs.sort((x, y) => y.score - x.score);
  const usedPrev = new Set<number>();
  const result = new Map<number, number>();
  for (const pair of pairs) {
    if (usedPrev.has(pair.prev) || result.has(pair.next)) continue;
    usedPrev.add(pair.prev);
    result.set(pair.next, pair.prev);
  }
  return result;
}
