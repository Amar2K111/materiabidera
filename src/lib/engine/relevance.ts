/**
 * Pertinence lexicale entre une attente (chapitre, exigence) et des preuves.
 *
 * Module pur, sans dependance : il sert a choisir quelles fiches de la base
 * entreprise et quels passages du DCE transmettre au moteur de redaction, au
 * lieu de tout envoyer. C'est un classement BM25 sur des termes normalises,
 * suffisant pour des bases de quelques centaines d'elements et reproductible.
 */

const STOPWORDS = new Set(
  (
    "a au aux avec ce ces cet cette dans de des du elle en et est etre il ils " +
    "la le les leur leurs lui ma mais me meme mes moi mon ne nos notre nous on " +
    "ou par pas pour qu que qui sa se ses son sont sur ta te tes toi ton tu un " +
    "une vos votre vous y d l n s c j m t qu lors ainsi afin selon sans sous " +
    "entre tout tous toute toutes chaque plus moins tres bien fait faire etc " +
    "sera seront doit doivent devra devront peut peuvent ete avoir ont"
  ).split(" "),
);

/** Termes normalises : minuscules, sans accents, sans mots vides, racines courtes. */
export function tokenize(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    // Racine grossiere : "securisation", "securiser", "securite" se rejoignent.
    .map((t) => (t.length > 6 ? t.slice(0, 6) : t));
}

export type RankableItem = {
  id: string;
  text: string;
};

export type RankedItem<T extends RankableItem> = T & { score: number };

/**
 * Classe les elements par pertinence decroissante par rapport a la requete.
 * Un element sans aucun terme commun obtient un score nul.
 */
export function rankByRelevance<T extends RankableItem>(
  query: string,
  items: T[],
): RankedItem<T>[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || items.length === 0) {
    return items.map((item) => ({ ...item, score: 0 }));
  }

  const docs = items.map((item) => tokenize(item.text));
  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / docs.length || 1;

  // Frequence documentaire de chaque terme de la requete.
  const df = new Map<string, number>();
  for (const term of queryTerms) {
    df.set(term, docs.filter((d) => d.includes(term)).length);
  }

  const k1 = 1.2;
  const b = 0.75;
  const n = docs.length;

  return items
    .map((item, index) => {
      const doc = docs[index];
      const counts = new Map<string, number>();
      for (const t of doc) counts.set(t, (counts.get(t) ?? 0) + 1);

      let score = 0;
      for (const term of queryTerms) {
        const tf = counts.get(term) ?? 0;
        if (tf === 0) continue;
        const idf = Math.log(1 + (n - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avgLength));
      }
      return { ...item, score };
    })
    .sort((x, y) => y.score - x.score);
}

/**
 * Selection des preuves a transmettre.
 *
 * On garde les elements pertinents dans la limite fixee. Une petite base est
 * transmise en entier : la trier n'apporterait rien et pourrait ecarter une
 * preuve utile que le vocabulaire ne rapproche pas.
 */
export function selectEvidence<T extends RankableItem>(
  query: string,
  items: T[],
  options: { limit: number; keepAllBelow?: number; minScore?: number },
): RankedItem<T>[] {
  const ranked = rankByRelevance(query, items);
  if (items.length <= (options.keepAllBelow ?? 0)) return ranked;
  const minScore = options.minScore ?? 0;
  return ranked.filter((item) => item.score > minScore).slice(0, options.limit);
}
