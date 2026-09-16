/**
 * Structure d'un chapitre pour la mise en page des exports.
 *
 * Le texte d'un chapitre reste un texte simple, editable dans l'application.
 * Quelques conventions legeres y sont reconnues :
 *   - "## Titre" devient un sous-titre (niveau 2), "### Titre" un niveau 3 ;
 *   - des lignes commencant par "- " forment une liste a puces ;
 *   - "**mot**" est mis en gras ;
 *   - des lignes "| a | b |" suivies de "|---|---|" forment un tableau ;
 *   - une ligne "> **Titre** : texte" forme un encadre.
 * Tout le reste est un paragraphe. Word et PDF partagent cette lecture : les
 * deux documents ont exactement la meme structure.
 *
 * Module pur, sans dependance.
 */

export type Run = { text: string; bold: boolean };

export type Block =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
      /** Numero affiche ("2.1"), attribue par le modele documentaire. */
      number?: string;
    }
  | { type: "paragraph"; runs: Run[] }
  | { type: "bullets"; items: Run[][] }
  /** Tableau "| a | b |" : premiere ligne en en-tete, colonnes egalisees. */
  | { type: "table"; header: Run[][]; rows: Run[][][] }
  /** Encadre : information que l'evaluateur doit retenir. */
  | { type: "callout"; title: string | null; runs: Run[] };

const TABLE_ROW = /^\|.*\|$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function splitCells(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * Un tableau n'est reconnu qu'avec sa ligne de separation ("|---|---|") :
 * une simple ligne contenant des barres reste un paragraphe.
 */
function toTable(lines: string[]): Block | null {
  if (lines.length < 2 || !TABLE_SEPARATOR.test(lines[1])) return null;
  const header = splitCells(lines[0]);
  const width = header.length;
  if (width < 2) return null;
  const rows = lines.slice(2).map((line) => {
    const cells = splitCells(line).slice(0, width);
    while (cells.length < width) cells.push("");
    return cells.map((cell) => parseRuns(cell));
  });
  return { type: "table", header: header.map((cell) => parseRuns(cell)), rows };
}

/** Decoupe "**gras**" en segments ; un marqueur orphelin est simplement retire. */
export function parseRuns(text: string): Run[] {
  const runs: Run[] = [];
  const parts = text.split("**");
  // Un nombre pair de segments signifie un "**" non ferme : pas de gras.
  const balanced = parts.length % 2 === 1;
  parts.forEach((part, index) => {
    if (!part) return;
    runs.push({ text: part, bold: balanced && index % 2 === 1 });
  });
  return runs.length > 0 ? runs : [{ text: text.replace(/\*\*/g, ""), bold: false }];
}

/** "> **Titre** : texte" -> titre et texte ; sans titre en gras, texte seul. */
function toCallout(text: string): Block {
  const match = text.match(/^\*\*(.+?)\*\*\s*[:—–-]?\s*(.*)$/);
  if (match) {
    const body = match[2].trim();
    return {
      type: "callout",
      title: match[1].trim().replace(/[:.]$/, ""),
      runs: parseRuns(body.charAt(0).toUpperCase() + body.slice(1)),
    };
  }
  return { type: "callout", title: null, runs: parseRuns(text) };
}

const BULLET = /^\s*(?:[-•*]|\d+[.)])\s+/;
const HEADING = /^\s*(#{2,4})\s+/;
const CALLOUT = /^\s*>\s?/;

export function parseBlocks(content: string | null): Block[] {
  const text = (content ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let bullets: Run[][] = [];
  let callout: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", runs: parseRuns(paragraph.join(" ")) });
      paragraph = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length > 0) {
      blocks.push({ type: "bullets", items: bullets });
      bullets = [];
    }
  };
  const flushCallout = () => {
    if (callout.length > 0) {
      const joined = callout.join(" ").trim();
      if (joined) blocks.push(toCallout(joined));
      callout = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushCallout();
  };

  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (TABLE_ROW.test(line)) {
      const tableLines: string[] = [];
      let end = index;
      while (end < lines.length && TABLE_ROW.test(lines[end].trim())) {
        tableLines.push(lines[end].trim());
        end += 1;
      }
      const table = toTable(tableLines);
      if (table) {
        flushAll();
        blocks.push(table);
        index = end - 1;
        continue;
      }
    }

    if (!line) {
      flushAll();
      continue;
    }

    if (CALLOUT.test(line)) {
      flushParagraph();
      flushBullets();
      callout.push(line.replace(CALLOUT, ""));
      continue;
    }
    flushCallout();

    const heading = line.match(HEADING);
    if (heading) {
      flushParagraph();
      flushBullets();
      blocks.push({
        type: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: line.replace(HEADING, "").replace(/\*\*/g, "").trim(),
      });
      continue;
    }

    if (BULLET.test(line)) {
      flushParagraph();
      bullets.push(parseRuns(line.replace(BULLET, "")));
      continue;
    }

    // Une ligne qui suit une puce sans ligne vide prolonge cette puce.
    if (bullets.length > 0) {
      const last = bullets[bullets.length - 1];
      last.push({ text: ` ${line}`, bold: false });
      continue;
    }

    paragraph.push(line);
  }

  flushAll();
  return blocks;
}
