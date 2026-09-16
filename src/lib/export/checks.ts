import "server-only";
import type { MemoryDocument } from "./document";
import { readPdfPages, squash, tocEntries, type PageText } from "./pdf-text";

/**
 * Controle automatique d'un export avant de le declarer reussi.
 *
 * Le fichier est relu tel qu'il sera remis : pages blanches ou presque vides,
 * texte hors de la zone imprimable, en-tete et pagination, sommaire coherent,
 * contenu interne visible, limite de pages du DCE. Un fichier qui existe n'est
 * pas pour autant presentable a un acheteur.
 */

export type ExportCheck = {
  level: "error" | "warning" | "info";
  message: string;
};

export type ExportCheckReport = {
  /** Vrai si aucun defaut bloquant n'a ete releve. */
  ok: boolean;
  pages: number | null;
  items: ExportCheck[];
};

/** Traces internes ou techniques qui ne doivent jamais atteindre l'acheteur. */
const FORBIDDEN = [
  { pattern: /materia\s*btp/i, label: "mention « MateriaBTP »" },
  { pattern: /g[ée]n[ée]r[ée]\s+par\s+(l['’]\s*)?ia/i, label: "mention « généré par IA »" },
  { pattern: /document de d[ée]monstration/i, label: "mention « document de démonstration »" },
  { pattern: /\bundefined\b|\bNaN\b|\[object /, label: "valeur technique non remplacée" },
  { pattern: /[[(]\s*[CEKLMRSV]\d{1,3}(?:\.\d{1,2})?\s*[\],)]/, label: "identifiant de source interne" },
  { pattern: /�/, label: "caractère illisible" },
];

const PLACEHOLDER = /\[(?:à|a)\s+compl[ée]ter[^\]]*\]|\bà\s+compl[ée]ter\s*:|\bTODO\b|\bXXX\b/i;

/** "15 pages maximum", "limite de 10 pages" -> nombre de pages. */
export function parsePageLimit(text: string | null | undefined): number | null {
  const match = (text ?? "").match(/(\d{1,3})\s*(?:pages?|p\.)\b/i);
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function scanText(text: string, items: ExportCheck[], format: string) {
  for (const { pattern, label } of FORBIDDEN) {
    if (pattern.test(text)) {
      items.push({ level: "error", message: `${format} : ${label} présente dans le document.` });
    }
  }
  if (PLACEHOLDER.test(text)) {
    items.push({
      level: "warning",
      message: `${format} : des points « à compléter » restent dans le texte. Complétez-les avant la remise.`,
    });
  }
}


export async function checkPdf(input: {
  bytes: Uint8Array;
  /** Pages deja relues lors de la production, pour ne pas relire le fichier. */
  pages?: PageText[];
  model: MemoryDocument;
  starts: Record<string, number>;
  pageLimit: number | null;
}): Promise<ExportCheckReport> {
  const items: ExportCheck[] = [];
  let pages: PageText[];
  try {
    pages = input.pages ?? (await readPdfPages(input.bytes));
  } catch {
    return {
      ok: false,
      pages: null,
      items: [{ level: "error", message: "PDF : le fichier produit ne peut pas être relu." }],
    };
  }

  const total = pages.length;
  if (total < 3) {
    items.push({ level: "error", message: `PDF : ${total} page(s) seulement, le document est incomplet.` });
  }

  const firstSection = input.starts.s0 ?? 3;
  const firstAnnex = input.starts.a0 ?? null;

  for (const page of pages) {
    const isCover = page.page === 1;
    if (!isCover) {
      if (!page.content) {
        items.push({ level: "error", message: `PDF : la page ${page.page} est blanche.` });
      } else if (page.content.length < 140 && page.page !== total && page.page !== firstSection - 1) {
        items.push({ level: "warning", message: `PDF : la page ${page.page} est presque vide.` });
      }
      if (squash(page.header) !== squash(input.model.headerText)) {
        items.push({ level: "error", message: `PDF : en-tête absent ou altéré page ${page.page}.` });
      }
      if (!new RegExp(`\\b${page.page}\\s*/\\s*${total}\\b`).test(page.footer)) {
        items.push({ level: "error", message: `PDF : numéro de page absent page ${page.page}.` });
      }
    }
    if (page.overflow.length > 0) {
      items.push({
        level: "error",
        message: `PDF : du texte sort de la zone imprimable page ${page.page} (« ${page.overflow[0]} »).`,
      });
    }
  }

  // Sommaire : chaque chapitre commence bien a la page annoncee.
  const tocText = pages
    .slice(1, Math.max(2, firstSection - 1))
    .map((p) => p.content)
    .join(" ");
  const entries = tocEntries(input.model);
  const mismatched: string[] = [];
  for (const entry of entries) {
    const start = input.starts[entry.key];
    const target = start ? pages[start - 1] : undefined;
    const head = squash(entry.title).slice(0, 24);
    if (!start || !target || !squash(target.content).includes(head)) {
      mismatched.push(`« ${entry.title} » annoncé page ${start ?? "?"}`);
    }
  }
  if (mismatched.length > 0) {
    items.push({
      level: "error",
      message: `PDF : sommaire incohérent : ${mismatched.join(" ; ")}.`,
    });
  }
  if (!/sommaire/i.test(tocText)) {
    items.push({ level: "error", message: "PDF : le sommaire est absent." });
  }

  scanText(pages.map((p) => `${p.header} ${p.content} ${p.footer}`).join("\n"), items, "PDF");

  // Limite de pages du DCE : on compte le memoire lui-meme.
  const memoryPages = (firstAnnex ? firstAnnex - 1 : total) - (firstSection - 1);
  if (input.pageLimit && memoryPages > input.pageLimit) {
    items.push({
      level: "warning",
      message: `Le mémoire compte ${memoryPages} pages (hors couverture, sommaire et annexes) pour une limite de ${input.pageLimit} pages indiquée dans le DCE.`,
    });
  } else if (input.pageLimit) {
    items.push({
      level: "info",
      message: `${memoryPages} pages de mémoire, dans la limite de ${input.pageLimit} pages indiquée dans le DCE.`,
    });
  }

  if (input.model.replacedCharacters.length > 0) {
    items.push({
      level: "info",
      message: `Caractères spéciaux transcrits pour l'impression : ${input.model.replacedCharacters.join(" ")}`,
    });
  }

  return { ok: !items.some((i) => i.level === "error"), pages: total, items };
}

export async function checkDocx(input: {
  bytes: Uint8Array;
  model: MemoryDocument;
}): Promise<ExportCheckReport> {
  const items: ExportCheck[] = [];
  const JSZip = (await import("jszip")).default;

  let zip;
  try {
    zip = await JSZip.loadAsync(input.bytes);
  } catch {
    return {
      ok: false,
      pages: null,
      items: [{ level: "error", message: "Word : le fichier produit ne peut pas être relu." }],
    };
  }

  const read = async (name: string) => (await zip.file(name)?.async("string")) ?? "";
  const document = await read("word/document.xml");
  const headerFiles = Object.keys(zip.files).filter((f) => /^word\/header\d*\.xml$/.test(f));
  const footerFiles = Object.keys(zip.files).filter((f) => /^word\/footer\d*\.xml$/.test(f));
  const headers = (await Promise.all(headerFiles.map(read))).join("");
  const footers = (await Promise.all(footerFiles.map(read))).join("");
  const core = await read("docProps/core.xml");

  const count = (xml: string, pattern: RegExp) => (xml.match(pattern) ?? []).length;
  const expectedHeadings = input.model.sections.length + input.model.annexes.length;

  if (count(document, /<w:pStyle w:val="Heading1"\/>/g) < expectedHeadings) {
    items.push({ level: "error", message: "Word : des titres de chapitre ne sont pas des styles Titre 1." });
  }
  const tableBlocks = input.model.sections.reduce(
    (n, s) => n + s.blocks.filter((b) => b.type === "table").length,
    input.model.annexes.length,
  );
  if (count(document, /<w:tblHeader\/>|<w:tblHeader w:val="true"\/>/g) < tableBlocks) {
    items.push({ level: "error", message: "Word : une ligne d'en-tête de tableau ne se répète pas." });
  }
  if (count(document, /<w:drawing>/g) > 0 || count(document, /<w:pict>/g) > 0) {
    items.push({ level: "error", message: "Word : le document contient du contenu rendu en image." });
  }
  if (!/TOC \\/.test(document)) {
    items.push({ level: "error", message: "Word : le sommaire actualisable est absent." });
  }
  if (!/<w:pgBorders/.test(document)) {
    items.push({ level: "warning", message: "Word : le cadre de page est absent." });
  }
  if (!headers.includes(input.model.headerText.slice(0, 12))) {
    items.push({ level: "error", message: "Word : l'en-tête de page est absent." });
  }
  if (!/PAGE/.test(footers) || !/NUMPAGES/.test(footers)) {
    items.push({ level: "error", message: "Word : le champ de pagination est absent du pied de page." });
  }
  if (/materia/i.test(core) || /Un-named/i.test(core)) {
    items.push({ level: "error", message: "Word : les propriétés du fichier mentionnent un auteur technique." });
  }

  const plain = `${document}${headers}${footers}`
    .replace(/<w:p[ >]/g, "\n<w:p ")
    .replace(/<[^>]+>/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
  scanText(plain, items, "Word");

  items.push({
    level: "info",
    message: "Word : à l'ouverture, acceptez la mise à jour des champs pour afficher les numéros de page du sommaire.",
  });

  return { ok: !items.some((i) => i.level === "error"), pages: null, items };
}
