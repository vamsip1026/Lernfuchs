import type { TestPaper } from "./schema";

/**
 * Verlauf (Historie) der erstellten Tests – im Browser gespeichert
 * (localStorage). Privat auf diesem Gerät/Browser, keine Server-Speicherung.
 */
export type VerlaufEintrag = {
  id: string;
  datum: number; // Zeitstempel (ms)
  paper: TestPaper;
};

const KEY = "testverlauf-v1";
const MAX = 50;

export function ladeVerlauf(): VerlaufEintrag[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as VerlaufEintrag[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function speichern(list: VerlaufEintrag[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Speicher voll o. Ä. – still ignorieren.
  }
}

export function speichereTest(paper: TestPaper): VerlaufEintrag[] {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const list = [{ id, datum: Date.now(), paper }, ...ladeVerlauf()].slice(
    0,
    MAX,
  );
  speichern(list);
  return list;
}

export function loescheEintrag(id: string): VerlaufEintrag[] {
  const list = ladeVerlauf().filter((e) => e.id !== id);
  speichern(list);
  return list;
}

export function leereVerlauf(): VerlaufEintrag[] {
  speichern([]);
  return [];
}
