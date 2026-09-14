/**
 * Selection hybride des preuves : vocabulaire commun (BM25) et proximite de
 * sens (vecteurs d'embedding).
 *
 * Le vocabulaire seul manque les preuves formulees autrement ("plan de
 * prevention, separation des flux" pour une attente sur "la securite des
 * eleves en site occupe"). Le sens seul peut remonter un texte vaguement
 * voisin. On combine donc les deux, et l'on retombe exactement sur la
 * selection lexicale quand aucun vecteur n'est disponible.
 *
 * Module pur, sans dependance.
 */

import { rankByRelevance, type RankableItem, type RankedItem } from "./relevance.ts";

/**
 * Echelle observee pour gemini-embedding-001 (768 dimensions) sur des textes
 * BTP en francais : ~0,55 sans rapport, ~0,65 voisin, 0,72 et plus pertinent.
 */
export const SEMANTIC_FLOOR = 0.55;
export const SEMANTIC_CEIL = 0.8;
/** Proximite de sens a partir de laquelle un passage est retenu sans mot commun. */
export const SEMANTIC_MIN = 0.66;

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

/** Ramene une similarite cosinus sur 0..1 selon l'echelle observee. */
export function semanticStrength(similarity: number): number {
  const value = (similarity - SEMANTIC_FLOOR) / (SEMANTIC_CEIL - SEMANTIC_FLOOR);
  return Math.max(0, Math.min(1, value));
}

/**
 * Meilleure similarite de chaque element avec l'une des requetes : un chapitre
 * ou un memoire entier se decrit mieux par plusieurs textes que par un seul.
 */
export function bestSimilarities(
  queryVectors: ArrayLike<number>[],
  itemVectors: Map<string, ArrayLike<number>>,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const [id, vector] of itemVectors) {
    let best = -1;
    for (const query of queryVectors) best = Math.max(best, cosine(query, vector));
    result.set(id, best);
  }
  return result;
}

export type HybridOptions = {
  limit: number;
  /** Une base plus petite que ce seuil est transmise en entier. */
  keepAllBelow?: number;
  /** Score lexical minimal (exclusif) pour retenir un element sans appui du sens. */
  minScore?: number;
  /** Similarite minimale pour retenir un element sans appui du vocabulaire. */
  minSimilarity?: number;
};

/**
 * Classe et filtre les elements.
 *
 * Sans similarites : resultat identique a `selectEvidence` (BM25 seul).
 * Avec similarites : score = 40 % vocabulaire normalise + 60 % sens ; un
 * element est retenu si l'un des deux signaux est suffisant.
 */
export function selectHybrid<T extends RankableItem>(
  query: string,
  items: T[],
  similarities: Map<string, number> | null,
  options: HybridOptions,
): Array<RankedItem<T> & { lexical: number; similarity: number | null }> {
  const lexical = rankByRelevance(query, items);
  const minScore = options.minScore ?? 0;

  if (!similarities || similarities.size === 0) {
    const ranked = lexical.map((item) => ({ ...item, lexical: item.score, similarity: null }));
    if (items.length <= (options.keepAllBelow ?? 0)) return ranked;
    return ranked.filter((item) => item.score > minScore).slice(0, options.limit);
  }

  const maxLexical = lexical.reduce((max, item) => Math.max(max, item.score), 0);
  const minSimilarity = options.minSimilarity ?? SEMANTIC_MIN;

  const ranked = lexical
    .map((item) => {
      const similarity = similarities.get(item.id) ?? null;
      const lexicalPart = maxLexical > 0 ? item.score / maxLexical : 0;
      const semanticPart = similarity === null ? 0 : semanticStrength(similarity);
      return {
        ...item,
        lexical: item.score,
        similarity,
        score: 0.4 * lexicalPart + 0.6 * semanticPart,
      };
    })
    .sort((a, b) => b.score - a.score);

  if (items.length <= (options.keepAllBelow ?? 0)) return ranked;
  return ranked
    .filter(
      (item) =>
        item.lexical > minScore || (item.similarity !== null && item.similarity >= minSimilarity),
    )
    .slice(0, options.limit);
}
