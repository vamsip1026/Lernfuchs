// UI-Hilfen: pro Fach ein Emoji + Akzentfarben, plus kleine Motivationstexte.
// WICHTIG: Tailwind erzeugt keine dynamischen Klassennamen (`bg-${x}`), daher
// stehen hier vollständige Klassen-Strings.

export type FachStil = {
  emoji: string;
  dot: string; // kleiner Farbpunkt
  soft: string; // Badge: Hintergrund + Text + Ring (hell/dunkel)
};

const DEFAULT_STIL: FachStil = {
  emoji: "📚",
  dot: "bg-slate-400",
  soft: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
};

export const FACH_STIL: Record<string, FachStil> = {
  Mathematik: {
    emoji: "📐",
    dot: "bg-blue-500",
    soft: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900",
  },
  Deutsch: {
    emoji: "✍️",
    dot: "bg-rose-500",
    soft: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
  },
  Englisch: {
    emoji: "💬",
    dot: "bg-violet-500",
    soft: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900",
  },
  Französisch: {
    emoji: "🥐",
    dot: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900",
  },
  Latein: {
    emoji: "🏛️",
    dot: "bg-amber-600",
    soft: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  },
  Physik: {
    emoji: "⚛️",
    dot: "bg-cyan-500",
    soft: "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:ring-cyan-900",
  },
  Chemie: {
    emoji: "🧪",
    dot: "bg-teal-500",
    soft: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:ring-teal-900",
  },
  Biologie: {
    emoji: "🧬",
    dot: "bg-green-500",
    soft: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-900",
  },
  Geschichte: {
    emoji: "🏰",
    dot: "bg-amber-500",
    soft: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  },
  Geographie: {
    emoji: "🌍",
    dot: "bg-lime-500",
    soft: "bg-lime-50 text-lime-700 ring-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:ring-lime-900",
  },
  "Natur und Technik": {
    emoji: "🔬",
    dot: "bg-cyan-500",
    soft: "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:ring-cyan-900",
  },
  "Religion / Ethik": {
    emoji: "🕊️",
    dot: "bg-slate-500",
    soft: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
  },
};

export function fachStil(name: string): FachStil {
  return FACH_STIL[name] ?? DEFAULT_STIL;
}

/** Aufmunternder Satz je nach Note (1–6). */
export function ermutigung(note: number): string {
  if (note <= 2) return "Super gemacht! 🎉";
  if (note === 3) return "Gut gemacht! 💪";
  if (note === 4) return "Weiter üben – du schaffst das!";
  return "Dranbleiben, Übung hilft! 📚";
}
