import "server-only";
import {
  ExtractionError,
  type ExtractedUnit,
  type ExtractionResult,
} from "./types";

/**
 * DOCX : le format ne porte aucune pagination, celle-ci n'existant qu'au
 * rendu. On extrait donc le texte en un seul bloc et pageNumber reste nul,
 * plutot que d'inventer une numerotation qui ne correspondrait a rien.
 */
export async function extractDocx(
  data: Uint8Array,
  fileName: string,
): Promise<ExtractionResult> {
  const mammoth = await import("mammoth");

  try {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(data),
    });

    const text = result.value.replace(/\n{3,}/g, "\n\n").trim();

    return {
      units:
        text.length > 0
          ? [{ pageNumber: null, label: "document", text }]
          : [],
      pageCount: null,
      needsOcr: false,
    };
  } catch (error) {
    throw new ExtractionError(
      error instanceof Error ? error.message : String(error),
      `Le document ${fileName} n'a pas pu etre lu.`,
    );
  }
}

/** Decode les entites XML rencontrees dans les fichiers Office. */
function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&amp;/g, "&");
}

/** Concatene le contenu de toutes les balises portant le nom donne. */
function textOfTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  const out: string[] = [];
  for (const match of xml.matchAll(pattern)) {
    out.push(decodeXml(match[1]));
  }
  return out;
}

/**
 * XLSX : une DPGF ou un BPU sont des tableurs. Seul leur texte nous interesse,
 * ce qui evite d'embarquer une bibliotheque de tableur complete.
 * Chaque feuille devient une unite citable par son nom.
 */
export async function extractXlsx(
  data: Uint8Array,
  fileName: string,
): Promise<ExtractionResult> {
  const JSZip = (await import("jszip")).default;

  try {
    const zip = await JSZip.loadAsync(data);

    // Table des chaines partagees : les cellules texte y renvoient par index.
    const sharedFile = zip.file("xl/sharedStrings.xml");
    const shared: string[] = [];
    if (sharedFile) {
      const xml = await sharedFile.async("string");
      const items = xml.split("<si>").slice(1);
      for (const item of items) {
        shared.push(textOfTags(item, "t").join(""));
      }
    }

    // Nom des feuilles, dans l'ordre du classeur.
    const workbook = zip.file("xl/workbook.xml");
    const sheetNames: string[] = [];
    if (workbook) {
      const xml = await workbook.async("string");
      for (const match of xml.matchAll(/<sheet\b[^>]*\bname="([^"]*)"/g)) {
        sheetNames.push(decodeXml(match[1]));
      }
    }

    const sheetFiles = Object.keys(zip.files)
      .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p))
      .sort((a, b) => {
        const na = Number(a.match(/(\d+)/)?.[1] ?? 0);
        const nb = Number(b.match(/(\d+)/)?.[1] ?? 0);
        return na - nb;
      });

    const units: ExtractedUnit[] = [];

    for (const [index, path] of sheetFiles.entries()) {
      const xml = await zip.file(path)!.async("string");
      const values: string[] = [];

      for (const cell of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
        const attrs = cell[1];
        const body = cell[2];
        const isShared = /\bt="s"/.test(attrs);
        const raw = textOfTags(body, "v")[0] ?? "";

        if (isShared) {
          const value = shared[Number(raw)];
          if (value) values.push(value);
        } else {
          const inline = textOfTags(body, "t").join("");
          const value = inline || raw;
          if (value) values.push(value);
        }
      }

      const text = values.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 0) {
        const name = sheetNames[index] ?? `feuille ${index + 1}`;
        units.push({ pageNumber: null, label: `feuille ${name}`, text });
      }
    }

    return { units, pageCount: null, needsOcr: false };
  } catch (error) {
    throw new ExtractionError(
      error instanceof Error ? error.message : String(error),
      `Le tableur ${fileName} n'a pas pu etre lu.`,
    );
  }
}
