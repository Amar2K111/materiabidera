/**
 * Regles de validation et de nommage des fichiers deposes.
 * Section 34 : taille limitee, type verifie, nom de fichier assaini.
 */

export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 Mo par fichier
export const MAX_FILES_PER_UPLOAD = 40;

const ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  zip: ["application/zip", "application/x-zip-compressed", "multipart/x-zip"],
};

export const ACCEPT_ATTRIBUTE = ".pdf,.doc,.docx,.xls,.xlsx,.zip";

/** Retire les signes diacritiques pour comparer des libelles francais. */
function deaccent(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i === -1 ? "" : fileName.slice(i + 1).toLowerCase();
}

export type FileRejection = { fileName: string; reason: string };

/**
 * Verifie extension, type declare et taille.
 * Le type MIME annonce par le navigateur n'est pas fiable seul : l'extension
 * fait foi, et le type ne doit pas la contredire.
 */
export function validateFile(file: File): string | null {
  const ext = extensionOf(file.name);
  const allowedMimes = ALLOWED[ext];

  if (!allowedMimes) {
    return "Format non pris en charge. Formats acceptes : PDF, DOC, DOCX, XLS, XLSX, ZIP.";
  }
  if (file.size === 0) {
    return "Le fichier est vide.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `Fichier trop volumineux (${formatBytes(file.size)}). Limite : ${formatBytes(
      MAX_FILE_BYTES,
    )}.`;
  }
  if (file.type && !allowedMimes.includes(file.type)) {
    return "Le contenu du fichier ne correspond pas a son extension.";
  }
  return null;
}

/** Nom de fichier sur : sans accent, sans chemin, sans caractere ambigu. */
export function safeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "document";
  return (
    deaccent(base)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+/, "")
      .slice(0, 120) || "document"
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export type DocumentKind =
  | "RC"
  | "CCTP"
  | "CCAP"
  | "ACTE_ENGAGEMENT"
  | "DPGF"
  | "BPU"
  | "PLAN"
  | "CADRE_MEMOIRE"
  | "ANNEXE"
  | "ADMINISTRATIF"
  | "AUTRE"
  | "UNKNOWN";

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  RC: "Reglement de consultation",
  CCTP: "CCTP",
  CCAP: "CCAP",
  ACTE_ENGAGEMENT: "Acte d'engagement",
  DPGF: "DPGF",
  BPU: "BPU",
  PLAN: "Plan",
  CADRE_MEMOIRE: "Cadre de memoire",
  ANNEXE: "Annexe",
  ADMINISTRATIF: "Piece administrative",
  AUTRE: "Autre",
  UNKNOWN: "A classer",
};

/**
 * Pre-classement d'apres le nom du fichier uniquement.
 *
 * Il s'agit d'une correspondance de chaines deterministe, pas d'une analyse :
 * elle ne sert qu'a proposer une nature de document. La classification reelle,
 * fondee sur le contenu, intervient dans le pipeline d'ingestion, et
 * l'utilisateur peut corriger la valeur a tout moment.
 */
export function guessKindFromName(fileName: string): DocumentKind {
  const n = deaccent(fileName).toLowerCase();

  if (/\bcctp\b|cahier.{0,20}clauses.{0,20}techniques/.test(n)) return "CCTP";
  if (/\bccap\b|cahier.{0,20}clauses.{0,20}administratives/.test(n)) {
    return "CCAP";
  }
  if (/\bdpgf\b|decomposition.{0,20}prix/.test(n)) return "DPGF";
  if (/\bbpu\b|bordereau.{0,20}prix/.test(n)) return "BPU";
  if (/acte.{0,5}d.{0,3}engagement|\batri\b/.test(n)) return "ACTE_ENGAGEMENT";
  if (/cadre.{0,20}memoire|trame.{0,20}memoire/.test(n)) return "CADRE_MEMOIRE";
  if (/\brc\b|reglement.{0,20}consultation/.test(n)) return "RC";
  if (/\bplan\b|\bcoupe\b|\bfacade\b/.test(n)) return "PLAN";
  if (/annexe/.test(n)) return "ANNEXE";
  if (/attestation|urssaf|kbis|assurance|\bdc[124]\b/.test(n)) {
    return "ADMINISTRATIF";
  }

  return "UNKNOWN";
}
