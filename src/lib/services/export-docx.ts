import "server-only";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  NumberFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TabStopType,
  TextRun,
  WidthType,
} from "docx";
import { chapterNumber, parseBlocks, type Run } from "./export-blocks";

const BRAND = "0035A9";
const INK = "0B1220";
const TEXT = "27303F";
const MUTED = "6B7280";
const LINE = "E4E8EF";
const FONT = "Calibri";

/** Largeur utile d'une page A4 avec des marges de 2,1 cm (en twips). */
const CONTENT_WIDTH = 9506;

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
  /** Date d'etablissement du document. */
  issuedOn: string;
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
  const body = payload.sections.flatMap((section, index) =>
    buildSection(section, index, payload.includeSources),
  );

  const doc = new Document({
    creator: payload.organizationName,
    title: `Mémoire technique — ${payload.projectName}`,
    description: "Mémoire technique de réponse à appel d'offres",
    // Word propose de mettre a jour les champs a l'ouverture : le sommaire
    // se remplit avec les numeros de page reels.
    features: { updateFields: true },

    numbering: {
      config: [
        {
          reference: "puces",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 360, hanging: 260 } },
                run: { color: BRAND, bold: true },
              },
            },
          ],
        },
      ],
    },

    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21, color: TEXT },
          paragraph: { spacing: { line: 300, after: 140 } },
        },
        heading1: {
          run: { font: FONT, size: 36, bold: true, color: INK },
          paragraph: { spacing: { before: 120, after: 120 }, keepNext: true },
        },
        heading2: {
          run: { font: FONT, size: 24, bold: true, color: BRAND },
          paragraph: { spacing: { before: 240, after: 100 }, keepNext: true },
        },
      },
      paragraphStyles: [
        {
          id: "SourceLine",
          name: "Source",
          basedOn: "Normal",
          run: { size: 16, color: MUTED },
          paragraph: { spacing: { after: 20 } },
        },
        {
          id: "ChapterNumber",
          name: "Numero de chapitre",
          basedOn: "Normal",
          run: { size: 56, bold: true, color: BRAND },
          paragraph: { spacing: { after: 0 }, keepNext: true },
        },
        {
          id: "Kicker",
          name: "Surtitre",
          basedOn: "Normal",
          run: { size: 18, bold: true, color: BRAND, characterSpacing: 20 },
          paragraph: { spacing: { after: 60 } },
        },
      ],
    },

    sections: [
      // --- Couverture, sans en-tete ni pagination ---------------------------
      {
        properties: {
          page: { margin: { top: 0, right: 1200, bottom: 1000, left: 1200 } },
        },
        children: buildCover(payload),
      },

      // --- Sommaire et corps du memoire ---------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1300, right: 1200, bottom: 1200, left: 1200, header: 560, footer: 560 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: buildHeader(payload) },
        footers: { default: buildFooter(payload) },
        children: [
          new Paragraph({ style: "Kicker", text: "MÉMOIRE TECHNIQUE" }),
          // Titre hors styles de titre : le sommaire ne se cite pas lui-meme.
          new Paragraph({
            children: [new TextRun({ text: "Sommaire", size: 44, bold: true, color: INK })],
            spacing: { after: 300 },
          }),
          new TableOfContents("Sommaire", {
            hyperlink: true,
            headingStyleRange: "1-1",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Si le sommaire est vide, faites clic droit > Mettre à jour les champs.",
                size: 16,
                color: MUTED,
                italics: true,
              }),
            ],
            spacing: { before: 200 },
          }),
          ...body,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

function buildCover(payload: ExportPayload): Array<Paragraph | Table> {
  const candidates: Array<[string, string | null]> = [
    ["Maître d'ouvrage / acheteur", payload.buyer],
    ["Lot", payload.lot],
    ["Référence de la consultation", payload.reference],
    ["Date limite de remise", payload.deadline],
  ];
  // Une information absente n'est pas remplacee par une mention inventee.
  const facts = candidates.filter((f): f is [string, string] => Boolean(f[1]));

  const band = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
    rows: [
      new TableRow({
        height: { value: 180, rule: "exact" },
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: BRAND, color: "auto" },
            children: [new Paragraph({ text: "" })],
          }),
        ],
      }),
    ],
  });

  const factsTable = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: LINE },
      left: NO_BORDER,
      right: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: facts.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3200, type: WidthType.DXA },
              margins: { top: 110, bottom: 110 },
              children: [
                new Paragraph({
                  spacing: { after: 0 },
                  children: [new TextRun({ text: label, size: 19, color: MUTED })],
                }),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_WIDTH - 3200, type: WidthType.DXA },
              margins: { top: 110, bottom: 110 },
              children: [
                new Paragraph({
                  spacing: { after: 0 },
                  children: [new TextRun({ text: value, size: 21, bold: true, color: INK })],
                }),
              ],
            }),
          ],
        }),
    ),
  });

  return [
    band,
    new Paragraph({ text: "", spacing: { before: 2600 } }),
    new Paragraph({
      style: "Kicker",
      text: payload.organizationName.toUpperCase(),
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Offre technique", size: 24, color: MUTED })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Mémoire technique", size: 68, bold: true, color: INK })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: payload.projectName, size: 30, color: TEXT })],
      spacing: { after: 900 },
    }),
    factsTable,
    new Paragraph({ text: "", spacing: { before: 1800 } }),
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
      children: [
        new TextRun({ text: `Document établi par ${payload.organizationName}`, size: 18, color: MUTED }),
        new TextRun({ text: `\t${payload.issuedOn}`, size: 18, color: MUTED }),
      ],
    }),
  ];
}

function buildHeader(payload: ExportPayload): Header {
  return new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
        children: [
          new TextRun({ text: payload.organizationName, size: 16, bold: true, color: BRAND }),
          new TextRun({ text: "\tMémoire technique", size: 16, color: MUTED }),
        ],
      }),
    ],
  });
}

function buildFooter(payload: ExportPayload): Footer {
  const name =
    payload.projectName.length > 90
      ? `${payload.projectName.slice(0, 88)}…`
      : payload.projectName;

  return new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        children: [
          new TextRun({ text: name, size: 16, color: MUTED }),
          new TextRun({ text: "\t", size: 16 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
          new TextRun({ text: " / ", size: 16, color: MUTED }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MUTED }),
        ],
      }),
    ],
  });
}

function runsOf(runs: Run[]): TextRun[] {
  return runs.map(
    (run) => new TextRun({ text: run.text, bold: run.bold, color: run.bold ? INK : undefined }),
  );
}

/** Tableau du memoire : en-tete colore repete sur chaque page, lignes alternees. */
function buildTable(header: Run[][], rows: Run[][][]): Table {
  const columnWidth = Math.floor(CONTENT_WIDTH / header.length);
  const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (runs: Run[], head: boolean, shade?: string) =>
    new TableCell({
      width: { size: columnWidth, type: WidthType.DXA },
      borders,
      shading: shade ? { type: ShadingType.CLEAR, fill: shade, color: "auto" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { after: 0, line: 260 },
          children: runs.map(
            (run) =>
              new TextRun({
                text: run.text,
                bold: head || run.bold,
                size: 18,
                color: head ? "FFFFFF" : run.bold ? INK : TEXT,
              }),
          ),
        }),
      ],
    });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: header.map(() => columnWidth),
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: header.map((runs) => cell(runs, true, BRAND)),
      }),
      ...rows.map(
        (row, index) =>
          new TableRow({
            cantSplit: true,
            children: row.map((runs) => cell(runs, false, index % 2 === 1 ? "F7F9FC" : undefined)),
          }),
      ),
    ],
  });
}

function buildSection(
  section: ExportSection,
  index: number,
  includeSources: boolean,
): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [
    // Chaque chapitre commence sur une nouvelle page, sommaire compris.
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ style: "ChapterNumber", text: chapterNumber(section.number, index) }),
    new Paragraph({
      text: section.title,
      heading: HeadingLevel.HEADING_1,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 10 } },
      spacing: { after: 320 },
    }),
  ];

  const parsed = parseBlocks(section.content);

  if (parsed.length === 0) {
    blocks.push(
      new Paragraph({
        children: [new TextRun({ text: "Chapitre non rédigé.", italics: true, color: MUTED })],
      }),
    );
  }

  for (const block of parsed) {
    if (block.type === "heading") {
      blocks.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 }));
    } else if (block.type === "table") {
      blocks.push(buildTable(block.header, block.rows));
      blocks.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    } else if (block.type === "bullets") {
      for (const item of block.items) {
        blocks.push(
          new Paragraph({
            numbering: { reference: "puces", level: 0 },
            spacing: { after: 70 },
            children: runsOf(item),
          }),
        );
      }
    } else {
      blocks.push(
        new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: runsOf(block.runs) }),
      );
    }
  }

  if (includeSources && section.sources.length > 0) {
    blocks.push(
      new Paragraph({
        spacing: { before: 280, after: 60 },
        shading: { type: ShadingType.CLEAR, fill: "F7F9FC", color: "auto" },
        children: [new TextRun({ text: "SOURCES", size: 16, bold: true, color: MUTED })],
      }),
    );
    for (const source of section.sources) {
      blocks.push(new Paragraph({ style: "SourceLine", text: source }));
    }
  }

  return blocks;
}
