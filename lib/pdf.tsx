import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { lehrwerkFuer } from "./curriculum";
import { lueckenLoesungen, normalize } from "./luecken";
import { notenschluesselText } from "./noten";
import type { Aufgabe, TestPaper } from "./schema";

// Dieses Modul wird nur dynamisch (beim Klick) geladen, damit @react-pdf nicht
// im SSR-/Initial-Bundle landet.

const BUCH = ["A", "B", "C", "D", "E", "F"];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.4,
  },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { fontSize: 9, color: "#444444", marginBottom: 2 },
  qItem: { marginTop: 12 },
  qHead: { flexDirection: "row", justifyContent: "space-between" },
  qText: { fontFamily: "Helvetica-Bold", flex: 1, paddingRight: 8 },
  points: { fontSize: 9, color: "#555555" },
  option: { marginLeft: 14, marginTop: 2 },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#bbbbbb",
    marginTop: 12,
    marginRight: 10,
  },
  note: {
    marginTop: 22,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    fontSize: 8,
    color: "#555555",
  },
  solTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  solItem: { marginBottom: 6, fontSize: 10 },
  bold: { fontFamily: "Helvetica-Bold" },
  grau: { color: "#555555" },
});

function QuestionView({
  a,
  i,
  benotet,
}: {
  a: Aufgabe;
  i: number;
  benotet: boolean;
}) {
  return (
    <View style={styles.qItem} wrap={false}>
      <View style={styles.qHead}>
        <Text style={styles.qText}>
          {i + 1}. {a.frage}
        </Text>
        {benotet && <Text style={styles.points}>({a.punkte} P)</Text>}
      </View>
      {a.typ === "multiple_choice" && a.optionen.length > 0 ? (
        a.optionen.map((o, k) => (
          <Text key={k} style={styles.option}>
            {BUCH[k]}) {o}
          </Text>
        ))
      ) : a.typ === "richtig_falsch" ? (
        <Text style={styles.option}>O Richtig O Falsch</Text>
      ) : lueckenLoesungen(a) ? null : (
        Array.from({ length: a.typ === "offen" ? 8 : 2 }).map((_, k) => (
          <View key={k} style={styles.line} />
        ))
      )}
    </View>
  );
}

function TestDocument({
  paper,
  mitLoesungen,
}: {
  paper: TestPaper;
  mitLoesungen: boolean;
}) {
  const gesamt = paper.aufgaben.reduce((s, a) => s + a.punkte, 0);
  const lehrwerk = lehrwerkFuer(paper.klasse, paper.fach);
  const benotet = paper.benotet !== false;
  return (
    <Document title={paper.titel}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{paper.titel}</Text>
        <Text style={styles.meta}>
          {paper.fach} · {paper.klasse}. Klasse · {paper.pruefungsart} · Thema:{" "}
          {paper.thema} · {paper.schwierigkeit}
        </Text>
        {lehrwerk && <Text style={styles.meta}>Lehrwerk: {lehrwerk}</Text>}
        <Text style={styles.meta}>
          {paper.aufgaben.length} Aufgaben
          {benotet ? ` · ${gesamt} Punkte` : ""} · Bearbeitungszeit:{" "}
          {paper.bearbeitungszeit}
        </Text>
        <Text style={[styles.meta, { marginBottom: 10 }]}>
          Name: ______________ Datum: __________
        </Text>
        {paper.aufgaben.map((a, i) => (
          <QuestionView key={i} a={a} i={i} benotet={benotet} />
        ))}
        {benotet && (
          <Text style={styles.note}>
            Notenschlüssel (Richtwert): {notenschluesselText(gesamt)}. Punkte des
            Tests; der genaue Schlüssel kann je nach Lehrkraft abweichen.
          </Text>
        )}
      </Page>

      {mitLoesungen && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.solTitle}>Lösungsschlüssel</Text>
          {paper.aufgaben.map((a, i) => (
            <View key={i} style={styles.solItem} wrap={false}>
              <Text>
                <Text style={styles.bold}>
                  {i + 1}. {a.typ === "multiple_choice" && a.optionen.length > 0
                    ? (() => {
                        const idx = a.optionen.findIndex(
                          (o) => normalize(o) === normalize(a.loesung),
                        );
                        return idx >= 0
                          ? `${BUCH[idx]}) ${a.loesung}`
                          : a.loesung;
                      })()
                    : a.loesung}
                </Text>
              </Text>
              <Text style={styles.grau}>{a.erklaerung}</Text>
            </View>
          ))}
        </Page>
      )}
    </Document>
  );
}

/** Erstellt die PDF und löst den Download im Browser aus. */
export async function downloadTestPdf(paper: TestPaper, mitLoesungen: boolean) {
  const blob = await pdf(
    <TestDocument paper={paper} mitLoesungen={mitLoesungen} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const name =
    (paper.titel || "Test").replace(/[^\wäöüÄÖÜß \-]+/g, "").trim().slice(0, 60) ||
    "Test";
  link.download = `${name}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
