// Verbindlicher Stoffrahmen Jahrgangsstufe 9 laut LehrplanPLUS Bayern (Gymnasium),
// Schlüssel "Klasse|Fach|Thema" wie in curriculum.ts.
export const LEHRPLAN_K9: Record<string, string> = {
  "9|Mathematik|Quadratwurzeln":
    "Quadratwurzeln definieren und bestimmen (auch im Kopf); Irrationalität von √2 (indirekter Beweis), reelle Zahlen; Heron-Verfahren; Rechnen mit Wurzeltermen: Produkte, Quotienten, Summen, Differenzen zusammenfassen, Nenner rational machen, teilweises Radizieren auch mit Variablen (Beträge).",
  "9|Mathematik|Quadratische Funktionen und quadratische Gleichungen":
    "Parameter in a · (x + d)² + e; Scheitelpunkt durch quadratische Ergänzung; Graph, Wertemenge, Nullstellen, Monotonie; quadratische Gleichungen mit Lösungsformel oder Ausklammern; allgemeine Form, Scheitelpunktform, Nullstellenform; Anwendungen: lineare Gleichungssysteme mit drei Unbekannten zur Koeffizientenbestimmung, Bruchgleichungen, die auf quadratische Gleichungen führen, Schnitt Gerade–Hyperbel, Extremwertprobleme.",
  "9|Mathematik|Wahrscheinlichkeit verknüpfter Ereignisse":
    "Schnitt- und Vereinigungsmengen von Ereignissen; Mengendiagramme und Vierfeldertafeln; verbale ↔ formale Beschreibung; relative Häufigkeiten als Wahrscheinlichkeiten; P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
  "9|Mathematik|Ähnlichkeit und Strahlensatz":
    "Ähnlichkeit, besonders bei Dreiecken prüfen; Strahlensätze in inner- und außermathematischen Aufgaben, entstehende Bruchgleichungen lösen; Flächen und Volumina bei maßstäblicher Vergrößerung/Verkleinerung.",
  "9|Mathematik|Potenzfunktionen":
    "Nur natürliche Exponenten bei a · xⁿ: Graphenverlauf und Symmetrie abhängig von a und n; allgemeine Wurzel, Gleichungen xⁿ = c mit Anzahl der Lösungen; Potenzen mit rationalen Exponenten als Wurzelschreibweise und Rechengesetze für Produkte und Quotienten.",
  "9|Mathematik|Satz des Pythagoras":
    "Beweis des Satzes, Satz vs. Umkehrung; Berechnungen an rechtwinkligen Dreiecken und vielfältige Anwendungen mit Skizzen.",
  "9|Mathematik|Trigonometrie am rechtwinkligen Dreieck":
    "Sinus, Kosinus, Tangens als Seitenverhältnisse im rechtwinkligen Dreieck; (sin α)² + (cos α)² = 1, tan α = sin α / cos α, cos α = sin(90° − α); Anwendungsaufgaben. Erweiterung: Sinus und Kosinus von 0° bis 360° am Einheitskreis, Sinussatz, Kosinussatz.",

  "9|Deutsch|Erörterung (linear und dialektisch)":
    "Altersgemäße (z. B. gesellschaftspolitische) Fragen erörtern; auf Gegenargumente eingehen, abwägend schlussfolgern; Aufbau linear, antithetisch oder nach Sachgebieten mit formalem Gliederungssystem.",
  "9|Deutsch|Analyse von Sachtexten":
    "Informierende und argumentierende Texte (ggf. vergleichend) untersuchen: Kernaussagen, Struktur, Argumentationsweise, Adressatenbezug, Intention, sprachliche Gestaltung; inhaltliche und argumentative Qualität beurteilen.",
  "9|Deutsch|Kurzgeschichten und epische Texte":
    "Handlung und erzählte Welt (Figurengestaltung, Motivierung), Darstellungsweise (Erzählerstandort, innerer Monolog, erlebte Rede); über Inhalt, Aufbau und ausgewählte Gestaltungsmittel informieren; erste Deutungshypothesen.",
  "9|Deutsch|Bewerbung und Lebenslauf":
    "Laut Lehrplan nur Gesprächssituationen (ggf. Bewerbungsgespräch) mit angemessenem Sprachregister; schriftliche Bewerbung und Lebenslauf sind nicht ausdrücklich genannt – nur einfache, praxisnahe Aufgaben.",
  "9|Deutsch|Rhetorik":
    "Rhetorische Mittel sach- und adressatengerecht einsetzen, stimmliche und nonverbale Mittel; Mittel sprachlicher Manipulation erkennen (z. B. Wortwahl, Wiederholung, suggestive Bilder).",
  "9|Deutsch|Zeichensetzung":
    "Nicht eigens genannt; erweitertes grammatikalisches und orthografisches Regelwissen sicher bei der Textgestaltung anwenden.",

  "9|Physik|Energie als Erhaltungsgröße (mechanisch, elektrisch)":
    "Energieformen (kinetische Energie, Höhenenergie, Spannenergie) und Energieerhaltung, quantitativ für Höhen- und kinetische Energie; mechanische Arbeit als Kraft mal Weg, Wegunabhängigkeit der Hubarbeit; Leistung; Kraft, Energie, Arbeit, Leistung unterscheiden. Elektrisch: Ladung als Vielfaches der Elementarladung, Stromstärke präzisiert, Spannung als Potentialdifferenz, Zusammenhang Energie, Leistung, Spannung, Stromstärke, Schaltungen mit maximal drei Widerständen, Wirkungsgrad.",
  "9|Physik|Atome":
    "Photonenmodell, Farbe und Photonenenergie, UV- und IR-Strahlung und ihre Risiken; diskrete und kontinuierliche Spektren; Energiestufenmodell, Absorption und Emission von Photonen mit einfachen Berechnungen; Absorptionsspektrum der Erdatmosphäre. Kein Rutherford-Atommodell oder Kernphysik.",
  "9|Physik|Wärmelehre (Teilchenmodell)":
    "Temperatur als Maß der mittleren kinetischen Energie, absolute Temperatur; innere Energie; Energie bei Aggregatzustandsänderungen; Druck als Zustandsgröße, Druckänderung bei Volumen- oder Temperaturänderung nur halbquantitativ; Druckunterschied als Ursache für Teilchenströme.",
  "9|Physik|Thermischer Energietransport und Klima":
    "Spezifische Wärmekapazität; Wärme als Prozessgröße, Änderung der inneren Energie durch Arbeit oder Wärme; Wärmeleitung, Konvektion, Wärmestrahlung; Treibhauseffekt, Strahlungsgleichgewicht, natürliche und anthropogene Beiträge, Klimaschutz; NTG-Profil: thermische Ausdehnung, Meeresspiegelanstieg, Rückkopplungen (Eis-Albedo), Kippelemente.",

  "9|Biologie|Mikroorganismen in der Biotechnologie":
    "Bakterien (prokaryotische Zelle), Abgrenzung zu Pilzen/Hefen; Zweiteilung, exponentielles Wachstum; Milchsäuregärung, alkoholische Gärung, Zellatmung nur als Reaktionsschemata; Nutzung in Lebensmittel-, Futtermittel-, Biogasproduktion; Lebensmittelverderb, Hygiene, Konservierung.",
  "9|Biologie|Genetik und Gentechnik":
    "Proteinvielfalt, DNA als Informationsträger (einfaches Modell), Grundprinzip der Proteinbiosynthese, Enzyme, Genwirkkette; Bakterienchromosom, Plasmid, Chromosomen (Autosomen, Gonosomen, homologe), Replikation, Zellzyklus mit vereinfachter Mitose; Meiose vereinfacht, Befruchtung, Meiosefehler (z. B. Trisomie 21), Karyogramm, Präimplantations- und Pränataldiagnostik; Prinzip der Gentechnik (Einbau von Fremd-DNA) und ethische Aspekte.",
  "9|Biologie|Evolution":
    "Belege (fossile Abstammungsreihen, Brückentiere); erweiterte Evolutionstheorie; Evolutionsfaktoren genetische Variabilität, natürliche Selektion, geographische Isolation; Angepasstheit als Selektionsvorteil; Artentstehung.",
  "9|Biologie|Biodiversität bei Wirbellosen":
    "Insekten im Vergleich mit Wirbeltieren: Außenskelett aus Chitin, Bewegung in Land, Luft, Wasser; Tracheensystem, offener Blutkreislauf, Mundwerkzeuge und Nahrungsquellen (Bestäubung, Destruenten, Krankheitsübertragung); Fortpflanzung, Häutung, unvollkommene/vollkommene Metamorphose; Strickleiternervensystem, Facettenauge, Signale (Mimikry, Mimese, Pheromone), Staatenbildung; Formenkenntnis.",
  "9|Biologie|Ökosystem Boden":
    "Bodeneigenschaften (Wasserkapazität, Korngröße, Horizonte); Nahrungsnetz und Energiefluss; Humusbildung und Mineralisierung (Regenwurm, Bakterien); einfacher Kohlenstoffkreislauf (Produzenten, Konsumenten, Destruenten); menschliche Einflüsse (Düngung, Schadstoffe, Verdichtung, Versiegelung, Erosion), nachhaltige Bodenbewirtschaftung.",

  "9|Geschichte|Weimarer Republik – die erste deutsche Demokratie":
    "Novemberrevolution und Weimarer Reichsverfassung; Belastungsfaktoren (antidemokratisches Denken, Versailler Vertrag, Justiz); Krisenjahr 1923, Inflation; Stabilisierung; Weltwirtschaftskrise und Ende der Republik, Aufstieg der NSDAP. Daten: 1918, 1923, 1929, 30. Januar 1933.",
  "9|Geschichte|Nationalsozialismus, Zweiter Weltkrieg und Holocaust":
    "NS-Ideologie; Machtausbau (Ermächtigungsgesetz, Gleichschaltung, Propaganda, Terror); Leben im totalitären Staat, Volksgemeinschaft; Expansionspolitik und Zweiter Weltkrieg; Antisemitismus, Nürnberger Gesetze, Holocaust/Shoa, Konzentrations- und Vernichtungslager; Widerstand (Weiße Rose, 20. Juli 1944); Kriegsende. Daten: 9. November 1938, 1939–1945, 20. Juli 1944, 8./9. Mai 1945. Sachlich und respektvoll formulieren.",
  "9|Geschichte|Menschenrechte gestern und heute":
    "Ständegesellschaft; amerikanische Unabhängigkeitserklärung 1776 und Menschenrechtserklärung 1789; Grund- und Menschenrechte im Kaiserreich, in der Weimarer Republik, im Nationalsozialismus und in der Bundesrepublik; UN-Menschenrechtscharta, Europäische Menschenrechtskonvention; heutige Durchsetzungsprobleme.",
  "9|Geschichte|Deutschland und die Siegermächte 1945–1949":
    "Potsdamer Konferenz (Besatzung, Entnazifizierung); Flucht und Vertreibung, Versorgung, politischer Neuanfang in Bayern (Verfassung 1946); Zerfall der Anti-Hitler-Koalition; Teilung und doppelte Staatsgründung 1949, Grundgesetz.",
  "9|Geschichte|Weltpolitik im Kalten Krieg":
    "Blockbildung (NATO, Warschauer Pakt), Westintegration unter Adenauer, Deutsche Frage; Kuba-Krise 1961/62; Vietnamkrieg als Stellvertreterkrieg und seine Medienbilder; Entspannungspolitik, Umbruch im Ostblock ab 1989/90; Entkolonialisierung an einem Beispiel.",
};
