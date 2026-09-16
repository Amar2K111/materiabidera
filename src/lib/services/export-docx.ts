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
  PageBorderDisplay,
  PageBorderOffsetFrom,
  PageBorderZOrder,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableOfContents,
  TableRow,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { Block, Run } from "./export-blocks";
import {
  columnWidths,
  runsText,
  type DocumentAnnex,
  type DocumentSection,
  type MemoryDocument,
} from "@/lib/export/document";
import {
  COLORS,
  FONTS,
  PAGE,
  SIZES,
  cmToTwips,
  ptToHalfPoints,
  ptToTwips,
} from "@/lib/export/theme";

/** Largeur utile de la page (A4 moins les marges), en twips. */
const CONTENT_WIDTH =
  11906 - cmToTwips(PAGE.marginLeftCm) - cmToTwips(PAGE.marginRightCm);

const BODY = FONTS.docx.body;
const DISPLAY = FONTS.docx.display;

/** Word : interligne en 240e de ligne (1,08 -> 259). */
const LINE = Math.round(SIZES.lineHeight * 240);

const THIN = { style: BorderStyle.SINGLE, size: 4, color: COLORS.border };
const NONE = { style: BorderStyle.NONE, size: 0, color: COLORS.white };

/**
 * Memoire technique au format Word natif.
 *
 * Tout est modifiable dans Word : vrais styles de titre (Titre 1 a 3, volet de
 * navigation, sommaire actualisable), tableaux natifs dont la ligne d'en-tete
 * se repete, champs de pagination, cadre de page. Aucun contenu n'est rendu en
 * image.
 */
export async function buildDocx(model: MemoryDocument): Promise<Buffer> {
  const doc = new Document({
    creator: model.companyName,
    lastModifiedBy: model.companyName,
    title: model.title,
    // Word propose de mettre a jour les champs a l'ouverture : le sommaire
    // affiche alors les numeros de page reels. Aucun numero n'est ecrit a
    // l'avance, pour ne jamais en afficher un faux.
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
                paragraph: { indent: { left: 340, hanging: 240 } },
                run: { color: COLORS.blue, bold: true },
              },
            },
          ],
        },
      ],
    },

    styles: {
      default: {
        document: {
          run: { font: BODY, size: ptToHalfPoints(SIZES.body), color: COLORS.text },
          paragraph: { spacing: { line: LINE, after: ptToTwips(SIZES.paragraphAfter) } },
        },
        heading1: {
          run: { font: DISPLAY, size: ptToHalfPoints(SIZES.h1), bold: true, color: COLORS.navy },
          paragraph: {
            spacing: { before: ptToTwips(SIZES.h1Before + 6), after: ptToTwips(SIZES.h1After), line: 240 },
            keepNext: true,
            keepLines: true,
          },
        },
        heading2: {
          run: { font: DISPLAY, size: ptToHalfPoints(SIZES.h2), bold: true, color: COLORS.blue },
          paragraph: {
            spacing: { before: ptToTwips(SIZES.h2Before), after: ptToTwips(SIZES.h2After), line: 240 },
            keepNext: true,
            keepLines: true,
          },
        },
        heading3: {
          run: { font: DISPLAY, size: ptToHalfPoints(SIZES.h3), bold: true, color: COLORS.blue },
          paragraph: {
            spacing: { before: ptToTwips(SIZES.h3Before), after: ptToTwips(SIZES.h3After), line: 240 },
            keepNext: true,
            keepLines: true,
          },
        },
      },
      paragraphStyles: [
        {
          id: "TOC1",
          name: "toc 1",
          basedOn: "Normal",
          next: "Normal",
          run: { font: BODY, size: ptToHalfPoints(SIZES.tocEntry), color: COLORS.text },
          paragraph: { spacing: { before: 60, after: 60 } },
        },
        {
          id: "SommaireTitre",
          name: "Titre du sommaire",
          basedOn: "Normal",
          next: "Normal",
          run: { font: DISPLAY, size: ptToHalfPoints(SIZES.h1), bold: true, color: COLORS.navy },
          paragraph: { spacing: { after: ptToTwips(14) } },
        },
        {
          id: "Secondaire",
          name: "Texte secondaire",
          basedOn: "Normal",
          run: { size: ptToHalfPoints(SIZES.secondary), color: COLORS.muted },
          paragraph: { spacing: { after: 40 } },
        },
      ],
    },

    sections: [
      // --- Couverture : cadre de page, sans en-tete ni pied --------------------
      {
        properties: {
          page: {
            margin: pageMargins(),
            borders: pageBorders(),
          },
        },
        children: buildCover(model),
      },

      // --- Sommaire, memoire et annexes ----------------------------------------
      {
        properties: {
          page: {
            margin: pageMargins(),
            borders: pageBorders(),
            // La couverture compte comme page 1, comme dans le PDF.
            pageNumbers: { start: 2, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: buildHeader(model) },
        footers: { default: buildFooter(model) },
        children: [
          new Paragraph({ style: "SommaireTitre", text: "Sommaire" }),
          new TableOfContents("Sommaire", {
            hyperlink: true,
            headingStyleRange: "1-1",
            // Titres deja inscrits : lisibles meme avant la mise a jour des champs.
            cachedEntries: [
              ...model.sections.map((s) => ({ title: `${s.number}. ${s.title}`, level: 1 })),
              ...model.annexes.map((a, i) => ({ title: `Annexe ${i + 1} — ${a.title}`, level: 1 })),
            ],
          }),
          ...model.sections.flatMap((section, index) =>
            buildSection(section, index === 0, model.includeSources),
          ),
          ...model.annexes.flatMap((annex, index) => buildAnnex(annex, index)),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function pageMargins() {
  return {
    top: cmToTwips(PAGE.marginTopCm),
    bottom: cmToTwips(PAGE.marginBottomCm),
    left: cmToTwips(PAGE.marginLeftCm),
    right: cmToTwips(PAGE.marginRightCm),
    header: cmToTwips(PAGE.headerFromEdgeCm),
    footer: cmToTwips(PAGE.footerFromEdgeCm),
  };
}

/** Fin cadre bleu-gris, a distance du bord de la feuille. */
function pageBorders() {
  const border = {
    style: BorderStyle.SINGLE,
    size: Math.round(PAGE.borderWidthPt * 8),
    color: COLORS.border,
    space: PAGE.borderFromEdgePt,
  };
  return {
    pageBorders: {
      display: PageBorderDisplay.ALL_PAGES,
      offsetFrom: PageBorderOffsetFrom.PAGE,
      zOrder: PageBorderZOrder.BACK,
    },
    pageBorderTop: border,
    pageBorderBottom: border,
    pageBorderLeft: border,
    pageBorderRight: border,
  };
}

function buildCover(model: MemoryDocument): Array<Paragraph | Table> {
  const labelWidth = Math.round(CONTENT_WIDTH * 0.3);

  const infoTable = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [labelWidth, CONTENT_WIDTH - labelWidth],
    layout: TableLayoutType.FIXED,
    borders: {
      top: THIN,
      bottom: THIN,
      left: THIN,
      right: THIN,
      insideHorizontal: THIN,
      insideVertical: THIN,
    },
    rows: model.cover.rows.map(
      (row) =>
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: labelWidth, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: COLORS.sky, color: "auto" },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 140, bottom: 140, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { after: 0, line: 240 },
                  children: [
                    new TextRun({
                      text: row.label.toUpperCase(),
                      bold: true,
                      size: ptToHalfPoints(SIZES.coverLabel),
                      color: COLORS.navy,
                      characterSpacing: 8,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_WIDTH - labelWidth, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 140, bottom: 140, left: 180, right: 180 },
              children: [
                new Paragraph({
                  spacing: { after: 0, line: LINE },
                  children: [new TextRun({ text: row.value, size: ptToHalfPoints(SIZES.coverValue) })],
                }),
              ],
            }),
          ],
        }),
    ),
  });

  return [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0 },
      children: [
        new TextRun({
          text: model.cover.kicker.toUpperCase(),
          font: DISPLAY,
          bold: true,
          size: ptToHalfPoints(SIZES.coverCompany),
          color: COLORS.navy,
          characterSpacing: 12,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: ptToTwips(190), after: 0, line: 240 },
      children: [
        new TextRun({
          text: model.cover.title,
          font: DISPLAY,
          bold: true,
          size: ptToHalfPoints(SIZES.coverTitle),
          color: COLORS.navy,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: ptToTwips(10), after: 0, line: 280 },
      children: [
        new TextRun({
          text: model.cover.subtitle,
          font: DISPLAY,
          bold: true,
          size: ptToHalfPoints(SIZES.coverSubtitle),
          color: COLORS.blue,
        }),
      ],
    }),
    // Filet d'accent fin, seule touche de couleur chaude du document.
    new Paragraph({
      spacing: { before: ptToTwips(12), after: ptToTwips(30) },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.accent, space: 1 } },
      children: [],
    }),
    infoTable,
  ];
}

function buildHeader(model: MemoryDocument): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 },
        children: [
          new TextRun({ text: model.headerText, size: ptToHalfPoints(SIZES.header), color: COLORS.muted }),
        ],
      }),
    ],
  });
}

function buildFooter(model: MemoryDocument): Footer {
  const size = ptToHalfPoints(SIZES.footer);
  return new Footer({
    children: [
      new Paragraph({
        spacing: { after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        children: [
          new TextRun({ text: model.footerText, size, color: COLORS.muted }),
          new TextRun({ text: "\t", size }),
          new TextRun({ children: [PageNumber.CURRENT], size, color: COLORS.muted }),
          new TextRun({ text: " / ", size, color: COLORS.muted }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size, color: COLORS.muted }),
        ],
      }),
    ],
  });
}

function runsOf(runs: Run[], options: { size?: number; color?: string } = {}): TextRun[] {
  return runs.map(
    (run) =>
      new TextRun({
        text: run.text,
        bold: run.bold,
        size: options.size ? ptToHalfPoints(options.size) : undefined,
        color: options.color,
      }),
  );
}

function buildSection(
  section: DocumentSection,
  first: boolean,
  includeSources: boolean,
): Array<Paragraph | Table> {
  const out: Array<Paragraph | Table> = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      // Le memoire commence sur une nouvelle page ; les chapitres suivants
      // s'enchainent, sans page presque vide.
      pageBreakBefore: first,
      children: [new TextRun({ text: `${section.number}. ${section.title}` })],
    }),
  ];

  if (section.blocks.length === 0) {
    out.push(
      new Paragraph({
        children: [new TextRun({ text: "Chapitre non rédigé.", italics: true, color: COLORS.muted })],
      }),
    );
  }

  for (const block of section.blocks) out.push(...buildBlock(block));

  if (includeSources && section.sources.length > 0) {
    out.push(
      new Paragraph({
        style: "Secondaire",
        spacing: { before: 120, after: 20 },
        children: [new TextRun({ text: "Sources", bold: true })],
      }),
      ...section.sources.map((source) => new Paragraph({ style: "Secondaire", text: source })),
    );
  }

  return out;
}

function buildBlock(block: Block): Array<Paragraph | Table> {
  switch (block.type) {
    case "heading":
      return [
        new Paragraph({
          heading: block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.number ? `${block.number} ${block.text}` : block.text })],
        }),
      ];
    case "paragraph":
      return [new Paragraph({ children: runsOf(block.runs) })];
    case "bullets":
      return block.items.map(
        (item) =>
          new Paragraph({
            numbering: { reference: "puces", level: 0 },
            spacing: { after: 50 },
            children: runsOf(item),
          }),
      );
    case "table":
      return [
        buildTable(
          block.header,
          block.rows,
        ),
        spacer(),
      ];
    case "callout":
      return [buildCallout(block.title, block.runs), spacer()];
  }
}

const spacer = () => new Paragraph({ spacing: { after: 60, line: 120 }, children: [] });

/** Tableau natif : en-tete bleu nuit repete sur chaque page, lignes alternees. */
function buildTable(header: Run[][], rows: Run[][][]): Table {
  const fractions = columnWidths(
    header.map(runsText),
    rows.map((row) => row.map(runsText)),
  );
  const widths = fractions.map((f) => Math.round(f * CONTENT_WIDTH));
  const margins = {
    top: ptToTwips(SIZES.tableCellPaddingV),
    bottom: ptToTwips(SIZES.tableCellPaddingV),
    left: ptToTwips(SIZES.tableCellPaddingH),
    right: ptToTwips(SIZES.tableCellPaddingH),
  };

  const cell = (runs: Run[], width: number, head: boolean, fill: string) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      margins,
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          spacing: { after: 0, line: 252 },
          children: runs.map(
            (run) =>
              new TextRun({
                text: run.text,
                bold: head || run.bold,
                size: ptToHalfPoints(head ? SIZES.tableHeader : SIZES.table),
                color: head ? COLORS.white : COLORS.text,
              }),
          ),
        }),
      ],
    });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: {
      top: THIN,
      bottom: THIN,
      left: THIN,
      right: THIN,
      insideHorizontal: THIN,
      insideVertical: THIN,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: header.map((runs, i) => cell(runs, widths[i], true, COLORS.navy)),
      }),
      ...rows.map(
        (row, r) =>
          new TableRow({
            cantSplit: true,
            children: row.map((runs, c) =>
              cell(runs, widths[c], false, r % 2 === 0 ? COLORS.rowAlt : COLORS.white),
            ),
          }),
      ),
    ],
  });
}

/** Encadre sobre : fond bleu tres clair, filet bleu nuit a gauche. */
function buildCallout(title: string | null, runs: Run[]): Table {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    layout: TableLayoutType.FIXED,
    borders: {
      top: NONE,
      bottom: NONE,
      right: NONE,
      insideHorizontal: NONE,
      insideVertical: NONE,
      left: { style: BorderStyle.SINGLE, size: 20, color: COLORS.navy },
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: COLORS.sky, color: "auto" },
            margins: { top: 180, bottom: 180, left: 240, right: 240 },
            children: [
              ...(title
                ? [
                    new Paragraph({
                      spacing: { after: 40, line: 252 },
                      keepNext: true,
                      children: [
                        new TextRun({
                          text: title,
                          bold: true,
                          size: ptToHalfPoints(SIZES.calloutTitle),
                          color: COLORS.navy,
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                spacing: { after: 0, line: LINE },
                children: runsOf(runs, { size: SIZES.calloutText }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildAnnex(annex: DocumentAnnex, index: number): Array<Paragraph | Table> {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      // Les annexes commencent sur une nouvelle page, apres le memoire ; les
      // suivantes s'enchainent.
      pageBreakBefore: index === 0,
      children: [new TextRun({ text: `Annexe ${index + 1} — ${annex.title}` })],
    }),
    new Paragraph({ style: "Secondaire", spacing: { after: 160 }, text: annex.intro }),
    buildTable(
      annex.header.map((h) => [{ text: h, bold: true }]),
      annex.rows.map((row) => row.map((value) => [{ text: value, bold: false }])),
    ),
  ];
}

