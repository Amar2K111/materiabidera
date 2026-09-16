import "server-only";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { Block, Run } from "./export-blocks";
import {
  columnWidths,
  runsText,
  type DocumentAnnex,
  type DocumentSection,
  type MemoryDocument,
} from "@/lib/export/document";
import { COLORS, FONTS, PAGE, SIZES, cmToPt, hex } from "@/lib/export/theme";
import { INTER_400, INTER_400_ITALIC, INTER_600, INTER_700 } from "@/lib/export/fonts";
import { locateStarts, readPdfPages, type PageText } from "@/lib/export/pdf-text";

Font.register({
  family: FONTS.pdf.body,
  fonts: [
    { src: INTER_400, fontWeight: 400 },
    { src: INTER_400_ITALIC, fontWeight: 400, fontStyle: "italic" },
    { src: INTER_600, fontWeight: 600 },
    { src: INTER_700, fontWeight: 700 },
  ],
});

// Pas de cesure automatique : "organisa-tion" en fin de ligne gene la lecture
// d'un document remis a une commission.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Interligne PDF. Word applique son multiple (1,08) a l'interligne naturel de
 * la police (environ 1,2 fois sa taille) ; react-pdf l'applique directement a
 * la taille. On compense pour que les deux documents aient la meme densite.
 *
 * Attention : react-pdf 4.9 n'affiche plus un texte "render" (numero de page)
 * qui porte ou herite d'un lineHeight. L'interligne n'est donc jamais pose sur
 * la page, seulement sur les styles de texte courant.
 */
const LINE = SIZES.lineHeight * 1.2;

const MARGIN = {
  top: cmToPt(PAGE.marginTopCm),
  bottom: cmToPt(PAGE.marginBottomCm),
  left: cmToPt(PAGE.marginLeftCm),
  right: cmToPt(PAGE.marginRightCm),
};

const text = (size: number, extra: Style = {}): Style => ({
  fontFamily: FONTS.pdf.body,
  fontSize: size,
  lineHeight: LINE,
  color: hex(COLORS.text),
  ...extra,
});

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN.top,
    paddingBottom: MARGIN.bottom,
    paddingLeft: MARGIN.left,
    paddingRight: MARGIN.right,
    fontFamily: FONTS.pdf.body,
    fontSize: SIZES.body,
    color: hex(COLORS.text),
    backgroundColor: hex(COLORS.white),
  },
  border: {
    position: "absolute",
    top: PAGE.borderFromEdgePt,
    left: PAGE.borderFromEdgePt,
    right: PAGE.borderFromEdgePt,
    bottom: PAGE.borderFromEdgePt,
    borderWidth: PAGE.borderWidthPt,
    borderColor: hex(COLORS.border),
  },
  header: {
    position: "absolute",
    top: cmToPt(PAGE.headerFromEdgeCm),
    left: MARGIN.left,
    right: MARGIN.right,
    textAlign: "right",
    fontFamily: FONTS.pdf.body,
    fontSize: SIZES.header,
    color: hex(COLORS.muted),
  },
  footer: {
    position: "absolute",
    bottom: cmToPt(PAGE.footerFromEdgeCm),
    left: MARGIN.left,
    right: MARGIN.right,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: FONTS.pdf.body,
    fontSize: SIZES.footer,
    color: hex(COLORS.muted),
  },

  // --- Couverture -------------------------------------------------------------
  coverCompany: {
    textAlign: "right",
    fontFamily: FONTS.pdf.display,
    fontWeight: 700,
    fontSize: SIZES.coverCompany,
    letterSpacing: 0.6,
    color: hex(COLORS.navy),
  },
  coverTitleBlock: { marginTop: 190 },
  coverTitle: {
    fontFamily: FONTS.pdf.display,
    fontWeight: 700,
    fontSize: SIZES.coverTitle,
    color: hex(COLORS.navy),
    letterSpacing: 0.3,
  },
  coverSubtitle: text(SIZES.coverSubtitle, {
    fontWeight: 700,
    color: hex(COLORS.blue),
    marginTop: 10,
    lineHeight: 1.25,
  }),
  coverAccent: {
    marginTop: 18,
    height: 1.5,
    backgroundColor: hex(COLORS.accent),
  },
  coverTable: {
    marginTop: 30,
    borderTopWidth: 0.75,
    borderLeftWidth: 0.75,
    borderColor: hex(COLORS.border),
  },
  coverRow: { flexDirection: "row" },
  coverLabel: {
    width: "30%",
    paddingVertical: 7,
    paddingHorizontal: 9,
    backgroundColor: hex(COLORS.sky),
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: hex(COLORS.border),
  },
  coverLabelText: text(SIZES.coverLabel, {
    fontWeight: 700,
    color: hex(COLORS.navy),
    letterSpacing: 0.4,
  }),
  coverValue: {
    width: "70%",
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: hex(COLORS.border),
  },
  coverValueText: text(SIZES.coverValue),

  // --- Sommaire ---------------------------------------------------------------
  tocTitle: {
    fontFamily: FONTS.pdf.display,
    fontWeight: 700,
    fontSize: SIZES.h1,
    color: hex(COLORS.navy),
    marginBottom: 16,
  },
  // Meme presentation que le sommaire Word : titre, points de conduite, page.
  tocRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
  tocLabel: text(SIZES.tocEntry, { maxWidth: "88%" }),
  tocLeader: {
    flex: 1,
    marginHorizontal: 3,
    marginBottom: 3,
    borderBottomWidth: 0.9,
    borderBottomStyle: "dotted",
    borderBottomColor: hex(COLORS.text),
  },
  tocPage: {
    textAlign: "right",
    fontFamily: FONTS.pdf.body,
    fontSize: SIZES.tocEntry,
    color: hex(COLORS.text),
  },

  // --- Contenu ----------------------------------------------------------------
  h1: {
    fontFamily: FONTS.pdf.display,
    fontWeight: 700,
    fontSize: SIZES.h1,
    color: hex(COLORS.navy),
    marginTop: SIZES.h1Before + 6,
    marginBottom: SIZES.h1After,
  },
  h2: text(SIZES.h2, {
    fontWeight: 700,
    color: hex(COLORS.blue),
    marginTop: SIZES.h2Before,
    marginBottom: SIZES.h2After,
    lineHeight: 1.25,
  }),
  h3: text(SIZES.h3, {
    fontWeight: 700,
    color: hex(COLORS.blue),
    marginTop: SIZES.h3Before,
    marginBottom: SIZES.h3After,
    lineHeight: 1.25,
  }),
  paragraph: text(SIZES.body, { marginBottom: SIZES.paragraphAfter }),
  bold: { fontWeight: 700, color: hex(COLORS.text) },
  bulletList: { marginBottom: SIZES.paragraphAfter },
  bulletRow: { flexDirection: "row", marginBottom: 2.5, paddingLeft: 4 },
  bulletDot: text(SIZES.body, { width: 12, color: hex(COLORS.blue), fontWeight: 700 }),
  bulletText: text(SIZES.body, { flex: 1 }),

  table: {
    marginTop: 3,
    marginBottom: SIZES.paragraphAfter + 5,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: hex(COLORS.border),
  },
  tableRow: { flexDirection: "row" },
  tableCell: {
    // Contenu centre verticalement, comme dans Word.
    justifyContent: "center",
    paddingVertical: SIZES.tableCellPaddingV,
    paddingHorizontal: SIZES.tableCellPaddingH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: hex(COLORS.border),
  },
  tableHeadCell: { backgroundColor: hex(COLORS.navy), borderColor: hex(COLORS.navy) },
  tableHeadText: text(SIZES.tableHeader, { fontWeight: 700, color: hex(COLORS.white), lineHeight: 1.25 }),
  tableText: text(SIZES.table, { lineHeight: 1.3 }),

  callout: {
    marginTop: 4,
    marginBottom: SIZES.paragraphAfter + 5,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: hex(COLORS.sky),
    borderLeftWidth: 2.5,
    borderLeftColor: hex(COLORS.navy),
  },
  calloutTitle: text(SIZES.calloutTitle, { fontWeight: 700, color: hex(COLORS.navy), marginBottom: 2 }),
  calloutText: text(SIZES.calloutText),

  annexIntro: text(SIZES.secondary, { color: hex(COLORS.muted), marginBottom: 8 }),
  sources: { marginTop: 6, marginBottom: 4 },
  sourcesTitle: text(SIZES.secondary, { fontWeight: 700, color: hex(COLORS.muted) }),
  source: text(SIZES.secondary - 0.5, { color: hex(COLORS.muted) }),
});

export type PdfBuild = {
  bytes: Buffer;
  pages: PageText[];
  starts: Record<string, number>;
};

/**
 * Deux passes. La premiere produit le document avec un sommaire sans numeros ;
 * le PDF obtenu est relu pour y trouver la page reelle de chaque chapitre. La
 * seconde inscrit ces pages au sommaire, qui garde la meme longueur : la
 * pagination ne bouge pas. Les pages sont lues dans le fichier lui-meme, pas
 * deduites pendant la mise en page (react-pdf peut deplacer ou perdre un
 * contenu dynamique lors d'un saut de page).
 */
export async function buildPdf(model: MemoryDocument): Promise<PdfBuild> {
  const draft = await renderToBuffer(<MemoryPdf model={model} starts={{}} />);
  const starts = locateStarts(await readPdfPages(new Uint8Array(draft)), model);
  const bytes = await renderToBuffer(<MemoryPdf model={model} starts={starts} />);
  const pages = await readPdfPages(new Uint8Array(bytes));
  return { bytes, pages, starts: locateStarts(pages, model) };
}

function MemoryPdf({
  model,
  starts,
}: {
  model: MemoryDocument;
  starts: Record<string, number>;
}) {
  const tocEntries = [
    ...model.sections.map((s, i) => ({ key: `s${i}`, number: s.number, title: s.title })),
    ...model.annexes.map((a, i) => ({ key: `a${i}`, number: "", title: `Annexe ${i + 1} — ${a.title}` })),
  ];

  return (
    <Document title={model.title} author={model.companyName} creator={model.companyName} producer={model.companyName}>
      {/* --- Couverture --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.border} fixed />
        <Text style={styles.coverCompany}>{model.cover.kicker.toUpperCase()}</Text>
        <View style={styles.coverTitleBlock}>
          <Text style={styles.coverTitle}>{model.cover.title}</Text>
          <Text style={styles.coverSubtitle}>{model.cover.subtitle}</Text>
          <View style={styles.coverAccent} />
        </View>
        <View style={styles.coverTable}>
          {model.cover.rows.map((row) => (
            <View key={row.label} style={styles.coverRow} wrap={false}>
              <View style={styles.coverLabel}>
                <Text style={styles.coverLabelText}>{row.label.toUpperCase()}</Text>
              </View>
              <View style={styles.coverValue}>
                <Text style={styles.coverValueText}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* --- Sommaire --- */}
      <Page size="A4" style={styles.page}>
        <PageFrame model={model} />
        <Text style={styles.tocTitle}>Sommaire</Text>
        {tocEntries.map((entry) => (
          <View key={entry.key} style={styles.tocRow} wrap={false}>
            <Text style={styles.tocLabel}>
              {entry.number ? `${entry.number}. ` : ""}
              {entry.title}
            </Text>
            <View style={styles.tocLeader} />
            <Text style={styles.tocPage}>{starts[entry.key] ?? ""}</Text>
          </View>
        ))}
      </Page>

      {/* --- Chapitres : a la suite, sans page presque vide entre eux --- */}
      <Page size="A4" style={styles.page}>
        <PageFrame model={model} />
        {model.sections.map((section, i) => (
          <SectionView key={i} section={section} includeSources={model.includeSources} />
        ))}
      </Page>

      {/* --- Annexes : a part, apres le memoire --- */}
      {model.annexes.length > 0 ? (
        <Page size="A4" style={styles.page}>
          <PageFrame model={model} />
          {model.annexes.map((annex, i) => (
            <AnnexView key={i} index={i} annex={annex} />
          ))}
        </Page>
      ) : null}
    </Document>
  );
}

/** Cadre, en-tete et pied de page des pages de contenu. */
function PageFrame({ model }: { model: MemoryDocument }) {
  return (
    <>
      <View style={styles.border} fixed />
      <Text style={styles.header} fixed>
        {model.headerText}
      </Text>
      <View style={styles.footer} fixed>
        <Text style={{ flex: 1, paddingRight: 16 }}>{model.footerText}</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

function RunsText({ runs, style }: { runs: Run[]; style: Style }) {
  return (
    <Text style={style}>
      {runs.map((run, i) =>
        run.bold ? (
          <Text key={i} style={styles.bold}>
            {run.text}
          </Text>
        ) : (
          run.text
        ),
      )}
    </Text>
  );
}

function SectionView({
  section,
  includeSources,
}: {
  section: DocumentSection;
  includeSources: boolean;
}) {
  return (
    <View>
      {/* Titre statique (jamais "render") : il ne reste pas seul en bas de page. */}
      <Text style={styles.h1} minPresenceAhead={70}>
        {section.number}. {section.title}
      </Text>
      {section.blocks.length === 0 ? (
        <Text style={[styles.paragraph, { color: hex(COLORS.muted), fontStyle: "italic" }]}>
          Chapitre non rédigé.
        </Text>
      ) : (
        section.blocks.map((block, i) => <BlockView key={i} block={block} />)
      )}
      {includeSources && section.sources.length > 0 ? (
        <View style={styles.sources} wrap={false}>
          <Text style={styles.sourcesTitle}>Sources</Text>
          {section.sources.map((source, i) => (
            <Text key={i} style={styles.source}>
              {source}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <Text style={block.level === 2 ? styles.h2 : styles.h3} minPresenceAhead={40}>
          {block.number ? `${block.number} ` : ""}
          {block.text}
        </Text>
      );
    case "paragraph":
      return <RunsText runs={block.runs} style={styles.paragraph} />;
    case "bullets":
      return (
        <View style={styles.bulletList}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bulletDot}>•</Text>
              <RunsText runs={item} style={styles.bulletText} />
            </View>
          ))}
        </View>
      );
    case "table":
      return (
        <TableView
          header={block.header.map(runsText)}
          headerRuns={block.header}
          rows={block.rows}
        />
      );
    case "callout":
      return (
        <View style={styles.callout} wrap={false}>
          {block.title ? <Text style={styles.calloutTitle}>{block.title}</Text> : null}
          <RunsText runs={block.runs} style={styles.calloutText} />
        </View>
      );
  }
}

function TableView({
  header,
  headerRuns,
  rows,
}: {
  header: string[];
  headerRuns: Run[][];
  rows: Run[][][];
}) {
  const widths = columnWidths(
    header,
    rows.map((row) => row.map(runsText)),
  );
  return (
    <>
    {/* Le tableau ne commence pas en bas de page avec son seul en-tete : il
        faut la place de l'en-tete et d'une premiere ligne. */}
    <View minPresenceAhead={72} />
    <View style={styles.table}>
      {/* La ligne d'en-tete est repetee en haut de chaque page du tableau. */}
      <View style={styles.tableRow} fixed>
        {headerRuns.map((cell, i) => (
          <View key={i} style={[styles.tableCell, styles.tableHeadCell, { width: `${widths[i] * 100}%` }]}>
            <Text style={styles.tableHeadText}>{runsText(cell)}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View
          key={r}
          style={[styles.tableRow, { backgroundColor: hex(r % 2 === 0 ? COLORS.rowAlt : COLORS.white) }]}
          wrap={false}
        >
          {row.map((cell, c) => (
            <View key={c} style={[styles.tableCell, { width: `${widths[c] * 100}%` }]}>
              <RunsText runs={cell} style={styles.tableText} />
            </View>
          ))}
        </View>
      ))}
    </View>
    </>
  );
}

function AnnexView({ annex, index }: { annex: DocumentAnnex; index: number }) {
  return (
    <View style={index > 0 ? { marginTop: 18 } : undefined}>
      <Text style={styles.h1} minPresenceAhead={70}>
        Annexe {index + 1} — {annex.title}
      </Text>
      <Text style={styles.annexIntro}>{annex.intro}</Text>
      <TableView
        header={annex.header}
        headerRuns={annex.header.map((h) => [{ text: h, bold: true }])}
        rows={annex.rows.map((row) => row.map((cell) => [{ text: cell, bold: false }]))}
      />
    </View>
  );
}
