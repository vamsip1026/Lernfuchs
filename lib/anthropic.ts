import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AUFGABENFORMATE, lehrwerkFuer, PRUEFUNGSARTEN } from "./curriculum";
import {
  type GenerateRequest,
  type Inhalt,
  type SubtopicRequest,
  SubtopicResultSchema,
  type TestPaper,
  TestPaperSchema,
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
    `- Bei Multiple Choice: genau 4 plausible Antwortmöglichkeiten im Feld "optionen" (sonst leeres Array).`,
    `- Gib eine kurze, verständliche Erklärung des Lösungswegs.`,
    `- Vergib eine sinnvolle Punktzahl pro Aufgabe (bei einer Schulaufgabe insgesamt eine höhere Gesamtpunktzahl).`,
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
