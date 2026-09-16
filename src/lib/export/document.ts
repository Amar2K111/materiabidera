/**
 * Modele documentaire du memoire technique.
 *
 * Construit une fois, a partir des donnees du dossier, puis rendu tel quel en
 * Word et en PDF : couverture, sommaire, chapitres numerotes, tableaux,
 * encadres et annexes sont decides ici, jamais dans un seul des deux rendus.
 *
 * Module pur, sans dependance serveur : testable directement.
 */

import { parseBlocks, parseRuns, type Block, type Run } from "../services/export-blocks.ts";

export type CoverRow = { label: string; value: string };

export type DocumentSection = {
  /** Numero affiche ("1", "2"...). */
  number: string;
  title: string;
  blocks: Block[];
  /** Sources citees, jointes uniquement si l'utilisateur le demande. */
  sources: string[];
};

export type DocumentAnnex = {
  title: string;
  intro: string;
  header: string[];
  rows: string[][];
};

export type MemoryDocument = {
  title: string;
  companyName: string;
  cover: {
    kicker: string;
    title: string;
    subtitle: string;
    rows: CoverRow[];
  };
  /** Texte d'en-tete : entreprise et objet du document. */
  headerText: string;
  /** Texte de pied de page, avant le numero de page. */
  footerText: string;
  toc: Array<{ number: string; title: string }>;
  sections: DocumentSection[];
  annexes: DocumentAnnex[];
  includeSources: boolean;
  /** Caracteres absents de la police du PDF, remplaces ou retires. */
  replacedCharacters: string[];
};

export type MemoryDocumentInput = {
  companyName: string;
  projectName: string;
  /** Objet du marche releve dans le DCE, plus precis que le nom du dossier. */
  subject: string | null;
  buyer: string | null;
  lot: string | null;
  reference: string | null;
  issuedOn: string;
  sections: Array<{
    number: string | null;
    title: string;
    content: string | null;
    sources: string[];
  }>;
  references: Array<{
    name: string;
    client: string | null;
    year: number | string | null;
    workType: string | null;
    amount: string | null;
    location: string | null;
  }>;
  certifications: Array<{
    name: string;
    reference: string | null;
    validUntil: string | null;
  }>;
  includeSources: boolean;
  includeAnnexes: boolean;
};

// --- Caracteres ------------------------------------------------------------------

/**
 * Plages couvertes par la police embarquee du PDF (sous-ensemble latin).
 * Tout autre caractere serait imprime comme un carre vide.
 */
const SUPPORTED: Array<[number, number]> = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2212, 0x2212],
  [0xfeff, 0xfeff],
];

const REPLACEMENTS: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "⇒": "=>",
  "≥": ">=",
  "≤": "<=",
  "≈": "~",
  "≠": "!=",
  "✓": "",
  "✔": "",
  "✗": "",
  "✘": "",
  "●": "•",
  "▪": "•",
  "■": "•",
  "◦": "•",
  "ﬁ": "fi",
  "ﬂ": "fl",
};

const isSupported = (code: number) => SUPPORTED.some(([from, to]) => code >= from && code <= to);

/**
 * Rend un texte imprimable a l'identique en Word et en PDF : les symboles
 * courants sont transcrits, les lettres accentuees rares ramenees a leur base,
 * le reste retire et signale.
 */
export function normalizeText(text: string, replaced: Set<string>): string {
  let out = "";
  for (const char of text.normalize("NFC")) {
    const code = char.codePointAt(0) ?? 0;
    if (isSupported(code)) {
      out += char;
      continue;
    }
    replaced.add(char);
    if (char in REPLACEMENTS) {
      out += REPLACEMENTS[char];
      continue;
    }
    // Lettre accentuee hors sous-ensemble (ex. "ę") : lettre de base.
    const base = char.normalize("NFD").replace(/\p{M}/gu, "");
    if (base && [...base].every((c) => isSupported(c.codePointAt(0) ?? 0))) {
      out += base;
    }
  }
  return out;
}

function normalizeRuns(runs: Run[], replaced: Set<string>): Run[] {
  return runs.map((run) => ({ ...run, text: normalizeText(run.text, replaced) }));
}

function normalizeBlock(block: Block, replaced: Set<string>): Block {
  switch (block.type) {
    case "heading":
      return { ...block, text: normalizeText(block.text, replaced) };
    case "paragraph":
      return { ...block, runs: normalizeRuns(block.runs, replaced) };
    case "bullets":
      return { ...block, items: block.items.map((item) => normalizeRuns(item, replaced)) };
    case "table":
      return {
        ...block,
        header: block.header.map((cell) => normalizeRuns(cell, replaced)),
        rows: block.rows.map((row) => row.map((cell) => normalizeRuns(cell, replaced))),
      };
    case "callout":
      return {
        ...block,
        title: block.title ? normalizeText(block.title, replaced) : null,
        runs: normalizeRuns(block.runs, replaced),
      };
  }
}

// --- Numerotation ---------------------------------------------------------------

/**
 * Numero de chapitre affiche : le numero du plan s'il est explicite et non
 * purement numerique (cadre de reponse "A", "2.1"...), sinon l'ordre du plan.
 */
export function sectionNumber(planNumber: string | null, index: number): string {
  const raw = (planNumber ?? "").trim().replace(/\.$/, "");
  if (raw && !/^\d+$/.test(raw)) return raw;
  return String(index + 1);
}

/** Sous-titres numerotes "2.1", "2.2" ; les niveaux 3 ne le sont pas. */
function numberHeadings(blocks: Block[], chapter: string): Block[] {
  let count = 0;
  return blocks.map((block) => {
    if (block.type !== "heading" || block.level !== 2) return block;
    count += 1;
    return { ...block, number: `${chapter}.${count}` };
  });
}

// --- Construction -----------------------------------------------------------------

const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;

const clean = (value: string | null | undefined) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  // Une valeur "non trouvee" relevee par l'analyse n'est pas une information.
  return text && !/^information non trouv/i.test(text) ? text : null;
};

export function buildMemoryDocument(input: MemoryDocumentInput): MemoryDocument {
  const replaced = new Set<string>();
  const n = (text: string) => normalizeText(text, replaced);

  const company = n(input.companyName.trim());
  const lot = clean(input.lot);
  const operation = clean(input.subject) ?? input.projectName;
  const reference = clean(input.reference);

  const rows: CoverRow[] = [
    { label: "Opération", value: operation },
    ...(clean(input.buyer) ? [{ label: "Maître d'ouvrage", value: clean(input.buyer)! }] : []),
    { label: "Candidat", value: input.companyName },
    // Une reference absente du dossier n'est jamais remplacee par une valeur inventee.
    ...(reference ? [{ label: "Référence", value: reference }] : []),
    { label: "Version", value: `Version du ${input.issuedOn}` },
  ].map((row) => ({ label: n(row.label), value: n(row.value) }));

  const sections: DocumentSection[] = input.sections.map((section, index) => {
    const number = sectionNumber(section.number, index);
    const blocks = numberHeadings(parseBlocks(section.content), number).map((block) =>
      normalizeBlock(block, replaced),
    );
    return {
      number,
      title: n(section.title),
      blocks,
      sources: section.sources.map(n),
    };
  });

  const annexes: DocumentAnnex[] = [];
  if (input.includeAnnexes) {
    const refs = input.references;
    if (refs.length > 0) {
      const columns: Array<{ label: string; value: (r: (typeof refs)[number]) => string }> = [
        { label: "Chantier", value: (r) => r.name },
        { label: "Maître d'ouvrage", value: (r) => r.client ?? "" },
        { label: "Année", value: (r) => (r.year ? String(r.year) : "") },
        { label: "Nature des travaux", value: (r) => r.workType ?? "" },
        { label: "Localisation", value: (r) => r.location ?? "" },
        { label: "Montant", value: (r) => r.amount ?? "" },
      ];
      // Une colonne entierement vide n'est pas affichee.
      const kept = columns.filter((c) => refs.some((r) => c.value(r).trim()));
      annexes.push({
        title: n("Références citées"),
        intro: n("Chantiers comparables mentionnés dans le présent mémoire."),
        header: kept.map((c) => n(c.label)),
        rows: refs.map((r) => kept.map((c) => n(c.value(r)))),
      });
    }
    const certs = input.certifications;
    if (certs.length > 0) {
      const columns: Array<{ label: string; value: (c: (typeof certs)[number]) => string }> = [
        { label: "Certification / qualification", value: (c) => c.name },
        { label: "Référence", value: (c) => c.reference ?? "" },
        { label: "Validité", value: (c) => c.validUntil ?? "" },
      ];
      const kept = columns.filter((col) => certs.some((c) => col.value(c).trim()));
      annexes.push({
        title: n("Certifications et qualifications citées"),
        intro: n("Justificatifs disponibles sur demande."),
        header: kept.map((c) => n(c.label)),
        rows: certs.map((c) => kept.map((col) => n(col.value(c)))),
      });
    }
  }

  const shortObject = truncate(operation, 80);

  return {
    title: n(`Mémoire technique — ${input.projectName}`),
    companyName: company,
    cover: {
      kicker: company,
      title: "MÉMOIRE TECHNIQUE",
      subtitle: n(lot ?? input.projectName),
      rows,
    },
    headerText: n(`${input.companyName} | Mémoire technique${lot ? ` — ${truncate(lot, 60)}` : ""}`),
    footerText: n(reference ? `${shortObject} • ${reference}` : shortObject),
    toc: sections.map((s) => ({ number: s.number, title: s.title })),
    sections,
    annexes,
    includeSources: input.includeSources,
    replacedCharacters: [...replaced],
  };
}

// --- Nom de fichier -----------------------------------------------------------------

function fileSegment(value: string, max: number): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= max) return slug;
  // Coupe au dernier tiret : jamais au milieu d'un mot.
  const cut = slug.slice(0, max + 1);
  const dash = cut.lastIndexOf("-");
  return (dash > max * 0.5 ? cut.slice(0, dash) : slug.slice(0, max)).replace(/-+$/g, "");
}

/** "Memoire_Technique_[Entreprise]_[Lot]_[Reference].pdf", sans caractere interdit. */
export function exportFileName(input: {
  companyName: string;
  lot: string | null;
  reference: string | null;
  extension: "pdf" | "docx";
}): string {
  const parts = [
    "Memoire_Technique",
    fileSegment(input.companyName, 40),
    input.lot ? fileSegment(input.lot, 40) : "",
    input.reference ? fileSegment(input.reference, 30) : "",
  ].filter(Boolean);
  return `${parts.join("_")}.${input.extension}`;
}

/** Texte brut d'une suite de segments (controles, recherches). */
export function runsText(runs: Run[]): string {
  return runs.map((r) => r.text).join("");
}

export { parseRuns };

/**
 * Largeur relative des colonnes d'un tableau (somme = 1), identique en Word et
 * en PDF. Proportionnelle au contenu de chaque colonne, adoucie pour eviter les
 * colonnes envahissantes, et jamais plus etroite que son mot le plus long : un
 * mot ne doit pas etre coupe en deux dans une cellule.
 */
export function columnWidths(
  header: string[],
  rows: string[][],
  options: { contentWidthPt?: number; charWidthPt?: number; paddingPt?: number } = {},
): number[] {
  const count = header.length;
  if (count === 0) return [];
  const contentWidth = options.contentWidthPt ?? 482;
  // Largeur moyenne d'un caractere a 8,5 pt, en-tete en gras compris.
  const charWidth = options.charWidthPt ?? 5.1;
  const padding = options.paddingPt ?? 12;

  const longestWord = (text: string) =>
    text.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0);

  const floors = header.map((h, i) => {
    const chars = Math.max(
      longestWord(h) * 1.08,
      ...rows.map((row) => longestWord(row[i] ?? "")),
      3,
    );
    return (chars * charWidth + padding) / contentWidth;
  });

  const lengths = header.map((h, i) =>
    Math.max(h.length * 0.8, ...rows.map((row) => (row[i] ?? "").length), 4),
  );
  const softTotal = lengths.reduce((a, l) => a + Math.sqrt(l), 0);
  let widths = lengths.map((l) => Math.sqrt(l) / softTotal);

  const floorTotal = floors.reduce((a, b) => a + b, 0);
  if (floorTotal >= 1) return floors.map((f) => f / floorTotal);

  // Chaque colonne recoit au moins son plancher ; l'excedent est repris sur
  // les colonnes qui ont de la marge, proportionnellement a cette marge.
  for (let pass = 0; pass < 6; pass += 1) {
    widths = widths.map((w, i) => Math.max(w, floors[i]));
    const excess = widths.reduce((a, b) => a + b, 0) - 1;
    if (excess <= 1e-6) break;
    const slack = widths.map((w, i) => Math.max(0, w - floors[i]));
    const slackTotal = slack.reduce((a, b) => a + b, 0);
    if (slackTotal <= 0) break;
    widths = widths.map((w, i) => w - (excess * slack[i]) / slackTotal);
  }
  const total = widths.reduce((a, b) => a + b, 0);
  return widths.map((w) => w / total);
}
