"use client";

import { useEffect, useState } from "react";
import { En } from "./En";

const SPRACHE: Record<string, string> = {
  Französisch: "fr-FR",
  Englisch: "en-GB",
};

const SPRECHER = /^\s*([^:]{1,20}):\s*(.+)$/;

/** Text in vorlesbare Stücke zerlegen; Dialogzeilen "Name: …" merken den Sprecher. */
function stuecke(text: string): { sprecher: string | null; satz: string }[] {
  const ergebnis: { sprecher: string | null; satz: string }[] = [];
  for (const zeile of text.split("\n")) {
    if (!zeile.trim()) continue;
    const m = zeile.match(SPRECHER);
    const sprecher = m ? m[1].trim() : null;
    const inhalt = m ? m[2] : zeile;
    // Kurze Stücke: manche Browser brechen lange Äußerungen nach ~15 s ab.
    for (const satz of inhalt.split(/(?<=[.!?…])\s+/)) {
      if (satz.trim()) ergebnis.push({ sprecher, satz: satz.trim() });
    }
  }
  return ergebnis;
}

/** Hörtext: wird mit der Gerätestimme vorgelesen, Text erst nach Abgabe sichtbar. */
export function Hoertext({
  fach,
  titel,
  inhalt,
  zeigeText,
}: {
  fach: string;
  titel: string;
  inhalt: string;
  zeigeText: boolean;
}) {
  const lang = SPRACHE[fach] ?? "fr-FR";
  const [unterstuetzt, setUnterstuetzt] = useState(true);
  const [stimmen, setStimmen] = useState<SpeechSynthesisVoice[]>([]);
  const [spielt, setSpielt] = useState(false);
  const [langsam, setLangsam] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setUnterstuetzt(false);
      return;
    }
    const synth = window.speechSynthesis;
    const laden = () => {
      const passend = synth
        .getVoices()
        .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(lang.slice(0, 2)));
      // Genau passende Region (fr-FR, en-GB) zuerst.
      passend.sort(
        (a, b) =>
          Number(b.lang.replace("_", "-") === lang) -
          Number(a.lang.replace("_", "-") === lang),
      );
      setStimmen(passend);
    };
    laden();
    synth.addEventListener("voiceschanged", laden);
    return () => {
      synth.removeEventListener("voiceschanged", laden);
      synth.cancel();
    };
  }, [lang]);

  function abspielen() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const teile = stuecke(inhalt);
    if (teile.length === 0) return;
    // Pro Sprecher eine eigene Stimme, falls das Gerät mehrere hat.
    const sprecherListe: string[] = [];
    teile.forEach((t, k) => {
      if (t.sprecher && !sprecherListe.includes(t.sprecher)) {
        sprecherListe.push(t.sprecher);
      }
      const u = new SpeechSynthesisUtterance(t.satz);
      u.lang = lang;
      u.rate = langsam ? 0.65 : 0.9;
      if (stimmen.length > 0) {
        const nr = t.sprecher ? sprecherListe.indexOf(t.sprecher) : 0;
        u.voice = stimmen[nr % stimmen.length];
      }
      if (k === teile.length - 1) {
        u.onend = () => setSpielt(false);
        u.onerror = () => setSpielt(false);
      }
      synth.speak(u);
    });
    setSpielt(true);
  }

  function stoppen() {
    window.speechSynthesis.cancel();
    setSpielt(false);
  }

  return (
    <div className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:ring-sky-900">
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        🎧 Hörtext <En>Listening text</En>: {titel}
      </p>
      {!unterstuetzt ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Dieser Browser kann keinen Text vorlesen.{" "}
          <En>This browser cannot read text aloud.</En>
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {spielt ? (
              <button
                type="button"
                onClick={stoppen}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                ⏹ Stopp <En hell>Stop</En>
              </button>
            ) : (
              <button
                type="button"
                onClick={abspielen}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                ▶️ Anhören <En hell>Listen</En>
              </button>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="accent-sky-600"
                checked={langsam}
                onChange={(e) => setLangsam(e.target.checked)}
              />
              🐢 Langsam <En>Slow</En>
            </label>
          </div>
          {stimmen.length === 0 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Keine {fach === "Englisch" ? "englische" : "französische"} Stimme auf
              diesem Gerät gefunden – es wird die Standardstimme verwendet.{" "}
              <En>No matching voice found on this device.</En>
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Du kannst den Text mehrmals anhören. Der Text erscheint nach der Abgabe.{" "}
            <En>You can listen several times; the text appears after you submit.</En>
          </p>
        </>
      )}
      {zeigeText && (
        <div className="mt-3 rounded-lg bg-white p-3 text-sm dark:bg-slate-900">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            Hörtext <En>Transcript</En>:
          </p>
          <p className="mt-1 whitespace-pre-line text-slate-700 dark:text-slate-300">
            {inhalt}
          </p>
        </div>
      )}
    </div>
  );
}
