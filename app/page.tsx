"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AUFGABENFORMATE,
  DEFAULT_AUFGABENFORMAT,
  DEFAULT_PRUEFUNGSART,
  DEFAULT_SCHWIERIGKEIT,
  faecherFuerKlasse,
  KLASSEN,
  lehrwerkFuer,
  PRUEFUNGSARTEN,
  SCHWIERIGKEITEN,
  themenFuer,
} from "@/lib/curriculum";
import type { TestPaper } from "@/lib/schema";
import { fachStil } from "@/lib/ui";
import {
  ladeVerlauf,
  leereVerlauf,
  loescheEintrag,
  speichereTest,
  type VerlaufEintrag,
} from "@/lib/verlauf";
import { TestView } from "./TestView";

// Ein Eintrag im Inhalte-Builder (ein Thema, ganz oder eingegrenzt).
type ScopeItem = {
  id: string;
  thema: string;
  unterthemen: string[];
  eingrenzen: boolean;
  vorschlaege: string[];
  laedt: boolean;
  fehler: string | null;
  eigenesUnterthema: string;
};

function neueId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const PASS_KEY = "app_passwort";

// POST-Helfer: hängt den gespeicherten Zugangscode (falls vorhanden) als Header
// an. Der Schutz ist nur aktiv, wenn der Server APP_PASSWORT gesetzt hat.
async function apiFetch(url: string, body: unknown): Promise<Response> {
  const code =
    typeof window !== "undefined" ? localStorage.getItem(PASS_KEY) : null;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(code ? { "x-app-passwort": code } : {}),
    },
    body: JSON.stringify(body),
  });
}

export default function Home() {
  const [klasse, setKlasse] = useState<number>(8);
  const [fach, setFach] = useState<string>("Mathematik");
  const [inhalte, setInhalte] = useState<ScopeItem[]>([]);
  const [neuesThema, setNeuesThema] = useState<string>("");
  const [eigenesThemaText, setEigenesThemaText] = useState<string>("");
  const [pruefungsart, setPruefungsart] =
    useState<string>(DEFAULT_PRUEFUNGSART);
  const [aufgabenformat, setAufgabenformat] = useState<string>(
    DEFAULT_AUFGABENFORMAT,
  );
  const [schwierigkeit, setSchwierigkeit] =
    useState<string>(DEFAULT_SCHWIERIGKEIT);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<TestPaper | null>(null);
  const [verlauf, setVerlauf] = useState<VerlaufEintrag[]>([]);
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [passcode, setPasscode] = useState<string>("");

  // Verlauf laden + prüfen, ob ein Zugangscode nötig ist (nur im Browser).
  useEffect(() => {
    setVerlauf(ladeVerlauf());
    setPasscode(localStorage.getItem(PASS_KEY) ?? "");
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setPasscodeRequired(Boolean(d?.passcodeRequired)))
      .catch(() => {});
  }, []);

  const faecher = useMemo(() => faecherFuerKlasse(klasse), [klasse]);
  const themen = useMemo(() => themenFuer(klasse, fach), [klasse, fach]);

  // Noch nicht hinzugefügte Themenvorschläge (für das Add-Dropdown).
  const verfuegbareThemen = themen.filter(
    (t) => !inhalte.some((i) => i.thema === t),
  );

  function resetInhalte() {
    setInhalte([]);
    setNeuesThema("");
    setEigenesThemaText("");
  }

  function patchItem(id: string, patch: Partial<ScopeItem>) {
    setInhalte((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function addThema(name: string) {
    const t = name.trim();
    if (!t || inhalte.some((i) => i.thema === t)) return;
    setInhalte((prev) => [
      ...prev,
      {
        id: neueId(),
        thema: t,
        unterthemen: [],
        eingrenzen: false,
        vorschlaege: [],
        laedt: false,
        fehler: null,
        eigenesUnterthema: "",
      },
    ]);
  }

  async function vorschlagenFuer(item: ScopeItem) {
    patchItem(item.id, { laedt: true, fehler: null });
    try {
      const res = await apiFetch("/api/subtopics", {
        klasse,
        fach,
        thema: item.thema,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Unbekannter Fehler.");
      patchItem(item.id, {
        vorschlaege: Array.isArray(data.unterthemen) ? data.unterthemen : [],
        laedt: false,
      });
    } catch (err) {
      patchItem(item.id, {
        laedt: false,
        fehler: err instanceof Error ? err.message : "Fehler bei der Anfrage.",
      });
    }
  }

  function toggleUnterthema(item: ScopeItem, u: string) {
    const vorhanden = item.unterthemen.includes(u);
    patchItem(item.id, {
      unterthemen: vorhanden
        ? item.unterthemen.filter((x) => x !== u)
        : [...item.unterthemen, u],
    });
  }

  function addEigenesUnterthema(item: ScopeItem) {
    const u = item.eigenesUnterthema.trim();
    if (!u || item.unterthemen.includes(u)) {
      patchItem(item.id, { eigenesUnterthema: "" });
      return;
    }
    patchItem(item.id, {
      unterthemen: [...item.unterthemen, u],
      eigenesUnterthema: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (inhalte.length === 0) {
      setError("Bitte mindestens ein Thema hinzufügen.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/generate", {
        klasse,
        fach,
        inhalte: inhalte.map((i) => ({
          thema: i.thema,
          unterthemen: i.unterthemen,
        })),
        pruefungsart,
        schwierigkeit,
        aufgabenformat,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Unbekannter Fehler.");
      }
      setPaper(data as TestPaper);
      setVerlauf(speichereTest(data as TestPaper));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Anfrage.");
    } finally {
      setLoading(false);
    }
  }

  if (paper) {
    return <TestView paper={paper} onReset={() => setPaper(null)} />;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          🦊 Lernfuchs
        </h1>
        <p className="mt-1 text-indigo-100">
          Dein Übungstest in Sekunden – Gymnasium Bayern, LehrplanPLUS.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800"
      >
        {/* Zugangscode – nur wenn der Server geschützt ist */}
        {passcodeRequired && (
          <Field label="Zugangscode (Access code)">
            <input
              type="text"
              className="input"
              placeholder="Code von Vamsi"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (typeof window !== "undefined") {
                  localStorage.setItem(PASS_KEY, e.target.value);
                }
              }}
            />
          </Field>
        )}

        {/* Klasse */}
        <Field label="Klasse (Class)">
          <select
            className="input"
            value={klasse}
            onChange={(e) => {
              const k = Number(e.target.value);
              setKlasse(k);
              const neueFaecher = faecherFuerKlasse(k);
              if (!neueFaecher.some((f) => f.name === fach)) {
                setFach(neueFaecher[0]?.name ?? "");
              }
              resetInhalte();
            }}
          >
            {KLASSEN.map((k) => (
              <option key={k} value={k}>
                {k}. Klasse
              </option>
            ))}
          </select>
        </Field>

        {/* Fach */}
        <Field label="Fach (Subject)">
          <select
            className="input"
            value={fach}
            onChange={(e) => {
              setFach(e.target.value);
              resetInhalte();
            }}
          >
            {faecher.map((f) => (
              <option key={f.name} value={f.name}>
                {fachStil(f.name).emoji} {f.name}
              </option>
            ))}
          </select>
          {lehrwerkFuer(klasse, fach) && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              📘 Lehrwerk: {lehrwerkFuer(klasse, fach)}
            </p>
          )}
        </Field>

        {/* Inhalte (Themen + optional Unterthemen) */}
        <div className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Inhalte (Topics)
          </span>
          {inhalte.length > 0 && (
            <ul className="mb-3 space-y-2">
              {inhalte.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-300 p-3 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {fachStil(fach).emoji} {item.thema}
                    </p>
                    <button
                      type="button"
                      aria-label="Thema entfernen"
                      onClick={() =>
                        setInhalte((prev) =>
                          prev.filter((x) => x.id !== item.id),
                        )
                      }
                      className="rounded-md px-2 text-slate-400 transition hover:text-red-600 dark:text-slate-500"
                    >
                      ✕
                    </button>
                  </div>

                  <label className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={item.eingrenzen}
                      onChange={(e) =>
                        patchItem(item.id, { eingrenzen: e.target.checked })
                      }
                    />
                    Auf Unterthemen eingrenzen
                    <span className="text-slate-400 dark:text-slate-500">
                      {item.eingrenzen
                        ? item.unterthemen.length > 0
                          ? `· nur: ${item.unterthemen.join(", ")}`
                          : "· Unterthemen wählen…"
                        : "· ganzes Thema"}
                    </span>
                  </label>

                  {item.eingrenzen && (
                    <div className="mt-2 space-y-2">
                      {/* ausgewählte Unterthemen */}
                      {item.unterthemen.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.unterthemen.map((u) => (
                            <span
                              key={u}
                              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-sm text-white"
                            >
                              {u}
                              <button
                                type="button"
                                aria-label="Entfernen"
                                onClick={() => toggleUnterthema(item, u)}
                                className="text-indigo-100 hover:text-white"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => vorschlagenFuer(item)}
                          disabled={item.laedt}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-300 transition hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-300 dark:ring-indigo-800 dark:hover:bg-indigo-950"
                        >
                          {item.laedt ? "Lädt…" : "💡 Unterthemen vorschlagen"}
                        </button>
                      </div>
                      {item.fehler && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {item.fehler}
                        </p>
                      )}
                      {/* Vorschläge (Mehrfachauswahl) */}
                      {item.vorschlaege.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.vorschlaege.map((u) => {
                            const aktiv = item.unterthemen.includes(u);
                            return (
                              <button
                                type="button"
                                key={u}
                                onClick={() => toggleUnterthema(item, u)}
                                className={
                                  "rounded-full px-3 py-1 text-sm ring-1 transition " +
                                  (aktiv
                                    ? "bg-indigo-600 text-white ring-indigo-600"
                                    : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700")
                                }
                              >
                                {aktiv ? "✓ " : ""}
                                {u}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {/* eigenes Unterthema */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input"
                          placeholder="Eigenes Unterthema…"
                          value={item.eigenesUnterthema}
                          onChange={(e) =>
                            patchItem(item.id, {
                              eigenesUnterthema: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addEigenesUnterthema(item);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addEigenesUnterthema(item)}
                          className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Thema hinzufügen */}
          <select
            className="input"
            value={neuesThema}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || v === "__eigenes__") {
                setNeuesThema(v);
                return;
              }
              addThema(v);
              setNeuesThema("");
            }}
          >
            <option value="">+ Thema hinzufügen…</option>
            {verfuegbareThemen.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="__eigenes__">✏️ Eigenes Thema eingeben…</option>
          </select>
          {neuesThema === "__eigenes__" && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="input"
                placeholder="z. B. Lineare Gleichungen"
                value={eigenesThemaText}
                onChange={(e) => setEigenesThemaText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addThema(eigenesThemaText);
                    setEigenesThemaText("");
                    setNeuesThema("");
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  addThema(eigenesThemaText);
                  setEigenesThemaText("");
                  setNeuesThema("");
                }}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                Hinzufügen
              </button>
            </div>
          )}
          {inhalte.length === 0 && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Füge ein oder mehrere Themen hinzu. Jedes Thema kann ganz behandelt
              oder auf Unterthemen eingegrenzt werden.
            </p>
          )}
        </div>

        {/* Prüfungsart */}
        <Field label="Prüfungsart (Test type)">
          <select
            className="input"
            value={pruefungsart}
            onChange={(e) => setPruefungsart(e.target.value)}
          >
            {PRUEFUNGSARTEN.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {PRUEFUNGSARTEN.find((p) => p.value === pruefungsart)?.kurz}
          </p>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Schwierigkeit */}
          <Field label="Schwierigkeit (Difficulty)">
            <select
              className="input"
              value={schwierigkeit}
              onChange={(e) => setSchwierigkeit(e.target.value)}
            >
              {SCHWIERIGKEITEN.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Aufgabenformat */}
          <Field label="Aufgabenformat (Question format)">
            <select
              className="input"
              value={aufgabenformat}
              onChange={(e) => setAufgabenformat(e.target.value)}
            >
              {AUFGABENFORMATE.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner />
              Test wird erstellt…
            </>
          ) : (
            <>✨ Test erstellen</>
          )}
        </button>
        {loading && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Die Aufgaben werden generiert – das kann 10–30 Sekunden dauern.
          </p>
        )}
      </form>

      {verlauf.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Verlauf ({verlauf.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Gesamten Verlauf wirklich löschen?")) {
                  setVerlauf(leereVerlauf());
                }
              }}
              className="text-sm text-slate-500 transition hover:text-red-600 dark:text-slate-400"
            >
              Verlauf leeren
            </button>
          </div>
          <ul className="space-y-2">
            {verlauf.map((e) => {
              const vstil = fachStil(e.paper.fach);
              return (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg ring-1 ${vstil.soft}`}
                    >
                      {vstil.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                        {e.paper.titel}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {e.paper.fach} · {e.paper.klasse}. Klasse ·{" "}
                        {e.paper.pruefungsart} ·{" "}
                        {new Date(e.datum).toLocaleString("de-DE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaper(e.paper)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                      Öffnen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `„${e.paper.titel}“ aus dem Verlauf löschen?`,
                          )
                        ) {
                          setVerlauf(loescheEintrag(e.id));
                        }
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-500 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
                    >
                      Löschen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}
