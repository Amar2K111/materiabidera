/**
 * Decoupage d'un texte non pagine en passages citables.
 *
 * Un DOCX ou une feuille de tableur n'a pas de pages. Livre d'un bloc, un long
 * document serait tronque avant l'analyse et son contenu perdu. On le coupe
 * donc en passages de taille raisonnable, sur des fins de paragraphe ou de
 * ligne, sans jamais couper un mot.
 */

/** Taille cible d'un passage, sous le plafond d'un extrait transmis au moteur. */
export const PASSAGE_CHARS = 5000;

export function splitIntoPassages(text: string, separator: "\n\n" | "\n"): string[] {
  const blocks = text.split(separator).map((b) => b.trim()).filter(Boolean);
  const passages: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) passages.push(current.trim());
    current = "";
  };

  for (const block of blocks) {
    // Un bloc isole plus long qu'un passage est coupe sur des fins de phrase.
    if (block.length > PASSAGE_CHARS) {
      flush();
      let rest = block;
      while (rest.length > PASSAGE_CHARS) {
        const window = rest.slice(0, PASSAGE_CHARS);
        const cut = Math.max(window.lastIndexOf(". "), window.lastIndexOf(" "));
        const at = cut > PASSAGE_CHARS / 2 ? cut + 1 : PASSAGE_CHARS;
        passages.push(rest.slice(0, at).trim());
        rest = rest.slice(at);
      }
      current = rest;
      continue;
    }

    if (current.length + block.length + separator.length > PASSAGE_CHARS) flush();
    current = current ? `${current}${separator}${block}` : block;
  }
  flush();

  return passages;
}
