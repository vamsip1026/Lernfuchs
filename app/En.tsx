/** Kleine englische Übersetzung hinter einem deutschen Bedienelement. */
export function En({
  children,
  hell = false,
}: {
  children: React.ReactNode;
  // hell = auf farbigem Hintergrund mit weißer Schrift
  hell?: boolean;
}) {
  return (
    <span
      className={
        "ml-1 text-xs font-normal " +
        (hell ? "text-white/70" : "text-slate-400 dark:text-slate-500")
      }
    >
      ({children})
    </span>
  );
}
