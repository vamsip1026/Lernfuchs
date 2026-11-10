import { z } from "zod";

/**
 * Aufgabentypen (question types). Each generated question declares its `typ`
 * so the UI knows how to render and (where possible) auto-grade it.
 */
export const AUFGABEN_TYPEN = [
  "multiple_choice",
  "richtig_falsch",
  "rechnen",
  "kurzantwort",
  "lueckentext",
  // Lange, offene Aufgabe (z. B. Aufsatz, Erörterung, offene Sachaufgabe).
  // Nicht automatisch bewertbar: 'loesung' = Erwartungshorizont/Musterlösung,
  // 'erklaerung' = Bewertungskriterien.
  "offen",
] as const;

export type AufgabenTyp = (typeof AUFGABEN_TYPEN)[number];

export const AufgabeSchema = z.object({
  typ: z.enum(AUFGABEN_TYPEN).describe("Art der Aufgabe"),
  frage: z.string().describe("Der Aufgabentext / die Frage"),
  // Nur bei multiple_choice gefüllt (3-4 Antwortmöglichkeiten).
  optionen: z
    .array(z.string())
    .describe(
      "Antwortmöglichkeiten – nur bei multiple_choice ausfüllen, sonst leeres Array",
    ),
  // Die korrekte Lösung. Bei multiple_choice exakt der Text der richtigen Option.
  // Bei richtig_falsch 'Richtig' oder 'Falsch'.
  loesung: z.string().describe("Die korrekte Lösung / Musterlösung"),
  // Nur bei lueckentext: pro Lücke ("___" im Aufgabentext, in Reihenfolge)
  // die akzeptierten Lösungen. Ermöglicht Eingabe direkt in der Lücke und
  // Bewertung je Lücke.
  luecken: z
    .array(z.array(z.string()))
    .describe(
      'Nur bei lueckentext: für jede Lücke "___" im Aufgabentext (in Reihenfolge) ein Array der akzeptierten Lösungen, z. B. [["ne"], ["jamais"]]. Sonst leeres Array.',
    ),
  erklaerung: z
    .string()
    .describe("Kurze Erklärung des Lösungswegs (1-3 Sätze)"),
  // Ohne min/max: ein Grenzwertverstoß würde sonst den ganzen Test verwerfen;
  // die Punkte werden nach der Generierung serverseitig begrenzt.
  punkte: z
    .number()
    .describe("Punkte für diese Aufgabe (ganzzahlig, meist 1–10, längere Schreibaufgaben bis 20)"),
  // Bezug auf einen Lese-/Hörtext in "texte" (Index), -1 = kein Text.
  text: z
    .number()
    .describe(
      'Index des zugehörigen Textes in "texte" (Lese- oder Hörverstehen), sonst -1',
    ),
});

export type Aufgabe = z.infer<typeof AufgabeSchema>;

/** Lese- oder Hörtext, auf den sich mehrere Aufgaben beziehen. */
export const TextSchema = z.object({
  art: z
    .enum(["lesen", "hoeren"])
    .describe('"lesen" = Lesetext (wird angezeigt), "hoeren" = Hörtext (wird vorgelesen)'),
  titel: z.string().describe("Kurzer Titel des Textes in der Zielsprache"),
  inhalt: z
    .string()
    .describe(
      'Der Text in der Zielsprache. Dialoge zeilenweise als "Name: Satz" (Zeilenumbruch "\\n").',
    ),
});

export type LeseHoerText = z.infer<typeof TextSchema>;

export const TestPaperSchema = z.object({
  titel: z.string().describe("Titel des Tests"),
  fach: z.string(),
  klasse: z.number().int(),
  thema: z.string(),
  pruefungsart: z.string().describe("Art der Prüfung (z. B. Schulaufgabe)"),
  // true = benoteter Leistungsnachweis (Punkte/Note); false = Übungsblatt.
  // Wird serverseitig deterministisch gesetzt.
  benotet: z.boolean(),
  schwierigkeit: z.string(),
  bearbeitungszeit: z
    .string()
    .describe("Empfohlene Bearbeitungszeit, z. B. 'ca. 20 Minuten'"),
  // Lese-/Hörtexte (nur bei Lese- oder Hörverstehen, sonst leeres Array).
  texte: z
    .array(TextSchema)
    .describe("Lese- oder Hörtexte, auf die sich Aufgaben beziehen; sonst leeres Array"),
  aufgaben: z.array(AufgabeSchema).min(1),
});

export type TestPaper = z.infer<typeof TestPaperSchema>;

/** Text einer Aufgabe – alte Verlauf-Einträge haben noch keine Texte. */
export function textFuer(paper: TestPaper, a: Aufgabe): LeseHoerText | null {
  const i = a.text ?? -1;
  return i >= 0 ? ((paper.texte ?? [])[i] ?? null) : null;
}

/** Ein Inhalts-Element: ein Thema, ganz oder auf Unterthemen eingegrenzt. */
export const InhaltSchema = z.object({
  thema: z.string().min(1),
  // Leer = ganzes Thema; sonst nur diese Teilaspekte.
  unterthemen: z.array(z.string()).default([]),
});

export type Inhalt = z.infer<typeof InhaltSchema>;

/** Eingabe für die Generierung (vom Formular an die API). */
export const GenerateRequestSchema = z.object({
  klasse: z.coerce.number().int().min(5).max(13),
  fach: z.string().min(1),
  // Umfang des Tests: ein oder mehrere Themen (je ganz oder eingegrenzt).
  inhalte: z.array(InhaltSchema).min(1),
  pruefungsart: z.string().min(1),
  schwierigkeit: z.string().min(1),
  aufgabenformat: z.string().min(1).default("automatisch"),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/** Eingabe für Unterthemen-Vorschläge. */
export const SubtopicRequestSchema = z.object({
  klasse: z.coerce.number().int().min(5).max(13),
  fach: z.string().min(1),
  thema: z.string().min(1),
});

export type SubtopicRequest = z.infer<typeof SubtopicRequestSchema>;

/** Strukturierte Ausgabe für Unterthemen-Vorschläge. */
export const SubtopicResultSchema = z.object({
  unterthemen: z
    .array(z.string())
    .describe("6–8 konkrete, übbare Teilaspekte des Themas"),
});

/** Eine offene Aufgabe zur Bewertung (Schulserver an Claude). */
export const AnswerToGradeSchema = z.object({
  aufgabeIndex: z.number().int().describe("Index der Aufgabe im Test"),
  frage: z.string().optional().describe("Aufgabentext"),
  antwort: z.string().describe("Antwort des Schülers"),
  loesung: z.string().describe("Erwartungshorizont / Musterlösung"),
  erklaerung: z.string().describe("Bewertungskriterien"),
  punkte: z.number().int().describe("Maximale Punktzahl"),
});

export type AnswerToGrade = z.infer<typeof AnswerToGradeSchema>;

/** Anfrage zum Bewerten offener Antworten. */
export const GradeRequestSchema = z.object({
  answers: z.array(AnswerToGradeSchema),
});

export type GradeRequest = z.infer<typeof GradeRequestSchema>;

/** Bewertung einer offenen Antwort. */
export const GradeResultSchema = z.object({
  aufgabeIndex: z.number().int(),
  punkte: z.number().describe("Erreichte Punktzahl als Prozent (0-100 in 10-%-Schritten)"),
  feedback: z
    .string()
    .describe(
      "Kurze deutsche Rückmeldung (1-2 Sätze): was war richtig/falsch oder was könnte besser sein",
    ),
});

export type GradeResult = z.infer<typeof GradeResultSchema>;

/** Antwort vom Bewertungs-Endpoint. */
export const GradeResponseSchema = z.object({
  results: z.array(GradeResultSchema),
});
