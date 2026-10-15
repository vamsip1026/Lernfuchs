# Kids – Lernfuchs (Testaufgaben-Generator)

A German-language web app ("Lernfuchs 🦊") that generates school practice tests ("Übungstests")
for the owner's son using the Claude API. Pick Klasse → Fach → Thema (optional
Schwerpunkt) → Prüfungsart → Schwierigkeit → Aufgabenformat; the AI returns a
full test. Output as an interactive auto-graded quiz **and** a printable PDF.

## How to run

The app lives in `Kids/Lernfuchs/` (the `Kids` folder is a container for several
kid apps). Run all commands from inside `Lernfuchs/`:

```bash
npm install
# create .env.local in the project root with your key:
#   ANTHROPIC_API_KEY=sk-ant-...
#   ANTHROPIC_MODEL=claude-sonnet-5-5   # optional; default is claude-opus-5-5
npm run dev            # http://localhost:3000
# production: npm run build && npm start
```

Nothing works without a valid `ANTHROPIC_API_KEY` in `.env.local` (git-ignored).
The server reads env vars only at startup — restart after changing them.

> Note: inside the Claude Code sandbox, `npm run dev` can 404 due to a
> file-watcher limit (EMFILE); use `npm run build && npm start` there. On a
> normal machine `npm run dev` works fine.

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS v4**.
- **@anthropic-ai/sdk** (v0.70.x) — structured outputs via the **beta** API:
  `client.beta.messages.parse` + `betaZodOutputFormat`. Requires **Zod v4**
  (the beta helper uses `z.toJSONSchema`).
- **@react-pdf/renderer** — one-click PDF, dynamically imported so it stays out
  of the SSR/initial bundle.
- Default model `claude-opus-5-5`, overridable via `ANTHROPIC_MODEL`.

## Key files

- `lib/curriculum.ts` — Klassen 5–10 subjects/topics, `PRUEFUNGSARTEN`,
  `AUFGABENFORMATE`, `SCHWIERIGKEITEN`, `LEHRWERKE` (textbooks by subject),
  and helpers `faecherFuerKlasse`, `themenFuer`, `lehrwerkFuer`.
- `lib/schema.ts` — Zod schemas + types: `TestPaper`/`Aufgabe`,
  `GenerateRequest`, `SubtopicRequest`/`SubtopicResult`.
- `lib/anthropic.ts` — Claude client, prompt builder, `generateTestPaper`,
  `suggestSubtopics`.
- `lib/pdf.tsx` — builds the downloadable PDF from a `TestPaper`.
- `lib/verlauf.ts` — browser history (localStorage).
- `lib/ui.ts` — per-subject emoji/accent map (`fachStil`) + `ermutigung` (grade praise).
- `STORY.md` — plain-English build storyline (one chapter per iteration); update
  it when a notable iteration ships.
- `app/page.tsx` — selection form + Verlauf list.
- `app/TestView.tsx` — interactive quiz (auto-grade + Note 1–6) and print/PDF view.
- `app/api/generate/route.ts`, `app/api/subtopics/route.ts` — server routes
  (keep the API key server-side).

## Student profile & curriculum (ground truth)

- **Gymnasium Bayern, G9 / LehrplanPLUS**; son in **Klasse 8** at **ASG,
  Erlangen**; Ausbildungsrichtung **NTG**; 2. Fremdsprache **Französisch**
  (no Latein); **no Geographie in Klasse 8**.
- Structural facts baked into `curriculum.ts`: Geschichte from Kl. 6,
  Geographie only in 5/7/10, Physik/Chemie/Biologie standalone from Kl. 8,
  Natur und Technik in 5–7, Französisch from Kl. 6.
- Topics for Mathe, Geschichte, Physik, Biologie, Geographie were verified
  against the official LehrplanPLUS; Natur und Technik, Chemie 9/10 and the
  language/Deutsch/Religion lists are representative (free-text + "Unterthemen
  vorschlagen" cover gaps).
- Textbooks (`LEHRWERKE`, fed into prompts): Mathe=Lambacher Schweizer,
  Deutsch=Deutschbuch (Cornelsen), Englisch=Green Line, Französisch=Découvertes,
  Physik=Dorn-Bader, Chemie=Galvani, Biologie=Fokus Biologie,
  Geschichte=Geschichte und Geschehen (Klett), Religion/Ethik=Abenteuer Ethik.

## Features implemented

- Prüfungsart drives the paper (Übungsblatt, Stegreifaufgabe/Ex, **Angekündigter
  kleiner Leistungsnachweis (kLN)**, Schulaufgabe, Test/Vokabeltest, mündliche
  Abfrage); number of questions derived from it (no manual count).
- **Inhalte-Builder**: a test's scope is a list of items, each a Thema that is
  the whole topic or narrowed to selected Unterthemen (multi-select chips + AI
  suggest via `/api/subtopics` + free text). Supports multiple Themen with mixed
  full/partial coverage (e.g. a Schulaufgabe spanning several topics). The
  request sends `inhalte: {thema, unterthemen[]}[]`; the server sets
  `paper.thema` to a readable summary (`inhalteSummary`).
- Long-form `offen` tasks: print = writing space + Erwartungshorizont; interactive
  = textarea, self-check only.
- Interactive auto-grading with a **Note (1–6)**; `NOTEN_SCHLUESSEL` in TestView.
- Print/PDF: "Lösungen anhängen" toggle (default OFF → student sheet), one-click
  **PDF herunterladen**, and a Notenschlüssel line at the end.
- **Verlauf** (browser history) of generated tests.
- **UI**: "Lernfuchs" friendly theme — gradient hero, per-subject emoji/colours,
  auto dark mode (system), quiz progress bar, motivating results screen (big Note
  badge + praise). Print/PDF stays light & clean. System fonts only (no web-font
  fetch). UI and questions in German; foreign-language subjects use the target language.

## Conventions

- German UI/labels. Keep comments and labels German to match existing code.
- All form fields are mandatory (except Schwerpunkt).
- Don't commit secrets; `.env.local` is git-ignored.

## Open / next steps

**Recommended order:** 1) git → 2) deploy to a public URL → 3) durable
server-side history (fold in with the deploy, since both want a small backend).

- **Deploy to a public URL (Vercel)** so friends can use it — NOT done yet.
  Before sharing: add a **shared passcode gate** on the API routes (friends spend
  the owner's API credits) and set a **monthly spend cap** in the Anthropic
  Console. Decide the default model for the shared app (Sonnet recommended).
- **Save the project to git** (version control + backup; also a prerequisite for
  the Vercel deploy). No git repo yet.
- **Durable / portable history**: the Verlauf is browser-local (localStorage),
  per-device, and lost if browser data is cleared. Consider history backed by
  files or a database so it survives across devices/browsers and isn't easily
  lost. (A delete-confirmation prompt is now in place.)
- Possible later: Informatik (NTG 9/10) and Politik und Gesellschaft (Kl. 10)
  subjects; AI grading of free-text/offen answers.

### Refinements / polish
- Refine the **Prüfungsart names/labels** — wording still being tuned.
- Add **English field-name labels** — open question: full bilingual toggle vs.
  English labels alongside the German ones.
- Revisit the **Übungsblatt** helper note/description — wording is an **open
  question**.
- **PDF Notenschlüssel**: show **point ranges** (e.g. "Note 1: 23–25 P") instead
  of percentages. (Feasible: the PDF knows total points, so derive ranges from
  the existing `NOTEN_SCHLUESSEL` % thresholds × total points.)

### Going public / product (future)
- **Make the URL public / available on the internet** — hosting + a domain
  (extends the Vercel deploy item above).
- **Monetization** — decide a business model (open).
- **Free sample tests** — offer a few tests free, then paid (freemium; tied to
  monetization).
