"use client";

import { useMemo, useState } from "react";
import { lehrwerkFuer } from "@/lib/curriculum";
import { noteFuerProzent, notenschluesselText } from "@/lib/noten";
import type { Aufgabe, TestPaper } from "@/lib/schema";
import { ermutigung, fachStil } from "@/lib/ui";

type Mode = "interaktiv" | "drucken";

const BUCHSTABEN = ["A", "B", "C", "D", "E", "F"];

/** Normalisiert eine Antwort für den Textvergleich (Freitext/Rechnen). */
function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "");
}

type Grade = "correct" | "incorrect" | "review";

/** Farbklassen für das Noten-Abzeichen (hell/dunkel). */
function noteBadge(note: number): string {
  if (note <= 2)
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800";
  if (note <= 4)
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800";
  return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800";
}

function gradeAnswer(a: Aufgabe, antwort: string | undefined): Grade {
  // Offene Aufgaben werden nicht automatisch bewertet.
  if (a.typ === "offen") return "review";
  if (antwort === undefined || antwort.trim() === "") return "incorrect";
  if (a.typ === "multiple_choice" || a.typ === "richtig_falsch") {
    return normalize(antwort) === normalize(a.loesung)
      ? "correct"
      : "incorrect";
  }
  // Freitext / Rechnen: exakter (normalisierter) Treffer zählt als richtig,
  // sonst zur Selbstkontrolle markieren.
  return normalize(antwort) === normalize(a.loesung) ? "correct" : "review";
}

export function TestView({
  paper,
  onReset,
}: {
  paper: TestPaper;
  onReset: () => void;
}) {
  const [mode, setMode] = useState<Mode>("interaktiv");
  const [antworten, setAntworten] = useState<Record<number, string>>({});
  const [abgegeben, setAbgegeben] = useState(false);
  // Standard: ohne Lösungen – so kann das Blatt direkt dem Kind gegeben werden.
  const [loesungenDrucken, setLoesungenDrucken] = useState(false);
  const [pdfLaedt, setPdfLaedt] = useState(false);

  const stil = fachStil(paper.fach);
  const lehrwerk = lehrwerkFuer(paper.klasse, paper.fach);

  async function handlePdf() {
    setPdfLaedt(true);
    try {
      const { downloadTestPdf } = await import("@/lib/pdf");
      await downloadTestPdf(paper, loesungenDrucken);
    } catch {
      alert("Die PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    } finally {
      setPdfLaedt(false);
    }
  }

  const gesamtPunkte = useMemo(
    () => paper.aufgaben.reduce((s, a) => s + a.punkte, 0),
    [paper.aufgaben],
  );

  const beantwortet = paper.aufgaben.filter(
    (_, i) => (antworten[i] ?? "").trim() !== "",
  ).length;
  const fortschritt = paper.aufgaben.length
    ? Math.round((beantwortet / paper.aufgaben.length) * 100)
    : 0;

  const auswertung = useMemo(() => {
    const grades = paper.aufgaben.map((a, i) => gradeAnswer(a, antworten[i]));
    const erreicht = paper.aufgaben.reduce(
      (s, a, i) => (grades[i] === "correct" ? s + a.punkte : s),
      0,
    );
    // Automatisch bewertbare Punkte = alles außer offenen Aufgaben.
    const autoPunkte = paper.aufgaben.reduce(
      (s, a) => (a.typ === "offen" ? s : s + a.punkte),
      0,
    );
    const zuPruefen = grades.filter((g) => g === "review").length;
    const prozent =
      autoPunkte > 0 ? Math.round((erreicht / autoPunkte) * 100) : null;
    const note = prozent === null ? null : noteFuerProzent(prozent);
    return { grades, erreicht, autoPunkte, zuPruefen, prozent, note };
  }, [paper.aufgaben, antworten]);

  function setAntwort(i: number, v: string) {
    setAntworten((prev) => ({ ...prev, [i]: v }));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 print-page">
      {/* Steuerleiste – wird beim Drucken ausgeblendet */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
        >
          ← Neuer Test
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <ModeButton
              active={mode === "interaktiv"}
              onClick={() => setMode("interaktiv")}
            >
              Interaktiv
            </ModeButton>
            <ModeButton
              active={mode === "drucken"}
              onClick={() => setMode("drucken")}
            >
              Drucken / PDF
            </ModeButton>
          </div>
          {mode === "drucken" && (
            <>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="accent-indigo-600"
                  checked={loesungenDrucken}
                  onChange={(e) => setLoesungenDrucken(e.target.checked)}
                />
                Lösungen anhängen
              </label>
              <button
                onClick={handlePdf}
                disabled={pdfLaedt}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {pdfLaedt ? "PDF wird erstellt…" : "📄 PDF herunterladen"}
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                🖨️ Drucken
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kopf */}
      <header className="avoid-break mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span
            className={`no-print grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ring-1 ${stil.soft}`}
          >
            {stil.emoji}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {paper.titel}
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {paper.fach} · {paper.klasse}. Klasse · {paper.pruefungsart} · Thema:{" "}
          {paper.thema} · Schwierigkeit: {paper.schwierigkeit}
          {lehrwerk && ` · Lehrwerk: ${lehrwerk}`}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {paper.aufgaben.length} Aufgaben · {gesamtPunkte} Punkte ·
          Bearbeitungszeit: {paper.bearbeitungszeit}
          {mode === "drucken" && "  ·  Name: ______________   Datum: __________"}
        </p>
      </header>

      {/* Fortschritt (interaktiv, vor Abgabe) */}
      {mode === "interaktiv" && !abgegeben && (
        <div className="no-print mb-5">
          <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Fortschritt</span>
            <span>
              {beantwortet} von {paper.aufgaben.length} beantwortet
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${fortschritt}%` }}
            />
          </div>
        </div>
      )}

      {mode === "interaktiv" ? (
        <InteractiveView
          paper={paper}
          antworten={antworten}
          setAntwort={setAntwort}
          abgegeben={abgegeben}
          grades={auswertung.grades}
        />
      ) : (
        <PrintView paper={paper} mitLoesungen={loesungenDrucken} />
      )}

      {/* Interaktiv: Abgeben / Auswertung */}
      {mode === "interaktiv" && (
        <div className="no-print mt-8">
          {!abgegeben ? (
            <button
              onClick={() => setAbgegeben(true)}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              Abgeben & auswerten
            </button>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              {auswertung.note && (
                <>
                  <div
                    className={`mx-auto grid h-24 w-24 place-items-center rounded-full shadow-sm ring-4 ${noteBadge(
                      auswertung.note.note,
                    )}`}
                  >
                    <span className="text-5xl font-extrabold">
                      {auswertung.note.note}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {ermutigung(auswertung.note.note)}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Note {auswertung.note.note} ({auswertung.note.label}) ·{" "}
                    {auswertung.prozent} %
                  </p>
                </>
              )}
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {auswertung.erreicht} / {auswertung.autoPunkte} Punkte
                (automatisch bewertet)
              </p>
              {auswertung.zuPruefen > 0 && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {auswertung.zuPruefen} offene Antwort(en) bitte selbst mit der
                  Musterlösung / dem Erwartungshorizont vergleichen.
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Richtwert nach prozentualer Punktzahl – der genaue Notenschlüssel
                kann je nach Lehrkraft abweichen.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setAbgegeben(false);
                    setAntworten({});
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  Nochmal versuchen
                </button>
                <button
                  onClick={onReset}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Neuer Test
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-md px-3 py-1.5 text-sm font-medium transition " +
        (active
          ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white")
      }
    >
      {children}
    </button>
  );
}

/* ---------------- Interaktive Ansicht ---------------- */

function InteractiveView({
  paper,
  antworten,
  setAntwort,
  abgegeben,
  grades,
}: {
  paper: TestPaper;
  antworten: Record<number, string>;
  setAntwort: (i: number, v: string) => void;
  abgegeben: boolean;
  grades: Grade[];
}) {
  return (
    <ol className="space-y-5">
      {paper.aufgaben.map((a, i) => {
        const grade = grades[i];
        const ring = abgegeben
          ? grade === "correct"
            ? "ring-emerald-300 dark:ring-emerald-800"
            : grade === "review"
              ? "ring-amber-300 dark:ring-amber-800"
              : "ring-red-300 dark:ring-red-800"
          : "ring-slate-200 dark:ring-slate-800";
        return (
          <li
            key={i}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 dark:bg-slate-900 ${ring}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                <span className="mr-2 text-slate-400 dark:text-slate-500">
                  {i + 1}.
                </span>
                {a.frage}
              </p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {a.punkte} P
              </span>
            </div>

            <div className="mt-3">
              <AnswerInput
                aufgabe={a}
                index={i}
                value={antworten[i]}
                onChange={(v) => setAntwort(i, v)}
                disabled={abgegeben}
              />
            </div>

            {abgegeben && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {grade === "correct"
                    ? "✅ Richtig"
                    : grade === "review"
                      ? "🔍 Selbst prüfen"
                      : "❌ Nicht korrekt"}
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                  <span className="font-medium">
                    {a.typ === "offen" ? "Erwartungshorizont:" : "Lösung:"}
                  </span>{" "}
                  {a.loesung}
                </p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {a.typ === "offen" && (
                    <span className="font-medium">Bewertungskriterien: </span>
                  )}
                  {a.erklaerung}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function AnswerInput({
  aufgabe,
  index,
  value,
  onChange,
  disabled,
}: {
  aufgabe: Aufgabe;
  index: number;
  value: string | undefined;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  if (aufgabe.typ === "multiple_choice" && aufgabe.optionen.length > 0) {
    return (
      <div className="space-y-2">
        {aufgabe.optionen.map((opt, k) => (
          <label
            key={k}
            className={
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition " +
              (value === opt
                ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950"
                : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800")
            }
          >
            <input
              type="radio"
              name={`q${index}`}
              className="accent-indigo-600"
              checked={value === opt}
              onChange={() => onChange(opt)}
              disabled={disabled}
            />
            <span className="text-slate-800 dark:text-slate-100">
              <span className="mr-1 font-medium text-slate-500 dark:text-slate-400">
                {BUCHSTABEN[k]})
              </span>
              {opt}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (aufgabe.typ === "richtig_falsch") {
    return (
      <div className="flex gap-2">
        {["Richtig", "Falsch"].map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium ring-1 transition " +
              (value === opt
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "text-slate-700 ring-slate-300 hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800")
            }
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // Offene (lange) Aufgabe: größeres Textfeld.
  if (aufgabe.typ === "offen") {
    return (
      <textarea
        rows={6}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        placeholder="Deine Ausarbeitung…"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    );
  }

  // Freitext / Rechnen / Lückentext
  return (
    <input
      type="text"
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      placeholder="Deine Antwort…"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}

/* ---------------- Druckansicht (bleibt hell & schlicht) ---------------- */

function PrintView({
  paper,
  mitLoesungen,
}: {
  paper: TestPaper;
  mitLoesungen: boolean;
}) {
  const gesamt = paper.aufgaben.reduce((s, a) => s + a.punkte, 0);
  return (
    <div>
      <ol className="space-y-6">
        {paper.aufgaben.map((a, i) => (
          <li key={i} className="avoid-break">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                {a.frage}
              </p>
              <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                ({a.punkte} P)
              </span>
            </div>
            {a.typ === "multiple_choice" && a.optionen.length > 0 ? (
              <ul className="mt-2 space-y-1 pl-6">
                {a.optionen.map((opt, k) => (
                  <li key={k} className="text-slate-800 dark:text-slate-200">
                    <span className="mr-1 font-medium text-slate-500 dark:text-slate-400">
                      {BUCHSTABEN[k]})
                    </span>
                    {opt}
                  </li>
                ))}
              </ul>
            ) : a.typ === "richtig_falsch" ? (
              <p className="mt-2 pl-6 text-slate-600 dark:text-slate-300">
                ◯ Richtig ◯ Falsch
              </p>
            ) : (
              // Platz zum handschriftlichen Lösen – offene Aufgaben bekommen
              // mehr Zeilen.
              <div className="mt-2 space-y-4 pl-6">
                {Array.from({ length: a.typ === "offen" ? 8 : 2 }).map(
                  (_, k) => (
                    <div
                      key={k}
                      className="border-b border-dotted border-slate-300"
                    />
                  ),
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Notenschlüssel-Hinweis (Richtwert) am Ende des Aufgabenblatts */}
      <p className="avoid-break mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="font-medium">Notenschlüssel (Richtwert): </span>
        {notenschluesselText(gesamt)}
        <span className="mt-1 block">
          Punkte des Tests. Der genaue Schlüssel kann je nach Lehrkraft
          abweichen.
        </span>
      </p>

      {/* Lösungsschlüssel – nur wenn gewünscht; startet auf einer neuen Seite */}
      {mitLoesungen && (
        <section className="page-break mt-10 border-t border-slate-300 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Lösungsschlüssel
          </h2>
          <ol className="mt-4 space-y-3">
            {paper.aufgaben.map((a, i) => (
              <li key={i} className="avoid-break text-sm">
                <p className="text-slate-800 dark:text-slate-200">
                  <span className="mr-2 font-medium text-slate-500 dark:text-slate-400">
                    {i + 1}.
                  </span>
                  <span className="font-semibold">{a.loesung}</span>
                </p>
                <p className="pl-6 text-slate-500 dark:text-slate-400">
                  {a.erklaerung}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
