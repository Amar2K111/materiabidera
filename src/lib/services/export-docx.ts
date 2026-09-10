import "server-only";
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  NumberFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  TabStopType,
  TableOfContents,
  TextRun,
} from "docx";

const BRAND = "0035A9";
const INK = "000000";
const MUTED = "666666";

export type ExportSection = {
  number: string | null;
  title: string;
  content: string | null;
  sources: string[];
};

export type ExportPayload = {
  organizationName: string;
  projectName: string;
  reference: string | null;
  buyer: string | null;
  lot: string | null;
  deadline: string | null;
  sections: ExportSection[];
  /** Ajoute la liste des sources en fin de chaque chapitre. */
  includeSources: boolean;
};

/**
 * Memoire technique au format Word.
 *
 * Le document est structure avec de vrais styles de titre : le sommaire se met
 * a jour dans Word, et l'acheteur peut naviguer dans le volet de plan. Un
 * document dont les titres seraient de simples paragraphes en gras n'offrirait
 * ni l'un ni l'autre.
 */
export async function buildDocx(payload: ExportPayload): Promise<Buffer> {
  const cover = buildCover(payload);
  const body = payload.sections.flatMap((section, index) =>
    buildSection(section, index, payload.includeSources),
  );

  const doc = new Document({
    creator: payload.organizationName,
    title: `Memoire technique — ${payload.projectName}`,
    description: "Memoire technique de reponse a appel d'offres",

    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: INK },
          paragraph: { spacing: { line: 300, after: 140 } },
        },
        heading1: {
          run: { font: "Calibri", size: 32, bold: true, color: BRAND },
          paragraph: { spacing: { before: 360, after: 200 } },
        },
        heading2: {
          run: { font: "Calibri", size: 26, bold: true, color: INK },
          paragraph: { spacing: { before: 260, after: 140 } },
        },
      },
      paragraphStyles: [
        {
          id: "SourceLine",
          name: "Source",
          basedOn: "Normal",
          run: { size: 18, color: MUTED, italics: true },
          paragraph: { spacing: { after: 40 } },
        },
        {
          id: "CoverTitle",
          name: "Cover title",
          basedOn: "Normal",
          run: { size: 56, bold: true, color: INK },
          paragraph: { spacing: { after: 240 } },
        },
      ],
    },

    sections: [
      // --- Couverture, sans en-tete ni pagination ---------------------------
      {
        properties: {
          page: { margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } },
        },
        children: cover,
      },

      // --- Corps du memoire --------------------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: buildHeader(payload) },
        footers: { default: buildFooter(payload) },
        children: [
          new Paragraph({
            text: "Sommaire",
            heading: HeadingLevel.HEADING_1,
          }),
          new TableOfContents("Sommaire", {
            hyperlink: true,
            headingStyleRange: "1-2",
          }),
          new Paragraph({ children: [new PageBreak()] }),
          ...body,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function buildCover(payload: ExportPayload): Paragraph[] {
  const lines: Paragraph[] = [
    new Paragraph({ text: "", spacing: { before: 2400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: payload.organizationName.toUpperCase(),
          bold: true,
          size: 24,
          color: BRAND,
        }),
      ],
      spacing: { after: 600 },
    }),
    new Paragraph({ style: "CoverTitle", text: "Memoire technique" }),
    new Paragraph({
      children: [
        new TextRun({ text: payload.projectName, size: 28, color: INK }),
      ],
      spacing: { after: 600 },
    }),
  ];

  const facts: Array<[string, string | null]> = [
    ["Reference", payload.reference],
    ["Acheteur", payload.buyer],
    ["Lot", payload.lot],
    ["Date limite de remise", payload.deadline],
  ];

  for (const [label, value] of facts) {
    // Une information absente n'est pas remplacee par une mention inventee.
    if (!value) continue;
    lines.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label} : `, bold: true, size: 20 }),
          new TextRun({ text: value, size: 20 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  return lines;
}

function buildHeader(payload: ExportPayload): Header {
  return new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        children: [
          new TextRun({
            text: payload.organizationName,
            size: 16,
            color: MUTED,
          }),
          new TextRun({ text: "\t", size: 16 }),
          new TextRun({
            text: payload.projectName,
            size: 16,
            color: MUTED,
          }),
        ],
      }),
    ],
  });
}

function buildFooter(payload: ExportPayload): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Memoire technique — ", size: 16, color: MUTED }),
          new TextRun({
            text: payload.lot ?? payload.projectName,
            size: 16,
            color: MUTED,
          }),
          new TextRun({ text: " — page ", size: 16, color: MUTED }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
          new TextRun({ text: " sur ", size: 16, color: MUTED }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 16,
            color: MUTED,
          }),
        ],
      }),
    ],
  });
}

function buildSection(
  section: ExportSection,
  index: number,
  includeSources: boolean,
): Paragraph[] {
  const heading = [section.number, section.title].filter(Boolean).join(" — ");

  const blocks: Paragraph[] = [
    // Chaque chapitre commence sur une nouvelle page, sauf le premier.
    ...(index > 0 ? [new Paragraph({ children: [new PageBreak()] })] : []),
    new Paragraph({ text: heading, heading: HeadingLevel.HEADING_1 }),
  ];

  const content = (section.content ?? "").trim();

  if (content.length === 0) {
    blocks.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Chapitre non redige.",
            italics: true,
            color: MUTED,
          }),
        ],
      }),
    );
  } else {
    // Les paragraphes sont separes par une ligne vide dans le texte source.
    for (const raw of content.split(/\n\s*\n/)) {
      const text = raw.trim();
      if (text.length === 0) continue;
      blocks.push(new Paragraph({ text }));
    }
  }

  if (includeSources && section.sources.length > 0) {
    blocks.push(
      new Paragraph({
        text: "Sources",
        heading: HeadingLevel.HEADING_2,
      }),
    );
    for (const source of section.sources) {
      blocks.push(new Paragraph({ style: "SourceLine", text: source }));
    }
  }

  return blocks;
}
