import type { Aufgabe } from "./schema";

/** Eine Lücke im Aufgabentext: drei oder mehr Unterstriche. */
const LUECKE = /_{3,}/g;

/** Zerlegt den Aufgabentext an den Lücken (Teile = Anzahl Lücken + 1). */
export function frageTeile(frage: string): string[] {
  return frage.split(LUECKE);
}

/**
 * Lösungen je Lücke – nur wenn die Aufgabe Lücken hat und ihre Anzahl zum
 * Aufgabentext passt. Sonst `null` (dann ein normales Antwortfeld).
 * Alte Verlauf-Einträge haben noch kein `luecken`-Feld.
 */
export function lueckenLoesungen(a: Aufgabe): string[][] | null {
  const luecken = a.luecken ?? [];
  if (luecken.length === 0) return null;
  const anzahl = frageTeile(a.frage).length - 1;
  return anzahl === luecken.length ? luecken : null;
}

/** Vergleichsform: Groß/klein, Leerzeichen, Apostroph-Varianten, Satzzeichen am Ende. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[’`´‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s*'\s*/g, "'")
    .replace(/[.,;:!?]+$/g, "");
}

/** Ist die Eingabe eine der akzeptierten Lösungen dieser Lücke? */
export function lueckeRichtig(eingabe: string | undefined, loesungen: string[]): boolean {
  if (!eingabe || eingabe.trim() === "") return false;
  const n = normalize(eingabe);
  return loesungen.some((l) => normalize(l) === n);
}
