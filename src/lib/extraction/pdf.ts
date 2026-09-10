import "server-only";
import { createRequire } from "node:module";
import path from "node:path";
import {
  ExtractionError,
  type ExtractedUnit,
  type ExtractionResult,
} from "./types";

/**
 * Emplacement des polices standard livrees avec pdfjs.
 *
 * Sans elles, chaque page utilisant une police non embarquee produit un
 * avertissement. Le calcul est fait une seule fois, et un echec de resolution
 * n'empeche pas la lecture : seul le bruit dans les journaux reapparait.
 */
let standardFontDataUrl: string | undefined;
function resolveStandardFonts(): string | undefined {
  if (standardFontDataUrl !== undefined) return standardFontDataUrl;
  try {
    const require = createRequire(import.meta.url);
    const pkg = require.resolve("pdfjs-dist/package.json");
    const dir = path.join(path.dirname(pkg), "standard_fonts");

    // pdfjs attend un chemin de fichier termine par une barre oblique.
    // Une URL file:// est refusee cote Node, et le separateur Windows aussi :
    // les deux formes ont ete verifiees, seule celle-ci charge les polices.
    standardFontDataUrl = `${dir.split(path.sep).join("/")}/`;
  } catch {
    standardFontDataUrl = "";
  }
  return standardFontDataUrl || undefined;
}

/**
 * Extraction du texte d'un PDF, page par page.
 *
 * La pagination est indispensable : sans elle, impossible d'ecrire
 * "RC.pdf, page 18" en face d'une exigence (sections 9 et 20).
 */
export async function extractPdf(data: Uint8Array): Promise<ExtractionResult> {
  // Import differe : pdfjs embarque un runtime volumineux qu'il est inutile
  // de charger tant qu'aucun PDF n'est traite.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data,
    // Aucune police systeme : le traitement reste confine aux ressources
    // fournies, sans dependre de ce qui est installe sur la machine.
    useSystemFonts: false,
    standardFontDataUrl: resolveStandardFonts(),
  });

  let doc;
  try {
    doc = await loadingTask.promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await loadingTask.destroy().catch(() => {});

    if (message.toLowerCase().includes("password")) {
      throw new ExtractionError(
        message,
        "Ce PDF est protege par mot de passe et ne peut pas etre lu.",
      );
    }
    throw new ExtractionError(
      message,
      "Ce PDF n'a pas pu etre ouvert. Il est peut-etre endommage.",
    );
  }

  const pageCount = doc.numPages;
  const units: ExtractedUnit[] = [];

  try {
    for (let n = 1; n <= pageCount; n += 1) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();

      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/[ \t]+/g, " ")
        .trim();

      page.cleanup();

      if (text.length > 0) {
        units.push({ pageNumber: n, label: `page ${n}`, text });
      }
    }
  } finally {
    // La liberation passe par la tache de chargement, pas par le document.
    await loadingTask.destroy().catch(() => {});
  }

  return {
    units,
    pageCount,
    // Un PDF pagine sans aucun texte selectionnable est un document scanne.
    needsOcr: units.length === 0 && pageCount > 0,
  };
}
