import "server-only";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ExportPayload, ExportSection } from "./export-docx";

const BRAND = "#0035A9";
const INK = "#000000";
const MUTED = "#666666";
const LINE = "#E0E0E0";

/**
 * Le PDF reprend la meme structure et la meme charte que le document Word :
 * couverture, sommaire, chapitres numerotes, pied de page pagine. Les deux
 * documents sont produits a partir du meme contenu, sans conversion de l'un
 * vers l'autre.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10.5,
    lineHeight: 1.6,
    color: INK,
    fontFamily: "Helvetica",
  },
  cover: {
    paddingTop: 200,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    color: INK,
  },
  coverOrg: {
    fontSize: 11,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 28,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  coverProject: { fontSize: 14, color: INK, marginBottom: 40 },
  coverFact: { fontSize: 10, marginBottom: 4 },
  coverFactLabel: { fontFamily: "Helvetica-Bold" },

  header: {
    position: "absolute",
    top: 24,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },

  tocTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginBottom: 14,
  },
  tocRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 5,
  },
  tocNumber: { width: 34, fontFamily: "Helvetica-Bold", color: MUTED },

  sectionTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginBottom: 12,
  },
  paragraph: { marginBottom: 9, textAlign: "justify" },
  empty: { color: MUTED, fontStyle: "italic" },

  sourcesTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 5,
  },
  source: { fontSize: 8.5, color: MUTED, marginBottom: 2 },
});

export async function buildPdf(payload: ExportPayload): Promise<Buffer> {
  return renderToBuffer(<MemoryDocument payload={payload} />);
}

function MemoryDocument({ payload }: { payload: ExportPayload }) {
  const facts: Array<[string, string | null]> = [
    ["Reference", payload.reference],
    ["Acheteur", payload.buyer],
    ["Lot", payload.lot],
    ["Date limite de remise", payload.deadline],
  ];

  return (
    <Document
      title={`Memoire technique — ${payload.projectName}`}
      author={payload.organizationName}
    >
      {/* --- Couverture --- */}
      <Page size="A4" style={styles.cover}>
        <Text style={styles.coverOrg}>
          {payload.organizationName.toUpperCase()}
        </Text>
        <Text style={styles.coverTitle}>Memoire technique</Text>
        <Text style={styles.coverProject}>{payload.projectName}</Text>

        {facts.map(([label, value]) =>
          // Une information absente n'est pas remplacee par une mention inventee.
          value ? (
            <Text key={label} style={styles.coverFact}>
              <Text style={styles.coverFactLabel}>{label} : </Text>
              {value}
            </Text>
          ) : null,
        )}
      </Page>

      {/* --- Sommaire --- */}
      <Page size="A4" style={styles.page}>
        <PageFurniture payload={payload} />
        <Text style={styles.tocTitle}>Sommaire</Text>
        {payload.sections.map((section, i) => (
          <View key={i} style={styles.tocRow}>
            <Text style={styles.tocNumber}>{section.number ?? i + 1}</Text>
            <Text>{section.title}</Text>
          </View>
        ))}
      </Page>

      {/* --- Chapitres, un par page --- */}
      {payload.sections.map((section, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <PageFurniture payload={payload} />
          <SectionBody
            section={section}
            index={i}
            includeSources={payload.includeSources}
          />
        </Page>
      ))}
    </Document>
  );
}

function SectionBody({
  section,
  index,
  includeSources,
}: {
  section: ExportSection;
  index: number;
  includeSources: boolean;
}) {
  const content = (section.content ?? "").trim();
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <View>
      <Text style={styles.sectionTitle}>
        {[section.number ?? String(index + 1), section.title]
          .filter(Boolean)
          .join(" — ")}
      </Text>

      {paragraphs.length === 0 ? (
        <Text style={[styles.paragraph, styles.empty]}>
          Chapitre non redige.
        </Text>
      ) : (
        paragraphs.map((text, i) => (
          <Text key={i} style={styles.paragraph}>
            {text}
          </Text>
        ))
      )}

      {includeSources && section.sources.length > 0 ? (
        <View>
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

function PageFurniture({ payload }: { payload: ExportPayload }) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text>{payload.organizationName}</Text>
        <Text>{payload.projectName}</Text>
      </View>
      <Text
        style={styles.footer}
        fixed
        render={({ pageNumber, totalPages }) =>
          `Memoire technique — ${payload.lot ?? payload.projectName} — page ${pageNumber} sur ${totalPages}`
        }
      />
    </>
  );
}
