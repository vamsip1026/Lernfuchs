import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AUFGABENFORMATE, lehrwerkFuer, PRUEFUNGSARTEN } from "./curriculum";
import {
  type AnswerToGrade,
  type GenerateRequest,
  type GradeResult,
  type Inhalt,
  type SubtopicRequest,
  SubtopicResultSchema,
  type TestPaper,
  TestPaperSchema,
  GradeResponseSchema,
} from "./schema";

// Standardmodell. Günstigere Alternative für diesen Anwendungsfall:
// claude-sonnet-5-5 (ca. 5x günstiger, für Schulaufgaben völlig ausreichend).
// Über die Umgebungsvariable ANTHROPIC_MODEL überschreibbar.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

/** Lazily instanziierter Client – liest ANTHROPIC_API_KEY aus der Umgebung. */
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY ist nicht gesetzt. Lege eine .env.local mit deinem " +
        "API-Schlüssel an (siehe README).",
    );
  }
  return new Anthropic();
}

function pruefungsart(value: string) {
  return (
    PRUEFUNGSARTEN.find((p) => p.value === value) ?? PRUEFUNGSARTEN[0]
  );
}

function formatHinweis(value: string): string {
  if (value === "automatisch") {
    return "Wähle die Aufgabenformate passend zur Prüfungsart und zum Fach (sinnvolle Mischung aus Multiple Choice, Kurzantwort, Rechenaufgaben, Lückentext, Richtig/Falsch und – bei langen offenen Aufgaben – 'offen').";
  }
  const label =
    AUFGABENFORMATE.find((f) => f.value === value)?.label ?? value;
  return `Verwende ausschließlich Aufgaben vom Typ "${label}" (${value}).`;
}

/** Kurze, lesbare Zusammenfassung des Umfangs (für Titelzeile/Verlauf/PDF). */
export function inhalteSummary(inhalte: Inhalt[]): string {
  return inhalte
    .map((i) =>
      i.unterthemen.length > 0
        ? `${i.thema} (nur: ${i.unterthemen.join(", ")})`
        : i.thema,
    )
    .join("; ");
}

/** Mehrzeiliger Inhalts-Block für den Prompt. */
function inhalteBlock(inhalte: Inhalt[]): string {
  return inhalte
    .map((i) =>
      i.unterthemen.length > 0
        ? `- ${i.thema} – nur die Teilaspekte: ${i.unterthemen.join(", ")}`
        : `- ${i.thema} (gesamtes Thema)`,
    )
    .join("\n");
}

function buildPrompt(req: GenerateRequest): string {
  const art = pruefungsart(req.pruefungsart);
  const lehrwerk = lehrwerkFuer(req.klasse, req.fach);

  return [
    `Erstelle einen Test für einen Schüler am Gymnasium in Bayern.`,
    `Orientiere dich am bayerischen LehrplanPLUS für die jeweilige Jahrgangsstufe.`,
    ``,
    `Vorgaben:`,
    `- Klasse / Jahrgangsstufe: ${req.klasse}`,
    `- Fach: ${req.fach}`,
    `- Prüfungsart: ${art.label}`,
    `- Schwierigkeitsgrad: ${req.schwierigkeit}`,
    `- Umfang: ${art.fragen}`,
    ``,
    `Zu behandelnde Inhalte:`,
    inhalteBlock(req.inhalte),
    `Verteile die Aufgaben sinnvoll über alle genannten Inhalte. Bei "nur die Teilaspekte" bleibe strikt bei diesen Teilaspekten. Bei einer Schulaufgabe müssen alle genannten Inhalte vorkommen. Der Titel ("titel") soll den Umfang widerspiegeln.`,
    ...(lehrwerk
      ? [
          `- Verwendetes Schulbuch: ${lehrwerk}. Orientiere dich bei Begriffen, Schreibweisen, Reihenfolge und Schwerpunkten an diesem Lehrwerk.`,
        ]
      : []),
    ``,
    `Charakter der Prüfungsart: ${art.hinweis}`,
    `Aufgabenformat: ${formatHinweis(req.aufgabenformat)}`,
    ``,
    `Anforderungen an jede Aufgabe:`,
    `- Formuliere die Frage klar, altersgerecht und fachlich korrekt.`,
    `- Gib die korrekte Lösung an (bei Multiple Choice exakt den Text der richtigen Antwortmöglichkeit, bei Richtig/Falsch "Richtig" oder "Falsch").`,
    `- Bei Multiple Choice: genau 4 plausible Antwortmöglichkeiten im Feld "optionen" (sonst leeres Array). WICHTIG: Variiere die Position der richtigen Antwort – sie soll nicht immer an Position 1 stehen. Verteile korrekte Antworten gleichmäßig über alle Positionen (1, 2, 3, 4).`,
    `- Gib eine kurze, verständliche Erklärung des Lösungswegs.`,
    `- Vergib eine sinnvolle Punktzahl pro Aufgabe (bei einer Schulaufgabe insgesamt eine höhere Gesamtpunktzahl).`,
    ``,
    `Bei Chemie-Aufgaben:`,
    `- Verwende korrekte chemische Notation mit Vorzeichen und Ladungen.`,
    `- Ionen mit hochgestellten Ladungen: z. B. Cl⁻, Ca²⁺, SO₄²⁻, Fe³⁺.`,
    `- Oxidationszahlen immer mit Vorzeichen: z. B. -2, +3, -1.`,
    `- Negative Temperaturen und Werte mit Minuszeichen: z. B. -273 °C, -114 kJ/mol.`,
    `- Halte dich an die Notation des Lehrbuchs "Galvani".`,
    ``,
    `Lückentext (Typ "lueckentext"): Markiere jede Lücke im Aufgabentext mit genau "___" (drei Unterstriche). Jede Lücke nimmt genau ein Wort bzw. einen kurzen Ausdruck auf – bei zweiteiligen Formen (z. B. "ne ... jamais") zwei getrennte Lücken. Fülle "luecken" mit genau einem Eintrag pro Lücke in derselben Reihenfolge; jeder Eintrag listet alle akzeptierten Schreibweisen (z. B. ["n'", "ne"]). "loesung" enthält zusätzlich die vollständige Lösung als lesbaren Text. Bei mehreren Teilsätzen steht jeder Teilsatz in einer eigenen Zeile (Zeilenumbruch "\\n").`,
    ``,
    `Lange, offene Aufgaben (Aufsatz, Erörterung, offene Sachaufgabe) als Typ "offen": Dort enthält "loesung" einen Erwartungshorizont bzw. eine Musterlösung und "erklaerung" die Bewertungskriterien.`,
    ``,
    `Gib außerdem eine passende empfohlene Bearbeitungszeit im Feld "bearbeitungszeit" an.`,
    ``,
    `Sprache: Antworte auf Deutsch. Ausnahme: Bei Fremdsprachen (Englisch, Französisch, Latein) stelle die Aufgaben in bzw. passend zur jeweiligen Zielsprache.`,
  ].join("\n");
}

/** Generiert einen Test über die Claude API (strukturierte Ausgabe). */
export async function generateTestPaper(
  req: GenerateRequest,
): Promise<TestPaper> {
  const client = getClient();

  // Strukturierte Ausgabe über die Beta-API (SDK 0.70.x). `parse` fügt den
  // Beta-Header automatisch hinzu und validiert gegen das Zod-Schema.
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: "user", content: buildPrompt(req) }],
    output_format: betaZodOutputFormat(TestPaperSchema),
  });

  const paper = response.parsed_output;
  if (!paper) {
    throw new Error(
      "Die Antwort konnte nicht als gültiger Test interpretiert werden. Bitte erneut versuchen.",
    );
  }
  // Thema deterministisch als Umfangs-Zusammenfassung setzen (Header/Verlauf/PDF).
  paper.thema = inhalteSummary(req.inhalte);
  // Übungsblatt ist kein benoteter Leistungsnachweis → keine Punkte/Note.
  paper.benotet = req.pruefungsart !== "uebungsblatt";
  return paper;
}

/** Schlägt konkrete Unterthemen zum gewählten Thema vor (für die Chips). */
export async function suggestSubtopics(
  req: SubtopicRequest,
): Promise<string[]> {
  const client = getClient();
  const lehrwerk = lehrwerkFuer(req.klasse, req.fach);

  const prompt = [
    `Nenne 6 bis 8 konkrete, übbare Teilaspekte (Unterthemen) zum Thema "${req.thema}"`,
    `im Fach ${req.fach}, Jahrgangsstufe ${req.klasse} am Gymnasium in Bayern (LehrplanPLUS).`,
    lehrwerk ? `Orientiere dich am Lehrwerk "${lehrwerk}".` : "",
    `Jedes Unterthema soll ein kleiner, an einem Schultag übbarer Aspekt sein (z. B. eine einzelne Rechenart, Regel oder Fertigkeit), kurz formuliert.`,
    `Antworte auf Deutsch.`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    output_format: betaZodOutputFormat(SubtopicResultSchema),
  });

  return response.parsed_output?.unterthemen ?? [];
}

/** Bewertet offene (lange) Aufgaben: Antwort gegen Erwartungshorizont. */
export async function gradeAnswers(
  answers: AnswerToGrade[],
): Promise<GradeResult[]> {
  if (answers.length === 0) return [];

  const client = getClient();

  const answerTexts = answers
    .map(
      (a, i) =>
        `\n--- Aufgabe ${i + 1} (${a.punkte} P) ---\n` +
        `Schülerantwort:\n${a.antwort}\n\n` +
        `Erwartungshorizont / Musterlösung:\n${a.loesung}\n\n` +
        `Bewertungskriterien:\n${a.erklaerung}`,
    )
    .join("\n");

  const prompt = [
    `Du bist ein strenger, aber fairer Deutschlehrer, der freie Antworten von Schülern bewertet.`,
    `Bewerte die folgenden Schülerantworten anhand des Erwartungshorizonts und der Bewertungskriterien.`,
    ``,
    `Für jede Antwort vergib eine Punktzahl von 0–100 % in 10-%-Schritten (0, 10, 20, ... 90, 100):`,
    `- 90–100 %: vollständig korrekt und vollständig`,
    `- 70–80 %: weitgehend richtig, kleine Fehler oder Lücken`,
    `- 50–60 %: teilweise richtig, wesentliche Fehler oder unvollständig`,
    `- 20–40 %: Ansätze erkennbar, aber überwiegend falsch`,
    `- 0–10 %: falsch oder nicht sinnvoll`,
    ``,
    `Gib für jede Antwort eine kurze Rückmeldung auf Deutsch (1–2 Sätze):`,
    `- Bei korrekter Antwort (70 % oder mehr): kurze Bestätigung`,
    `- Bei Fehler (unter 70 %): kurz erklären, was war falsch oder wie könnte es besser sein`,
    ``,
    answerTexts,
    ``,
    `Antworte strukturiert als JSON mit Punkten (ganzzahl, 0-100) und Feedback.`,
  ].join("\n");

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    output_format: betaZodOutputFormat(GradeResponseSchema),
  });

  const graded = response.parsed_output?.results ?? [];

  // Stelle sicher, dass jede Aufgabe ein Ergebnis hat, sonst fallback auf 0 Punkte.
  return answers.map((a, i) => {
    const result = graded.find((r) => r.aufgabeIndex === i);
    if (!result) {
      return {
        aufgabeIndex: i,
        punkte: 0,
        feedback: "Bewertung fehlgeschlagen.",
      };
    }
    // Punkte als Prozent (0-100) auf die tatsächliche Punktzahl normalisieren
    // (Claude gibt z.B. 70, wir berechnen 70% von a.punkte)
    const pct = Math.min(100, Math.max(0, result.punkte));
    const final = Math.round((a.punkte * pct) / 100);
    return {
      aufgabeIndex: i,
      punkte: final,
      feedback: result.feedback,
    };
  });
}
