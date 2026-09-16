import "server-only";
import { createRequire } from "node:module";
import path from "node:path";
import type { MemoryDocument } from "./document";
import { PAGE, cmToPt } from "./theme";

/** Texte d'une page PDF, reparti entre en-tete, contenu et pied de page. */
export type PageText = {
  page: number;
  header: string;
  footer: string;
  content: string;
  /** Fragments de texte sortant de la zone imprimable. */
  overflow: string[];
};

let standardFonts: string | undefined;
function standardFontDataUrl() {
  if (standardFonts !== undefined) return standardFonts || undefined;
  try {
    const require = createRequire(import.meta.url);
    const dir = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts");
    standardFonts = `${dir.split(path.sep).join("/")}/`;
  } catch {
    standardFonts = "";
  }
  return standardFonts || undefined;
}

/** Relit un PDF produit, page par page, tel qu'un lecteur le verrait. */
export async function readPdfPages(bytes: Uint8Array): Promise<PageText[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
    standardFontDataUrl: standardFontDataUrl(),
  });
  const doc = await task.promise;

  const marginLeft = cmToPt(PAGE.marginLeftCm);
  const marginRight = cmToPt(PAGE.marginRightCm);
  const marginTop = cmToPt(PAGE.marginTopCm);
  const marginBottom = cmToPt(PAGE.marginBottomCm);
  const pages: PageText[] = [];

  try {
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const { width, height } = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const entry: PageText = { page: n, header: "", footer: "", content: "", overflow: [] };

      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const x = item.transform[4];
        const y = item.transform[5];
        // En-tete et pied de page : au-dessus / au-dessous des marges.
        if (y > height - marginTop + 2) {
          entry.header += `${item.str} `;
          continue;
        }
        if (y < marginBottom - 6) {
          entry.footer += `${item.str} `;
          continue;
        }
        entry.content += `${item.str} `;
        if (x < marginLeft - 2 || x + item.width > width - marginRight + 2) {
          entry.overflow.push(item.str.slice(0, 40));
        }
      }
      entry.header = entry.header.replace(/\s+/g, " ").trim();
      entry.footer = entry.footer.replace(/\s+/g, " ").trim();
      entry.content = entry.content.replace(/\s+/g, " ").trim();
      pages.push(entry);
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
  return pages;
}

export const squash = (text: string) => text.replace(/\s+/g, "").toLowerCase();

/** Entrees du sommaire, dans l'ordre du document. */
export function tocEntries(model: MemoryDocument) {
  return [
    ...model.sections.map((s, i) => ({ key: `s${i}`, title: `${s.number}. ${s.title}` })),
    ...model.annexes.map((a, i) => ({ key: `a${i}`, title: `Annexe ${i + 1} — ${a.title}` })),
  ];
}

/**
 * Page de debut de chaque chapitre et annexe, lue dans le PDF produit.
 *
 * La recherche avance dans l'ordre du document, a partir de la page qui suit
 * le sommaire : un titre cite au sommaire ou repris dans un autre chapitre ne
 * peut donc pas etre pris pour le debut du chapitre.
 */
export function locateStarts(pages: PageText[], model: MemoryDocument): Record<string, number> {
  const starts: Record<string, number> = {};
  const entries = tocEntries(model);
  const heads = entries.map((e) => squash(e.title).slice(0, 28));

  // Pages du sommaire : celles qui citent plusieurs titres a la fois (un long
  // sommaire peut tenir sur plusieurs pages).
  const needed = Math.min(3, entries.length);
  let lastTocPage = pages.findIndex((p) => /sommaire/i.test(p.content));
  for (let index = Math.max(lastTocPage, 0); index < pages.length; index += 1) {
    const text = squash(pages[index].content);
    if (heads.filter((h) => text.includes(h)).length >= needed) lastTocPage = index;
    else if (index > lastTocPage) break;
  }
  let cursor = Math.max(lastTocPage + 1, 1);

  for (const entry of entries) {
    const head = squash(entry.title).slice(0, 28);
    for (let index = cursor; index < pages.length; index += 1) {
      if (squash(pages[index].content).includes(head)) {
        starts[entry.key] = index + 1;
        cursor = index;
        break;
      }
    }
  }
  return starts;
}
