import { rankByRelevance, type RankableItem } from "./relevance.ts";
import { selectHybrid } from "./semantic.ts";

/**
 * Recherche dans la base entreprise (fiches et bibliotheque).
 *
 * Meme classement que celui qui choisit les preuves du memoire : vocabulaire
 * (BM25) et, quand il est disponible, sens (similarite des vecteurs). Ce que
 * l'utilisateur trouve ici est donc exactement ce que le moteur de redaction
 * peut mobiliser.
 */

export type SearchableItem = RankableItem & { label: string };

export type SearchHit<T extends SearchableItem> = T & {
  score: number;
  /** Score de vocabulaire (BM25) et proximite de sens, pour le classement. */
  lexical: number;
  similarity: number | null;
  /** Passage le plus proche de la question, pour juger sans ouvrir. */
  excerpt: string;
  /** Ce qui a fait remonter le resultat. */
  match: "sens" | "mots" | "sens et mots";
};

const EXCERPT_CHARS = 240;
const MIN_EXCERPT_CHARS = 40;

/**
 * Seuils propres a la recherche : l'utilisateur lit chaque resultat, le bruit
 * y coute plus cher que pour le choix des preuves, ou le modele trie ensuite.
 */
const SEARCH_MIN_SIMILARITY = 0.7;
const SEARCH_SIMILARITY_SPREAD = 0.04;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Passage le plus pertinent d'un texte : la ligne (ou phrase) qui partage le
 * plus de vocabulaire avec la requete, a defaut la premiere.
 */
export function bestExcerpt(query: string, text: string, label = ""): string {
  const title = normalize(label.replace(/^[^:]*:\s*/, ""));
  const all = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  // Une ligne qui redit le titre de la fiche ("Intitule : ...") n'apprend rien
  // de plus que le titre deja affiche au-dessus de l'extrait.
  const informative = all.filter(
    (p) => !title || normalize(p.replace(/^[^:]*:\s*/, "")) !== title,
  );
  const pieces = informative.length > 0 ? informative : all;
  if (pieces.length === 0) return "";

  const ranked = rankByRelevance(
    query,
    pieces.map((p, i) => ({ id: String(i), text: p })),
  ).filter((r) => r.score > 0);

  // Une ligne courte ("Intitule : Astreinte") ne fait que repeter le titre de
  // la fiche : on lui prefere un passage qui dit quelque chose.
  const substantial = (p: string) => p.length >= MIN_EXCERPT_CHARS;
  const pick =
    ranked.find((r) => substantial(pieces[Number(r.id)])) ??
    ranked[0] ??
    null;
  const best = pick
    ? pieces[Number(pick.id)]
    : (pieces.find(substantial) ?? pieces[0]);
  return best.length > EXCERPT_CHARS ? `${best.slice(0, EXCERPT_CHARS - 1).trimEnd()}…` : best;
}

export function searchItems<T extends SearchableItem>(
  query: string,
  items: T[],
  similarities: Map<string, number> | null,
  limit = 12,
): Array<SearchHit<T>> {
  if (query.trim().length === 0 || items.length === 0) return [];

  // Le libelle compte : chercher "ISO 9001" doit trouver la fiche du meme nom.
  const withLabel = items.map((item) => ({ ...item, text: `${item.label}\n${item.text}` }));

  const hybrid = selectHybrid(query, withLabel, similarities, {
    limit,
    minScore: 0,
    minSimilarity: SEARCH_MIN_SIMILARITY,
  });

  // Dans une base homogene (tout parle de chantier), la proximite de sens reste
  // elevee meme sans rapport reel : mesure faite, "Qualibat" rapprochait les
  // fiches Qualibat a 0,74 et une assurance a 0,69. Un resultat retenu par le
  // seul sens doit donc rester proche du meilleur resultat.
  const best = Math.max(0, ...hybrid.map((h) => h.similarity ?? 0));
  const ranked = hybrid.filter(
    (h) => h.lexical > 0 || (h.similarity ?? 0) >= best - SEARCH_SIMILARITY_SPREAD,
  );

  return ranked.map((hit) => {
    const original = items.find((i) => i.id === hit.id) as T;
    const lexical = hit.lexical > 0;
    const semantic = hit.similarity !== null && hit.similarity >= SEARCH_MIN_SIMILARITY;
    return {
      ...original,
      score: Math.round(hit.score * 100) / 100,
      lexical: hit.lexical,
      similarity: hit.similarity,
      excerpt: bestExcerpt(query, original.text, original.label),
      match: lexical && semantic ? "sens et mots" : semantic ? "sens" : "mots",
    };
  });
}
