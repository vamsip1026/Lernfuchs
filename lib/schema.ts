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
  punkte: z.number().int().min(1).max(10).describe("Punkte für diese Aufgabe"),
});

export type Aufgabe = z.infer<typeof AufgabeSchema>;

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
  aufgaben: z.array(AufgabeSchema).min(1),
});

export type TestPaper = z.infer<typeof TestPaperSchema>;

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
