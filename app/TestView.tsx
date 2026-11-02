"use client";

import { useMemo, useState } from "react";
import { lehrwerkFuer } from "@/lib/curriculum";
import {
  frageTeile,
  lueckeRichtig,
  lueckenLoesungen,
  normalize,
} from "@/lib/luecken";
import { noteFuerProzent, notenschluesselText } from "@/lib/noten";
import type { Aufgabe, TestPaper } from "@/lib/schema";
import { ermutigung, fachStil } from "@/lib/ui";
import { apiFetch } from "@/lib/api";
import { En } from "./En";

type Mode = "interaktiv" | "drucken";

const BUCHSTABEN = ["A", "B", "C", "D", "E", "F"];

/** Antwort: Text – bzw. bei Lückentexten ein Eintrag pro Lücke. */
type Antwort = string | string[];

type Grade = "correct" | "partial" | "incorrect" | "review";

/** Bewertung einer offenen Antwort von der API. */
interface GradedAnswer {
  aufgabeIndex: number;
  punkte: number;
  feedback: string;
}

/** Wurde (mindestens teilweise) geantwortet? */
function hatAntwort(antwort: Antwort | undefined): boolean {
  if (Array.isArray(antwort)) return antwort.some((s) => s.trim() !== "");
  return (antwort ?? "").trim() !== "";
}

/** Farbklassen für das Noten-Abzeichen (hell/dunkel). */
function noteBadge(note: number): string {
  if (note <= 2)
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800";
  if (note <= 4)
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800";
  return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800";
}

/** Bewertung einer Aufgabe inkl. erreichter Punkte (Teilpunkte bei Lücken). */
function gradeAnswer(
  a: Aufgabe,
  antwort: Antwort | undefined,
): { grade: Grade; punkte: number } {
  // Offene Aufgaben werden nicht automatisch bewertet.
  if (a.typ === "offen") return { grade: "review", punkte: 0 };

  // Lückentext: jede Lücke einzeln, anteilige Punkte (auf halbe Punkte gerundet).
  const luecken = lueckenLoesungen(a);
  if (luecken) {
    const eingaben = Array.isArray(antwort) ? antwort : [];
    const richtig = luecken.filter((l, k) => lueckeRichtig(eingaben[k], l)).length;
    const punkte = Math.round(((a.punkte * richtig) / luecken.length) * 2) / 2;
    const grade =
      richtig === luecken.length ? "correct" : richtig > 0 ? "partial" : "incorrect";
    return { grade, punkte };
  }

  const text = Array.isArray(antwort) ? antwort.join(" ") : (antwort ?? "");
  if (text.trim() === "") return { grade: "incorrect", punkte: 0 };
  const treffer = normalize(text) === normalize(a.loesung);
  if (a.typ === "multiple_choice" || a.typ === "richtig_falsch") {
    return treffer
      ? { grade: "correct", punkte: a.punkte }
      : { grade: "incorrect", punkte: 0 };
  }
  // Freitext / Rechnen: exakter (normalisierter) Treffer zählt als richtig,
  // sonst zur Selbstkontrolle markieren.
  return treffer
    ? { grade: "correct", punkte: a.punkte }
    : { grade: "review", punkte: 0 };
}

export function TestView({
  paper,
  onReset,
}: {
  paper: TestPaper;
  onReset: () => void;
}) {
  const [mode, setMode] = useState<Mode>("interaktiv");
  const [antworten, setAntworten] = useState<Record<number, Antwort>>({});
  const [abgegeben, setAbgegeben] = useState(false);
  // Standard: ohne Lösungen – so kann das Blatt direkt dem Kind gegeben werden.
  const [loesungenDrucken, setLoesungenDrucken] = useState(false);
  const [pdfLaedt, setPdfLaedt] = useState(false);
  // Bewertungen offener Antworten (von der API).
  const [gradedAnswers, setGradedAnswers] = useState<Record<number, GradedAnswer> | null>(
    null,
  );
  const [gradingError, setGradingError] = useState<string | null>(null);

  const stil = fachStil(paper.fach);
  const lehrwerk = lehrwerkFuer(paper.klasse, paper.fach);
  // Übungsblatt ist nicht benotet (keine Punkte/Note). Alte Verlauf-Einträge
  // ohne Flag gelten als benotet.
  const benotet = paper.benotet !== false;

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

  const beantwortet = paper.aufgaben.filter((_, i) =>
    hatAntwort(antworten[i]),
  ).length;
  const fortschritt = paper.aufgaben.length
    ? Math.round((beantwortet / paper.aufgaben.length) * 100)
    : 0;

  const auswertung = useMemo(() => {
    const bewertungen = paper.aufgaben.map((a, i) => {
      // Nutze KI-Bewertung falls vorhanden (offene Aufgaben, Rechnen, Kurzantwort).
      if (gradedAnswers && i in gradedAnswers) {
        const punkte = Math.min(Math.max(gradedAnswers[i].punkte, 0), a.punkte);
        const grade: Grade =
          punkte >= a.punkte ? "correct" : punkte > 0 ? "partial" : "incorrect";
        return { grade, punkte };
      }
      return gradeAnswer(a, antworten[i]);
    });
    const grades = bewertungen.map((b) => b.grade);
    const erreicht = bewertungen.reduce((s, b) => s + b.punkte, 0);

    // Alle Punkte zählen (auch die von API bewerteten offenen Aufgaben).
    const autoPunkte = paper.aufgaben.reduce((s, a) => s + a.punkte, 0);
    const zuPruefen = grades.filter((g) => g === "review").length;
    const richtig = grades.filter((g) => g === "correct").length;
    const autoAnzahl = paper.aufgaben.length;
    const prozent =
      autoPunkte > 0 ? Math.round((erreicht / autoPunkte) * 100) : null;
    const note = prozent === null ? null : noteFuerProzent(prozent);
    // Prozent für die (nicht benotete) Übungsblatt-Rückmeldung aus der Anzahl.
    const prozentAnzahl =
      autoAnzahl > 0 ? Math.round((richtig / autoAnzahl) * 100) : null;
    return {
      bewertungen,
      erreicht,
      autoPunkte,
      zuPruefen,
      richtig,
      autoAnzahl,
      prozent,
      prozentAnzahl,
      note,
    };
  }, [paper.aufgaben, antworten, gradedAnswers]);

  function setAntwort(i: number, v: Antwort) {
    setAntworten((prev) => ({ ...prev, [i]: v }));
  }

  async function gradeOpenAnswers() {
    // Sammle alle offenen Aufgaben mit Antworten.
    // Offene Aufgaben sowie Rechnen/Kurzantwort, die nicht exakt stimmen.
    const toGrade = paper.aufgaben
      .map((a, i) => ({
        aufgabeIndex: i,
        aufgabe: a,
        antwort: antworten[i],
      }))
      .filter(
        (x): x is { aufgabeIndex: number; aufgabe: typeof x.aufgabe; antwort: string } =>
          typeof x.antwort === "string" &&
          x.antwort.trim() !== "" &&
          gradeAnswer(x.aufgabe, x.antwort).grade === "review",
      );

    if (toGrade.length === 0) return;

    try {
      const response = await apiFetch("/api/grade", {
          answers: toGrade.map((x) => ({
            aufgabeIndex: x.aufgabeIndex,
            frage: x.aufgabe.frage,
            antwort: x.antwort,
            loesung: x.aufgabe.loesung,
            erklaerung: x.aufgabe.erklaerung,
            punkte: x.aufgabe.punkte,
          })),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const resultMap = (data.results as Array<{ aufgabeIndex: number; punkte: number; feedback: string }>).reduce(
        (acc, r) => ({ ...acc, [r.aufgabeIndex]: r }),
        {} as Record<number, GradedAnswer>,
      );
      setGradedAnswers(resultMap);
      setGradingError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bewertung fehlgeschlagen";
      setGradingError(msg);
      console.error("Grading error:", err);
      // Fallback: Bewertungen auf "Selbst prüfen" setzen, Fehler anzeigen.
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 print-page">
      {/* Steuerleiste – wird beim Drucken ausgeblendet */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
        >
          ← Neuer Test <En>New test</En>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <ModeButton
              active={mode === "interaktiv"}
              onClick={() => setMode("interaktiv")}
            >
              Interaktiv <En>Interactive</En>
            </ModeButton>
            <ModeButton
              active={mode === "drucken"}
              onClick={() => setMode("drucken")}
            >
              Drucken / PDF <En>Print / PDF</En>
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
                Lösungen anhängen <En>Include answers</En>
              </label>
              <button
                onClick={handlePdf}
                disabled={pdfLaedt}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {pdfLaedt ? (
                  <>
                    PDF wird erstellt… <En hell>Creating PDF</En>
                  </>
                ) : (
                  <>
                    📄 PDF herunterladen <En hell>Download PDF</En>
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                🖨️ Drucken <En hell>Print</En>
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
          {paper.aufgaben.length} Aufgaben
          {benotet && ` · ${gesamtPunkte} Punkte`} · Bearbeitungszeit:{" "}
          {paper.bearbeitungszeit}
          {mode === "drucken" && "  ·  Name: ______________   Datum: __________"}
        </p>
      </header>

      {/* Fortschritt (interaktiv, vor Abgabe) */}
      {mode === "interaktiv" && !abgegeben && (
        <div className="no-print mb-5">
          <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Fortschritt <En>Progress</En>
            </span>
            <span>
              {beantwortet} von {paper.aufgaben.length} beantwortet{" "}
              <En>answered</En>
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
          bewertungen={auswertung.bewertungen}
          benotet={benotet}
          gradedAnswers={gradedAnswers}
        />
      ) : (
        <PrintView
          paper={paper}
          mitLoesungen={loesungenDrucken}
          benotet={benotet}
        />
      )}

      {/* Interaktiv: Abgeben / Auswertung */}
      {mode === "interaktiv" && (
        <div className="no-print mt-8">
          {!abgegeben ? (
            <button
              onClick={async () => {
                setAbgegeben(true);
                await gradeOpenAnswers();
              }}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              Abgeben & auswerten <En hell>Submit & check</En>
            </button>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              {benotet ? (
                <>
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
                        {gradedAnswers && (
                          <span className="ml-2 text-xs text-slate-400">(vorläufig / preliminary)</span>
                        )}
                      </p>
                    </>
                  )}
                  {!auswertung.note && gradedAnswers === null && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      wird bewertet… <En>grading</En>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {auswertung.erreicht} / {auswertung.autoPunkte} Punkte <En>points</En>
                    {gradedAnswers === null &&
                      paper.aufgaben.some((a) => a.typ === "offen")
                      ? " (teilweise automatisch bewertet)"
                      : " (automatisch bewertet)"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auswertung.richtig} von {auswertung.autoAnzahl} richtig{" "}
                    <En>correct</En>
                  </p>
                  {auswertung.prozentAnzahl !== null && (
                    <p className="mt-2 text-lg font-bold text-indigo-600 dark:text-indigo-300">
                      {ermutigung(noteFuerProzent(auswertung.prozentAnzahl).note)}
                    </p>
                  )}
                </>
              )}
              {gradingError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  ⚠️ Bewertung nicht möglich <En>Grading failed</En>: {gradingError}
                </p>
              )}
              {auswertung.zuPruefen > 0 && !gradedAnswers && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {auswertung.zuPruefen} offene Antwort(en) werden bewertet…{" "}
                  <En>grading open answers</En>
                </p>
              )}
              {benotet && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Richtwert nach prozentualer Punktzahl – der genaue
                  Notenschlüssel kann je nach Lehrkraft abweichen.
                </p>
              )}
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setAbgegeben(false);
                    setAntworten({});
                    setGradedAnswers(null);
                    setGradingError(null);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  Nochmal versuchen <En>Try again</En>
                </button>
                <button
                  onClick={onReset}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Neuer Test <En hell>New test</En>
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
  bewertungen,
  benotet,
  gradedAnswers,
}: {
  paper: TestPaper;
  antworten: Record<number, Antwort>;
  setAntwort: (i: number, v: Antwort) => void;
  abgegeben: boolean;
  bewertungen: { grade: Grade; punkte: number }[];
  benotet: boolean;
  gradedAnswers: Record<number, GradedAnswer> | null;
}) {
  return (
    <ol className="space-y-5">
      {paper.aufgaben.map((a, i) => {
        const { grade, punkte } = bewertungen[i];
        const luecken = lueckenLoesungen(a);
        const ring = abgegeben
          ? grade === "correct"
            ? "ring-emerald-300 dark:ring-emerald-800"
            : grade === "review" || grade === "partial"
              ? "ring-amber-300 dark:ring-amber-800"
              : "ring-red-300 dark:ring-red-800"
          : "ring-slate-200 dark:ring-slate-800";
        return (
          <li
            key={i}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 dark:bg-slate-900 ${ring}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="whitespace-pre-line font-medium leading-loose text-slate-900 dark:text-slate-100">
                <span className="mr-2 text-slate-400 dark:text-slate-500">
                  {i + 1}.
                </span>
                {luecken ? (
                  // Lückentext: Eingabe direkt in jeder Lücke.
                  <LueckenText
                    frage={a.frage}
                    luecken={luecken}
                    value={Array.isArray(antworten[i]) ? antworten[i] : []}
                    onChange={(v) => setAntwort(i, v)}
                    abgegeben={abgegeben}
                  />
                ) : (
                  a.frage
                )}
              </div>
              {benotet && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {abgegeben && grade !== "review"
                    ? `${punkte} / ${a.punkte} P` +
                      (gradedAnswers && i in gradedAnswers
                        ? ` (${Math.round((punkte / a.punkte) * 100)}%)`
                        : "")
                    : `${a.punkte} P`}
                </span>
              )}
            </div>

            {!luecken && (
              <div className="mt-3">
                <AnswerInput
                  aufgabe={a}
                  index={i}
                  value={
                    Array.isArray(antworten[i])
                      ? antworten[i].join(" ")
                      : antworten[i]
                  }
                  onChange={(v) => setAntwort(i, v)}
                  disabled={abgegeben}
                />
              </div>
            )}

            {abgegeben && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {grade === "correct" ? (
                    <>
                      ✅ Richtig <En>Correct</En>
                    </>
                  ) : grade === "partial" ? (
                    <>
                      🟡 Teilweise richtig <En>Partly correct</En>
                    </>
                  ) : grade === "review" ? (
                    <>
                      🔍 Selbst prüfen <En>Check yourself</En>
                    </>
                  ) : (
                    <>
                      ❌ Nicht korrekt <En>Incorrect</En>
                    </>
                  )}
                </p>
                {/* Feedback von Claude-Bewertung für offene Aufgaben. */}
                {gradedAnswers && i in gradedAnswers && (
                  <p className="mt-1 text-emerald-700 dark:text-emerald-300">
                    {gradedAnswers[i].feedback}
                  </p>
                )}
                {a.typ !== "offen" && (
                  <>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">
                      <span className="font-medium">
                        Lösung <En>Answer</En>:
                      </span>{" "}
                      {a.typ === "multiple_choice" && a.optionen.length > 0
                        ? (() => {
                            const idx = a.optionen.findIndex(
                              (o) => normalize(o) === normalize(a.loesung),
                            );
                            return idx >= 0
                              ? `${BUCHSTABEN[idx]}) ${a.loesung}`
                              : a.loesung;
                          })()
                        : a.loesung}
                    </p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      {a.erklaerung}
                    </p>
                  </>
                )}
                {a.typ === "offen" && !(gradedAnswers && i in gradedAnswers) && (
                  <>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">
                      <span className="font-medium">
                        Erwartungshorizont <En>Model answer</En>:
                      </span>{" "}
                      {a.loesung}
                    </p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      <span className="font-medium">
                        Bewertungskriterien <En>Grading criteria</En>:{" "}
                      </span>
                      {a.erklaerung}
                    </p>
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Aufgabentext mit kleinen Eingabefeldern an jeder Lücke. */
function LueckenText({
  frage,
  luecken,
  value,
  onChange,
  abgegeben,
}: {
  frage: string;
  luecken: string[][];
  value: string[];
  onChange: (v: string[]) => void;
  abgegeben: boolean;
}) {
  const teile = frageTeile(frage);
  return (
    <>
      {teile.map((teil, k) => {
        if (k === teile.length - 1) return <span key={k}>{teil}</span>;
        const loesungen = luecken[k];
        const richtig = lueckeRichtig(value[k], loesungen);
        // Breite passend zur längsten Lösung (mind. 4 Zeichen).
        const breite = Math.max(4, ...loesungen.map((l) => l.length)) + 2;
        return (
          <span key={k}>
            {teil}
            <span className="inline-flex items-baseline gap-1">
              <input
                type="text"
                aria-label={`Lücke ${k + 1}`}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                size={breite}
                className={
                  "mx-1 rounded-md border-b-2 bg-slate-50 px-1.5 py-0.5 text-center font-normal text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-500 dark:bg-slate-800 dark:text-slate-100 " +
                  (abgegeben
                    ? richtig
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                    : "border-slate-400 dark:border-slate-500")
                }
                value={value[k] ?? ""}
                onChange={(e) => {
                  const neu = [...value];
                  // Lücken davor auffüllen, damit Indizes stimmen.
                  for (let j = 0; j < teile.length - 1; j++) neu[j] ??= "";
                  neu[k] = e.target.value;
                  onChange(neu);
                }}
                disabled={abgegeben}
              />
              {abgegeben && !richtig && (
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  → {loesungen[0]}
                </span>
              )}
            </span>
          </span>
        );
      })}
    </>
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
            {opt}{" "}
            <En hell={value === opt}>
              {opt === "Richtig" ? "True" : "False"}
            </En>
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
        placeholder="Deine Ausarbeitung… (your answer)"
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
      placeholder="Deine Antwort… (your answer)"
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
  benotet,
}: {
  paper: TestPaper;
  mitLoesungen: boolean;
  benotet: boolean;
}) {
  const gesamt = paper.aufgaben.reduce((s, a) => s + a.punkte, 0);
  return (
    <div>
      <ol className="space-y-6">
        {paper.aufgaben.map((a, i) => (
          <li key={i} className="avoid-break">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-line font-medium leading-loose text-slate-900 dark:text-slate-100">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                {a.frage}
              </p>
              {benotet && (
                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  ({a.punkte} P)
                </span>
              )}
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
            ) : lueckenLoesungen(a) ? null : (
              // Platz zum handschriftlichen Lösen – offene Aufgaben bekommen
              // mehr Zeilen. Lückentexte werden direkt in den Lücken gelöst.
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

      {/* Notenschlüssel-Hinweis (Richtwert) – nur bei benoteten Tests */}
      {benotet && (
        <p className="avoid-break mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-medium">Notenschlüssel (Richtwert): </span>
          {notenschluesselText(gesamt)}
          <span className="mt-1 block">
            Punkte des Tests. Der genaue Schlüssel kann je nach Lehrkraft
            abweichen.
          </span>
        </p>
      )}

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
