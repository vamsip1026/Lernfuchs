// Notenschlüssel (Richtwert, prozentbasiert) – eine Quelle für Interaktiv-Modus,
// Druckansicht und PDF. Schulen/Lehrkräfte verwenden leicht unterschiedliche
// Grenzen; dies ist eine gängige Gymnasialskala.
export const NOTEN_SCHLUESSEL: {
  minProzent: number;
  note: number;
  label: string;
}[] = [
  { minProzent: 85, note: 1, label: "sehr gut" },
  { minProzent: 70, note: 2, label: "gut" },
  { minProzent: 55, note: 3, label: "befriedigend" },
  { minProzent: 40, note: 4, label: "ausreichend" },
  { minProzent: 20, note: 5, label: "mangelhaft" },
  { minProzent: 0, note: 6, label: "ungenügend" },
];

export function noteFuerProzent(prozent: number) {
  return (
    NOTEN_SCHLUESSEL.find((n) => prozent >= n.minProzent) ??
    NOTEN_SCHLUESSEL[NOTEN_SCHLUESSEL.length - 1]
  );
}

/**
 * Punktebereiche je Note für eine konkrete Gesamtpunktzahl (bestnoten-first).
 * Note n gilt ab `ceil(minProzent% × gesamt)` Punkten; die Obergrenze liegt
 * einen Punkt unter der nächstbesseren Note (Note 1 bis zur Gesamtpunktzahl).
 */
export function notenBereiche(gesamtPunkte: number) {
  return NOTEN_SCHLUESSEL.map((n, i) => {
    const von = Math.ceil((n.minProzent / 100) * gesamtPunkte);
    const bisRoh =
      i === 0
        ? gesamtPunkte
        : Math.ceil((NOTEN_SCHLUESSEL[i - 1].minProzent / 100) * gesamtPunkte) -
          1;
    const bis = Math.max(von, bisRoh);
    return { note: n.note, label: n.label, von, bis };
  });
}

/** Kurztext "1: 22–25 P · 2: 18–21 P · …" für Druck/PDF. */
export function notenschluesselText(gesamtPunkte: number): string {
  return notenBereiche(gesamtPunkte)
    .map((b) => `${b.note}: ${b.von === b.bis ? b.von : `${b.von}–${b.bis}`} P`)
    .join("  ·  ");
}
