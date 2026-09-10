import "server-only";
import { extensionOf } from "@/lib/documents";
import { extractDocx, extractXlsx } from "./office";
import { extractPdf } from "./pdf";
import { ExtractionError, type ExtractionResult } from "./types";

/**
 * Oriente un fichier vers l'extracteur qui lui correspond.
 *
 * Les formats Office anciens ne sont pas lus : plutot que de renvoyer un texte
 * partiel et trompeur, on demande explicitement une conversion.
 */
export async function extractionOf(
  data: Uint8Array,
  fileName: string,
): Promise<ExtractionResult> {
  const ext = extensionOf(fileName);

  switch (ext) {
    case "pdf":
      return extractPdf(data);
    case "docx":
      return extractDocx(data, fileName);
    case "xlsx":
      return extractXlsx(data, fileName);
    case "doc":
      throw new ExtractionError(
        "legacy .doc",
        "Le format .doc n'est pas lisible. Enregistrez ce fichier en .docx puis deposez-le a nouveau.",
      );
    case "xls":
      throw new ExtractionError(
        "legacy .xls",
        "Le format .xls n'est pas lisible. Enregistrez ce fichier en .xlsx puis deposez-le a nouveau.",
      );
    case "zip":
      throw new ExtractionError(
        "archive",
        "Cette archive doit d'abord etre decompressee pour que ses pieces soient analysees.",
      );
    default:
      throw new ExtractionError(
        `extension ${ext}`,
        "Ce format de fichier n'est pas pris en charge.",
      );
  }
}
