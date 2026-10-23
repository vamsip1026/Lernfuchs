# The Lernfuchs Story 🦊

How a simple idea — "let me generate practice tests for my son" — grew, one
iteration at a time, into a real app. This was my **first AI project**, built
step by step together with an AI coding assistant.

**What Lernfuchs is:** a little web app where you pick a school year, subject and
topic, and the AI instantly writes a full practice test — questions, solutions
and explanations — aligned to the Bavarian *LehrplanPLUS* and my son's actual
schoolbooks. He can take it on screen (auto-graded) or print it as a clean PDF.

Each chapter below is one step in the journey: what we added, and why.

---

## 1. The first version
The starting point: choose **Klasse, Fach and Thema** (plus a test type and
difficulty), and the AI generates a complete test. From day one it worked two
ways — an **interactive quiz** on screen and a **printable PDF** to do with a
pencil — all in German, for the Gymnasium in Bayern.

## 2. Real Bavarian exam types
A generic "test type" wasn't how school actually works, so we switched to real
**Prüfungsarten** — Stegreifaufgabe (*Ex*), angekündigter kleiner
Leistungsnachweis (kLN), Schulaufgabe, Test/Vokabeltest, mündliche Abfrage.
Picking one now shapes the whole paper (length, difficulty, number of
questions), so you no longer set the count by hand.

## 3. Getting the curriculum right
My son pointed out the topics didn't match his year. We checked the **official
LehrplanPLUS** and fixed Klasse 8 properly — dropping Geographie (not taught that
year), adding Chemie, and correcting Mathe/Physik/Geschichte topics. We also fed
in his **actual textbooks** (Green Line, Lambacher Schweizer, Découvertes …) so
the questions follow the books he really uses.

## 4. Practice exactly today's topic
Often he only needs the one small thing covered that day. We added an optional
**Schwerpunkt** (sub-topic) field, with an AI button that **suggests sub-topics**
to pick from — so a test can zoom right in on, say, "Steigung aus zwei Punkten."

## 5. Grades
To make practice feel real, the interactive mode now shows a **Note (1–6)** based
on the points scored, with the German grade label and percentage.

## 6. Better PDFs
We made the printable side genuinely useful: a toggle to **leave the answers off**
(so I can hand him a clean sheet and keep the answer key for myself), a
**one-click PDF download** that skips the browser dialog, and a small
**Notenschlüssel** (grading scale) printed at the bottom.

## 7. A memory of past tests
No more losing work: every generated test is now **saved automatically** in a
**Verlauf** (history) list — reopen, retake, or re-print any of them. After an
accidental deletion, we also added a **confirmation prompt** before anything is
removed.

## 8. Every school year
We seeded the topics for **all years, Klasse 5–10** (checked against the official
curriculum), so the app grows with him instead of being stuck on one year.

## 9. A friendlier look (Lernfuchs 🦊)
Time for some polish and a name. We added a colourful hero header, **per-subject
colours and emojis**, a **progress bar** while taking a test, and a **motivating
results screen** (a big grade badge and an encouraging line). It also follows the
device's **dark mode** automatically — while the printed sheet stays clean.

## 10. Tidying up
As I started thinking about more kid apps, we reorganized everything into a
**`Kids` folder** with **Lernfuchs** as the first app inside it. We also started
showing the **textbook** on screen and on the PDF as a read-only reference, so
it's clear which book a test is based on.

## 11. Flexible scope (the Inhalte-builder)
Real exams often span several topics — some in full, some only a couple of
sub-topics. So the single-topic picker became an **Inhalte-builder**: add as many
Themen as you like, and for each one either keep the whole topic or narrow it to
chosen sub-topics. Perfect for building a Schulaufgabe exactly like the syllabus.

## 12. Points where they belong
Grading got more honest. A test only shows **points, a Note and a Notenschlüssel
when it's actually a graded Leistungsnachweis**; an **Übungsblatt stays
pressure-free** — no points, no grade, just "X von Y richtig" and an encouraging
line. And the printed grading key now lists **point ranges** (e.g. "Note 1:
22–25 P") instead of percentages, so it reads like a real exam key.

## 13. Easier to read
Everyday polish: each field now carries an **English label in brackets** —
Klasse (Class), Fach (Subject), Prüfungsart (Test type) … — and the input boxes
got **clearer, darker borders** so they stand out.

## 14. A safety net (version control)
The whole project went under **git**: every change is now a save point we can
roll back to, with the secret API key kept safely out of the history. It then
got an online home too — a **private GitHub repo** on a personal account — so
there's an off-machine backup (and a base to deploy from later).

## 15. Fill in the blanks — for real
The first real test run in interactive mode showed a gap: a Lückentext came
with one big answer box, and the app couldn't tell right from wrong. Now **each
blank gets its own little input right inside the sentence**, every blank is
checked on its own (green ✓ or red with the correct word), and the task earns
**partial points** — 6 of 8 blanks right gives 3 of 4 points. Small slips like
`n’` vs `n'` or a capital letter don't count as mistakes.

## 16. AI grades free-text answers
Before this, translation and essay answers showed "Selbst prüfen" (self-check only)
and scored 0 points, making the final grade misleading. Now **Claude scores each
free-text answer** (0%, 50%, or 100% for partial/full points) against the
Erwartungshorizont, and gives a 1–2-sentence German hint about what was wrong or
what could be better. The result screen shows **"vorläufig"** (preliminary) while
grading happens in the background, then updates as answers are scored. If grading
fails (timeout, API down), it falls back to "Selbst prüfen".

## 17. Quality fixes from real testing
After your son took a few tests, three issues emerged:

**Multiple choice always had A as correct:** Without explicit instructions, Claude 
naturally gravitated to putting the right answer in the first position. Now the 
prompt says to **distribute correct answers equally across all positions** (A, B, C, D).

**Solution feedback missing the option letter:** When marking an answer wrong, 
students saw "Lösung: the correct text" but not which letter it was. Now it shows 
**"Lösung: B) the correct text"** (computed by finding which option matches).

**Chemistry numbers lost their minus signs:** Oxidation states became wrong 
("-2" → "2"), and ion charges/temperatures lost their signs. The prompt now 
explicitly instructs Claude to **preserve minus signs and use proper chemical notation**
(Cl⁻, Ca²⁺, -114 kJ/mol, etc.).

## 18. What's next
Still on the list: a **public web address** so friends can use it too, a **more
durable history** that isn't tied to a single browser, and product ideas like
**monetization** and **free sample tests**.

---

*This story is updated whenever a notable new iteration ships.*
