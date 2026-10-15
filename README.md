# Testaufgaben-Generator

Eine kleine Web-App, mit der man **Klasse · Fach · Thema · Prüfungsart ·
Schwierigkeit · Aufgabenformat** auswählt und einen Test erstellt. Die
**Prüfungsart** (Übungsblatt, Stegreifaufgabe/„Ex", Kurzarbeit, Schulaufgabe,
Test/Vokabeltest, mündliche Abfrage) bestimmt Umfang, Länge, Punktzahl und die
Schwierigkeitsstufung; die Anzahl der Aufgaben ergibt sich daraus automatisch.
Die Aufgaben werden on-demand über die Claude API generiert (Gymnasium Bayern,
LehrplanPLUS).

Der fertige Test gibt es in zwei Varianten:

- **Interaktiv** – im Browser beantworten, automatische Auswertung mit
  Punkten, Lösungen und Erklärungen.
- **Drucken / PDF** – druckfreundliche Ansicht (Aufgabenblatt + separater
  Lösungsschlüssel auf einer eigenen Seite) über „Drucken → Als PDF speichern“.

## Technik

- **Next.js** (App Router, TypeScript) – React-UI + serverseitige Route, damit
  der API-Schlüssel **nie im Browser** landet.
- **Claude API** (`@anthropic-ai/sdk`) mit strukturierter Ausgabe
  (`messages.parse` + Zod-Schema) → garantiert gültiges Test-JSON.
- **Tailwind CSS** für das Styling.

## Einrichtung

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. API-Schlüssel bereitstellen. Lege eine Datei `.env.local` im Projektordner an:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   # optional, Standard ist claude-opus-5-5:
   # ANTHROPIC_MODEL=claude-sonnet-5-5
   ```

   Einen Schlüssel gibt es unter https://console.anthropic.com/.
   (Alternativ funktioniert auch ein über `ant auth login` eingerichtetes
   Profil – dann ist kein `ANTHROPIC_API_KEY` nötig.)

3. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

   Dann http://localhost:3000 öffnen.

## Modellwahl & Kosten

Standard ist `claude-opus-5-5` (höchste Qualität). Für Schulaufgaben reicht
`claude-sonnet-5-5` meist völlig aus und ist ca. 5× günstiger – einfach
`ANTHROPIC_MODEL=claude-sonnet-5-5` in `.env.local` setzen.

## Lehrplan erweitern

Fächer und Themenvorschläge stehen in [`lib/curriculum.ts`](lib/curriculum.ts).
Dort lassen sich weitere Klassen, Fächer und Themen ergänzen. Unabhängig davon
kann im Formular jederzeit ein **eigenes Thema** eingegeben werden.
