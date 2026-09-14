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
import type { StyleProp } from "@react-pdf/types";
import type { ExportPayload, ExportSection } from "./export-docx";
import { chapterNumber, parseBlocks, type Run } from "./export-blocks";

const BRAND = "#0035A9";
const BRAND_WASH = "#EEF2FB";
const INK = "#0B1220";
const TEXT = "#27303F";
const MUTED = "#6B7280";
const LINE = "#E4E8EF";

// Pas de cesure automatique : "organisa-tion" en fin de ligne gene la lecture
// d'un document remis a une commission.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Le PDF reprend la meme structure et la meme charte que le document Word :
 * couverture, sommaire pagine, chapitres numerotes, en-tete et pied de page.
 * Les deux documents sont produits a partir du meme contenu.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 70,
    paddingHorizontal: 60,
    fontSize: 10.5,
    // Pas d'interligne ici : react-pdf 4.9 n'affiche plus un texte "render"
    // (numero de page, numero de chapitre) qui herite d'un lineHeight. Il est
    // donc porte par les styles de texte courant.
    color: TEXT,
    fontFamily: "Helvetica",
  },

  // --- Couverture ------------------------------------------------------------
  cover: { fontFamily: "Helvetica", color: INK, padding: 0 },
  coverBand: { height: 10, backgroundColor: BRAND },
  coverBody: { flexGrow: 1, paddingHorizontal: 60, paddingTop: 150 },
  coverOrg: {
    fontSize: 11,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
  },
  coverRule: { width: 48, height: 3, backgroundColor: BRAND, marginTop: 18, marginBottom: 26 },
  coverKicker: { fontSize: 12, color: MUTED, marginBottom: 6 },
  coverTitle: { fontSize: 34, fontFamily: "Helvetica-Bold", color: INK, lineHeight: 1.15 },
  coverProject: { fontSize: 15, color: TEXT, marginTop: 12, lineHeight: 1.4, maxWidth: 420 },
  coverFacts: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  coverFact: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  coverFactLabel: { width: 150, fontSize: 9.5, color: MUTED },
  coverFactValue: { flex: 1, fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK },
  coverFoot: {
    paddingHorizontal: 60,
    paddingVertical: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED,
    backgroundColor: BRAND_WASH,
  },

  // --- Cadre des pages -------------------------------------------------------
  header: {
    position: "absolute",
    top: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
    fontSize: 8,
    color: MUTED,
  },
  headerOrg: { fontFamily: "Helvetica-Bold", color: BRAND },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },

  // --- Sommaire --------------------------------------------------------------
  tocKicker: { fontSize: 9, color: BRAND, fontFamily: "Helvetica-Bold", letterSpacing: 1.2 },
  tocTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", color: INK, marginTop: 4, marginBottom: 24 },
  tocRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
  },
  tocNumber: { width: 36, fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND },
  tocLabel: { flex: 1, fontSize: 11, color: INK, paddingRight: 16 },
  tocPage: { width: 30, textAlign: "right", fontSize: 10, color: MUTED },

  // --- Chapitres -------------------------------------------------------------
  chapterHead: { marginBottom: 20 },
  chapterNumber: { fontSize: 30, fontFamily: "Helvetica-Bold", color: BRAND },
  chapterTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: INK, marginTop: 8, lineHeight: 1.25 },
  chapterRule: { width: 40, height: 2.5, backgroundColor: BRAND, marginTop: 12 },

  subheading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: { marginBottom: 9, textAlign: "justify", fontSize: 10.5, lineHeight: 1.55 },
  bold: { fontFamily: "Helvetica-Bold", color: INK },
  bulletList: { marginBottom: 10, marginTop: 1 },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { width: 14, color: BRAND, fontFamily: "Helvetica-Bold", fontSize: 10.5, lineHeight: 1.55 },
  bulletText: { flex: 1, fontSize: 10.5, lineHeight: 1.55 },
  empty: { color: MUTED, fontStyle: "italic" },

  table: {
    marginTop: 2,
    marginBottom: 12,
    borderWidth: 0.75,
    borderColor: LINE,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
  },
  tableHeadRow: { backgroundColor: BRAND },
  tableRowAlt: { backgroundColor: "#F7F9FC" },
  tableCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9,
    lineHeight: 1.35,
  },
  tableHeadCell: { fontFamily: "Helvetica-Bold", color: "#FFFFFF" },

  sources: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#F7F9FC",
    borderLeftWidth: 2,
    borderLeftColor: LINE,
  },
  sourcesTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: MUTED, marginBottom: 4 },
  source: { fontSize: 8, lineHeight: 1.45, color: MUTED, marginBottom: 1.5 },
});

export async function buildPdf(payload: ExportPayload): Promise<Buffer> {
  // Deux passes : la premiere releve la page ou commence chaque chapitre, la
  // seconde l'inscrit au sommaire. Le sommaire ne change pas de longueur entre
  // les deux, la pagination reste donc identique.
  const starts: Record<number, number> = {};
  await renderToBuffer(<MemoryDocument payload={payload} starts={starts} />);
  return renderToBuffer(<MemoryDocument payload={payload} starts={{ ...starts }} />);
}

function MemoryDocument({
  payload,
  starts,
}: {
  payload: ExportPayload;
  starts: Record<number, number>;
}) {
  const facts: Array<[string, string | null]> = [
    ["Maître d'ouvrage / acheteur", payload.buyer],
    ["Lot", payload.lot],
    ["Référence de la consultation", payload.reference],
    ["Date limite de remise", payload.deadline],
  ];

  return (
    <Document
      title={`Mémoire technique — ${payload.projectName}`}
      author={payload.organizationName}
    >
      {/* --- Couverture --- */}
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverBand} />
        <View style={styles.coverBody}>
          <Text style={styles.coverOrg}>{payload.organizationName.toUpperCase()}</Text>
          <View style={styles.coverRule} />
          <Text style={styles.coverKicker}>Offre technique</Text>
          <Text style={styles.coverTitle}>Mémoire technique</Text>
          <Text style={styles.coverProject}>{payload.projectName}</Text>

          <View style={styles.coverFacts}>
            {facts.map(([label, value]) =>
              // Une information absente n'est pas remplacee par une mention inventee.
              value ? (
                <View key={label} style={styles.coverFact}>
                  <Text style={styles.coverFactLabel}>{label}</Text>
                  <Text style={styles.coverFactValue}>{value}</Text>
                </View>
              ) : null,
            )}
          </View>
        </View>
        <View style={styles.coverFoot}>
          <Text>Document établi par {payload.organizationName}</Text>
          <Text>{payload.issuedOn}</Text>
        </View>
      </Page>

      {/* --- Sommaire --- */}
      <Page size="A4" style={styles.page}>
        <PageFrame payload={payload} />
        <Text style={styles.tocKicker}>MÉMOIRE TECHNIQUE</Text>
        <Text style={styles.tocTitle}>Sommaire</Text>
        {payload.sections.map((section, i) => (
          <View key={i} style={styles.tocRow} wrap={false}>
            <Text style={styles.tocNumber}>{chapterNumber(section.number, i)}</Text>
            <Text style={styles.tocLabel}>{section.title}</Text>
            <Text style={styles.tocPage}>{starts[i] ?? ""}</Text>
          </View>
        ))}
      </Page>

      {/* --- Chapitres, chacun sur une nouvelle page --- */}
      {payload.sections.map((section, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <PageFrame payload={payload} />
          <SectionBody
            section={section}
            index={i}
            includeSources={payload.includeSources}
            onStart={(page) => {
              starts[i] = page;
            }}
          />
        </Page>
      ))}
    </Document>
  );
}

function RunsText({
  runs,
  style,
}: {
  runs: Run[];
  style?: StyleProp;
}) {
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

function SectionBody({
  section,
  index,
  includeSources,
  onStart,
}: {
  section: ExportSection;
  index: number;
  includeSources: boolean;
  onStart: (page: number) => void;
}) {
  const blocks = parseBlocks(section.content);

  return (
    <View>
      <View style={styles.chapterHead} wrap={false}>
        <Text
          style={styles.chapterNumber}
          render={({ pageNumber }) => {
            onStart(pageNumber);
            return chapterNumber(section.number, index);
          }}
        />
        <Text style={styles.chapterTitle}>{section.title}</Text>
        <View style={styles.chapterRule} />
      </View>

      {blocks.length === 0 ? (
        <Text style={[styles.paragraph, styles.empty]}>Chapitre non rédigé.</Text>
      ) : (
        blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <Text key={i} style={styles.subheading} minPresenceAhead={40}>
                {block.text}
              </Text>
            );
          }
          if (block.type === "table") {
            return (
              <View key={i} style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeadRow]} wrap={false}>
                  {block.header.map((cell, j) => (
                    <RunsText key={j} runs={cell} style={[styles.tableCell, styles.tableHeadCell]} />
                  ))}
                </View>
                {block.rows.map((row, j) => (
                  <View
                    key={j}
                    style={[styles.tableRow, j % 2 === 1 ? styles.tableRowAlt : {}]}
                    wrap={false}
                  >
                    {row.map((cell, k) => (
                      <RunsText key={k} runs={cell} style={styles.tableCell} />
                    ))}
                  </View>
                ))}
              </View>
            );
          }
          if (block.type === "bullets") {
            return (
              <View key={i} style={styles.bulletList}>
                {block.items.map((item, j) => (
                  <View key={j} style={styles.bulletRow} wrap={false}>
                    <Text style={styles.bulletDot}>•</Text>
                    <RunsText runs={item} style={styles.bulletText} />
                  </View>
                ))}
              </View>
            );
          }
          return <RunsText key={i} runs={block.runs} style={styles.paragraph} />;
        })
      )}

      {includeSources && section.sources.length > 0 ? (
        <View style={styles.sources} wrap={false}>
          <Text style={styles.sourcesTitle}>SOURCES</Text>
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

/** En-tete et pied de page, repetes sur chaque page du corps du document. */
function PageFrame({ payload }: { payload: ExportPayload }) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text style={styles.headerOrg}>{payload.organizationName}</Text>
        <Text>Mémoire technique</Text>
      </View>
      <View style={styles.footer} fixed>
        <Text style={{ flex: 1, paddingRight: 20 }}>
          {payload.projectName.length > 90
            ? `${payload.projectName.slice(0, 88)}…`
            : payload.projectName}
        </Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}
