import type { Aufgabe, LeseHoerText, TestPaper } from "./schema";

/** Text einer Aufgabe – alte Verlauf-Einträge haben noch keine Texte. */
export function textFuer(paper: TestPaper, a: Aufgabe): LeseHoerText | null {
  const i = a.text ?? -1;
  return i >= 0 ? ((paper.texte ?? [])[i] ?? null) : null;
}
