/**
 * Lehrplan-Konfiguration (Gymnasium Bayern, LehrplanPLUS).
 *
 * Struktur: Klasse → Fach → Themen. Die Themenlisten sind Vorschläge und
 * decken den Schwerpunkt der Klasse 8 am besten ab. Für andere Klassen gibt es
 * eine Basisliste an Fächern; fehlende Themen können im Formular frei
 * eingegeben werden (Freitextfeld). Einfach erweiterbar: weitere Klassen/Fächer
 * hier ergänzen.
 */

export type Fach = {
  name: string;
  themen: string[];
  // Verwendetes Schulbuch (falls bekannt) – wird dem Prompt als Kontext
  // mitgegeben, damit Begriffe und Reihenfolge zum Unterricht passen.
  lehrwerk?: string;
};

/**
 * Prüfungsarten (Leistungsnachweise am Gymnasium in Bayern). Die Auswahl
 * bestimmt Umfang, Länge, Punktzahl, Schwierigkeitsstufung und die passenden
 * Aufgabenformate. `hinweis` + `fragen` werden in den Prompt eingespeist.
 */
export const PRUEFUNGSARTEN = [
  {
    value: "uebungsblatt",
    label: "Übungsblatt",
    kurz: "Zum Üben – kein benoteter Leistungsnachweis, gemischte Aufgaben.",
    fragen: "etwa 8 bis 12 Aufgaben",
    hinweis:
      "Ein Übungsblatt zum selbstständigen Üben (kein offizieller Leistungsnachweis). Verwende eine ausgewogene Mischung verschiedener Aufgabenformate.",
  },
  {
    value: "stegreifaufgabe",
    label: "Stegreifaufgabe (Ex)",
    kurz: "Kurz & knapp, nur der jüngste Stoff (ca. 15–20 Min).",
    fragen: "etwa 4 bis 6 Aufgaben",
    hinweis:
      "Eine unangekündigte Stegreifaufgabe ('Ex'): kurz, nur der zuletzt behandelte Stoff (1–2 Unterrichtsstunden), Bearbeitungszeit ca. 15–20 Minuten. Überwiegend reproduktive und einfache Transferaufgaben (Anforderungsbereich I–II), eher kurze/geschlossene Aufgaben.",
  },
  {
    value: "kurzarbeit",
    label: "Angekündigter kleiner Leistungsnachweis (kLN)",
    kurz: "Angekündigt, mittlerer Umfang (ca. 20–30 Min) – früher „Kurzarbeit“.",
    fragen: "etwa 6 bis 10 Aufgaben",
    hinweis:
      "Ein angekündigter kleiner Leistungsnachweis (kLN; traditionell „Kurzarbeit“) mittleren Umfangs, Bearbeitungszeit ca. 20–30 Minuten. Anforderungsbereiche I–II, einzelne anspruchsvollere Aufgaben (III).",
  },
  {
    value: "schulaufgabe",
    label: "Schulaufgabe",
    kurz: "Große, mehrteilige Prüfung über eine ganze Einheit (ca. 45 Min+).",
    fragen: "etwa 5 bis 8 Aufgaben bzw. mehrteilige Aufgaben",
    hinweis:
      "Eine große, angekündigte Schulaufgabe über eine ganze Lerneinheit, Bearbeitungszeit ca. 45 Minuten oder mehr, mit hoher Gesamtpunktzahl. Baue die Aufgaben gestuft nach Anforderungsbereichen auf: AFB I (Reproduktion) → AFB II (Reorganisation/Transfer) → AFB III (Reflexion/Problemlösen). Fachabhängig: In Deutsch eine Aufsatzaufgabe (Typ 'offen', z. B. Erörterung oder Textanalyse); in Mathematik mehrteilige Rechen- und Sachaufgaben; in Fremdsprachen eine Mischung aus Grammatik, Übersetzung und Textproduktion.",
  },
  {
    value: "test_vokabeltest",
    label: "Test / Vokabeltest",
    kurz: "Viele kurze Wissens-/Vokabelabfragen (v.a. Sprachen).",
    fragen: "etwa 10 bis 15 kurze Aufgaben",
    hinweis:
      "Ein kurzer Test bzw. Vokabeltest mit vielen kurzen Einzelaufgaben (Anforderungsbereich I). In Fremdsprachen vor allem Vokabel- und Formenabfragen.",
  },
  {
    value: "muendliche_abfrage",
    label: "Mündliche Abfrage",
    kurz: "Wenige kurze Frage-Antwort-Aufgaben (Rechenschaftsablage).",
    fragen: "etwa 4 bis 6 kurze Aufgaben",
    hinweis:
      "Eine mündliche Abfrage (Rechenschaftsablage) mit wenigen kurzen Frage-Antwort-Aufgaben zum zuletzt behandelten Stoff, Anforderungsbereich I–II.",
  },
] as const;

export const DEFAULT_PRUEFUNGSART = "uebungsblatt";

/**
 * Aufgabenformat als optionaler Override. Standard "automatisch" = das Modell
 * wählt die zur Prüfungsart passenden Formate selbst.
 */
export const AUFGABENFORMATE = [
  { value: "automatisch", label: "Automatisch (empfohlen)" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "kurzantwort", label: "Kurzantwort" },
  { value: "rechnen", label: "Rechenaufgaben" },
  { value: "lueckentext", label: "Lückentext" },
  { value: "richtig_falsch", label: "Richtig / Falsch" },
] as const;

export const DEFAULT_AUFGABENFORMAT = "automatisch";

export const SCHWIERIGKEITEN = [
  { value: "leicht", label: "Leicht" },
  { value: "mittel", label: "Mittel" },
  { value: "schwer", label: "Schwer" },
] as const;

export const DEFAULT_SCHWIERIGKEIT = "mittel";

export const KLASSEN = [5, 6, 7, 8, 9, 10] as const;

// Fächer, die in jeder Klasse zur Auswahl stehen (Basis).
const BASIS_FAECHER: Fach[] = [
  { name: "Mathematik", themen: [] },
  { name: "Deutsch", themen: [] },
  { name: "Englisch", themen: [] },
  { name: "Natur und Technik", themen: [] },
  { name: "Geschichte", themen: [] },
  { name: "Geographie", themen: [] },
  { name: "Biologie", themen: [] },
  { name: "Physik", themen: [] },
  { name: "Chemie", themen: [] },
  { name: "Latein", themen: [] },
  { name: "Französisch", themen: [] },
  { name: "Religion / Ethik", themen: [] },
];

// Detaillierte Themen für Klasse 8 (Gymnasium Bayern, G9 / LehrplanPLUS,
// Ausbildungsrichtung NTG). Die naturwissenschaftlichen und
// gesellschaftswissenschaftlichen Fächer (Mathematik, Physik, Chemie,
// Biologie, Geschichte) wurden gegen den offiziellen LehrplanPLUS abgeglichen.
// Für die Sprachen (Englisch, Latein, Französisch) sind die Themen
// kompetenz-/lehrwerksbasiert und als übliche Schwerpunkte zu verstehen –
// das genaue Thema ergibt sich aus dem Schulbuch (Freitext nutzen).
// Hinweis: Geographie wird am Gymnasium in Jahrgangsstufe 8 NICHT unterrichtet.
const KLASSE_8: Fach[] = [
  {
    name: "Mathematik",
    lehrwerk: "Lambacher Schweizer",
    themen: [
      "Funktion und Term",
      "Lineare Funktionen",
      "Elementare gebrochen-rationale Funktionen",
      "Bruchterme und Bruchgleichungen",
      "Lineare Gleichungssysteme",
      "Laplace-Experimente (Wahrscheinlichkeit)",
      "Kreis und Zylinder",
    ],
  },
  {
    name: "Deutsch",
    lehrwerk: "Deutschbuch (Cornelsen)",
    themen: [
      "Argumentieren und begründet Stellung nehmen",
      "Inhaltsangabe",
      "Sachtexte und nichtlineare Texte / Medien",
      "Lyrik und Balladen",
      "Epische Texte / Jugendbuch",
      "Aktiv und Passiv",
      "Konjunktiv und indirekte Rede",
      "Zeichensetzung (Kommasetzung bei Gliedsätzen)",
    ],
  },
  {
    name: "Englisch",
    lehrwerk: "Green Line (Klett)",
    themen: [
      "Simple Past und Present Perfect (progressive)",
      "Conditional sentences (if-clauses Typ I–III)",
      "Passive voice",
      "Reported speech",
      "Relative clauses (defining/non-defining)",
      "Gerund und Infinitiv",
      "Leseverstehen und Textarbeit",
    ],
  },
  {
    name: "Physik",
    lehrwerk: "Dorn-Bader Physik",
    themen: [
      "Elektrischer Strom",
      "Optik",
      "Mechanik: Kräfte und ihre Wirkungen",
      "Mechanik: Dynamik zweidimensionaler Bewegungen",
    ],
  },
  {
    name: "Chemie",
    lehrwerk: "Galvani (NTG)",
    themen: [
      "Stoffe und ihre Eigenschaften (Teilchenmodell)",
      "Chemische Reaktion (Daltonsches Atommodell)",
      "Chemische Verbindungen (Kern-Hülle-Modell)",
      "Wie Chemiker denken und arbeiten",
    ],
  },
  {
    name: "Biologie",
    lehrwerk: "Fokus Biologie (Cornelsen)",
    themen: [
      "Informationsaufnahme und -verarbeitung beim Menschen (Nervensystem, Sinne)",
      "Fortpflanzung und Individualentwicklung des Menschen",
      "Verhalten – genetisch bedingt und erlernt",
      "Suchtgefahren und Gesundheit",
      "Ökosysteme unter dem Einfluss des Menschen",
    ],
  },
  {
    name: "Geschichte",
    lehrwerk: "Geschichte und Geschehen (Klett)",
    themen: [
      "Aufklärung, Französische Revolution und Napoleon",
      "Deutschland zwischen Restauration und Revolution (1848)",
      "Bayern – Identität und kulturelles Erbe",
      "Industrialisierung und Soziale Frage",
      "Das Deutsche Kaiserreich",
      "Imperialismus und Erster Weltkrieg",
    ],
  },
  {
    name: "Französisch",
    lehrwerk: "Découvertes (Klett)",
    themen: [
      "Passé composé und Imparfait",
      "Futur simple",
      "Objektpronomen (COD/COI)",
      "Relativsätze (qui, que, où)",
      "Wortschatz: Alltag und Freizeit",
    ],
  },
  {
    name: "Religion / Ethik",
    lehrwerk: "Abenteuer Ethik",
    themen: ["Weltreligionen", "Ethik und Gewissen", "Gerechtigkeit"],
  },
];

// Hinweis zu allen Klassen: Mathematik, Geschichte, Physik, Biologie und
// Geographie wurden gegen den offiziellen LehrplanPLUS (G9) abgeglichen.
// Natur und Technik, Chemie (9/10) sowie Deutsch, die Sprachen und
// Religion/Ethik sind kompetenz-/lehrwerksbasiert und als übliche Schwerpunkte
// zu verstehen (Freitext bzw. „Unterthemen vorschlagen“ nutzen).
// Fächerbelegung (NTG, 2. Fremdsprache Französisch): Geschichte ab Klasse 6,
// Geographie nur in 5/7/10, Physik/Chemie/Biologie eigenständig ab Klasse 8,
// Natur und Technik in 5–7, Französisch ab Klasse 6.

const RELIGION_ETHIK: Fach = {
  name: "Religion / Ethik",
  themen: ["Weltreligionen", "Ethik und Gewissen", "Gerechtigkeit", "Werte und Normen"],
};

const KLASSE_5: Fach[] = [
  {
    name: "Mathematik",
    themen: [
      "Natürliche und ganze Zahlen – Addition und Subtraktion",
      "Geometrische Figuren und Lagebeziehungen",
      "Natürliche und ganze Zahlen – Multiplikation und Division",
      "Größen und ihre Einheiten",
    ],
  },
  {
    name: "Deutsch",
    themen: [
      "Wortarten",
      "Satzglieder (Subjekt, Prädikat, Objekt)",
      "Erzählen (Erlebniserzählung)",
      "Berichten",
      "Rechtschreibung (Groß-/Kleinschreibung, s-Laute)",
      "Märchen und Fabeln",
    ],
  },
  {
    name: "Englisch",
    themen: [
      "Simple present",
      "to be / have got",
      "Plural der Nomen",
      "Fragen und Verneinung",
      "Present progressive",
      "Wortschatz: school, family, daily routine",
    ],
  },
  {
    name: "Natur und Technik",
    themen: [
      "Naturwissenschaftliches Arbeiten",
      "Kennzeichen von Lebewesen",
      "Wirbeltiere (Säugetiere, Vögel, …)",
      "Blütenpflanzen",
      "Angepasstheit an Lebensräume",
    ],
  },
  {
    name: "Geographie",
    themen: [
      "Geographische Arbeitstechniken",
      "Planet Erde",
      "Naturräume in Bayern und Deutschland",
      "Ländliche Räume in Bayern und Deutschland",
      "Städtische Räume in Bayern und Deutschland",
    ],
  },
  RELIGION_ETHIK,
];

const KLASSE_6: Fach[] = [
  {
    name: "Mathematik",
    themen: [
      "Rationale Zahlen (Brüche und Dezimalzahlen)",
      "Flächeninhalt und Volumen",
      "Prozentrechnung, Daten und Diagramme",
    ],
  },
  {
    name: "Deutsch",
    themen: [
      "Satzglieder und Gliedsätze",
      "Zeitformen (Tempus)",
      "Berichten und Beschreiben",
      "Erzählen",
      "Rechtschreibung und Zeichensetzung",
      "Jugendbuch und Sagen",
    ],
  },
  {
    name: "Englisch",
    themen: [
      "Simple past",
      "Past progressive",
      "Steigerung der Adjektive (comparison)",
      "going-to future",
      "Present perfect (Einführung)",
      "Wortschatz: holidays, London",
    ],
  },
  {
    name: "Französisch",
    themen: [
      "Präsens der Verben auf -er",
      "être, avoir, aller",
      "Artikel und Nomen",
      "Fragen stellen",
      "Zahlen",
      "Wortschatz: sich vorstellen, Familie, Schule",
    ],
  },
  {
    name: "Natur und Technik",
    themen: [
      "Schwerpunkt Biologie: Pflanzen und Tiere vertieft",
      "Fotosynthese (Grundlagen)",
      "Informatik: Information und Daten",
      "Informatik: Dateien und Ordnerstrukturen",
    ],
  },
  {
    name: "Geschichte",
    themen: [
      "Der Mensch und seine Geschichte",
      "Ägypten – eine frühe Hochkultur",
      "Die griechische Antike",
      "Das Imperium Romanum",
      "Von der Antike zum Mittelalter",
    ],
  },
  RELIGION_ETHIK,
];

const KLASSE_7: Fach[] = [
  {
    name: "Mathematik",
    themen: [
      "Terme mit Variablen",
      "Geometrische Figuren: Symmetrie und Winkel",
      "Lineare Gleichungen und Vertiefung der Prozentrechnung",
      "Kenngrößen von Daten",
      "Kongruenz, besondere Dreiecke und Dreieckskonstruktionen",
    ],
  },
  {
    name: "Deutsch",
    themen: [
      "Argumentieren",
      "Inhaltsangabe (Einführung)",
      "Aktiv und Passiv (Einführung)",
      "Satzreihe und Satzgefüge",
      "Balladen",
      "Sachtexte",
    ],
  },
  {
    name: "Englisch",
    themen: [
      "Present perfect vs. simple past",
      "Conditional sentences (Typ I)",
      "Relative clauses",
      "will-future",
      "Modalverben und Ersatzformen",
      "Wortschatz: USA",
    ],
  },
  {
    name: "Französisch",
    themen: [
      "Passé composé",
      "Futur composé (aller + Infinitiv)",
      "Objektpronomen",
      "Verneinung",
      "Wortschatz: Freizeit, Stadt",
    ],
  },
  {
    name: "Natur und Technik",
    themen: [
      "Schwerpunkt Physik: Größen messen und beschreiben",
      "Optik: Licht und Sehen",
      "Kräfte (Einführung)",
      "Akustik: Schall",
    ],
  },
  {
    name: "Geschichte",
    themen: [
      "König und Reich: Herrschaft im Mittelalter",
      "Leben und Kultur im Mittelalter",
      "Neue räumliche und geistige Horizonte",
      "Das konfessionelle Zeitalter",
      "Absolutismus und Barock",
    ],
  },
  {
    name: "Geographie",
    themen: [
      "Geographische Arbeitstechniken",
      "Einheit und Vielfalt in Europa",
      "Naturgeographie Europas im Überblick",
      "Ländliche Räume Europas",
      "Metropolen und Verdichtungsräume in Europa",
      "Meere und Küsten Europas",
    ],
  },
  RELIGION_ETHIK,
];

const KLASSE_9: Fach[] = [
  {
    name: "Mathematik",
    themen: [
      "Quadratwurzeln",
      "Quadratische Funktionen und quadratische Gleichungen",
      "Wahrscheinlichkeit verknüpfter Ereignisse",
      "Ähnlichkeit und Strahlensatz",
      "Potenzfunktionen",
      "Satz des Pythagoras",
      "Trigonometrie am rechtwinkligen Dreieck",
    ],
  },
  {
    name: "Deutsch",
    themen: [
      "Erörterung (linear und dialektisch)",
      "Analyse von Sachtexten",
      "Kurzgeschichten und epische Texte",
      "Bewerbung und Lebenslauf",
      "Rhetorik",
      "Zeichensetzung",
    ],
  },
  {
    name: "Englisch",
    themen: [
      "Conditional sentences (Typ II und III)",
      "Passive voice (alle Zeiten)",
      "Reported speech",
      "Gerund und Infinitiv",
      "Wortschatz: media, globalization",
    ],
  },
  {
    name: "Französisch",
    themen: [
      "Imparfait und Passé composé",
      "Futur simple",
      "Conditionnel",
      "Subjonctif (Einführung)",
      "Relativsätze",
    ],
  },
  {
    name: "Physik",
    themen: [
      "Energie als Erhaltungsgröße (mechanisch, elektrisch)",
      "Atome",
      "Wärmelehre (Teilchenmodell)",
      "Thermischer Energietransport und Klima",
    ],
  },
  {
    name: "Chemie",
    themen: [
      "Elektronenpaarbindung und molekular gebaute Stoffe",
      "Ionenbindung und Salze",
      "Quantitative Betrachtungen (Stoffmenge, molare Masse)",
      "Wasser als Lösungsmittel",
    ],
  },
  {
    name: "Biologie",
    themen: [
      "Mikroorganismen in der Biotechnologie",
      "Genetik und Gentechnik",
      "Evolution",
      "Biodiversität bei Wirbellosen",
      "Ökosystem Boden",
    ],
  },
  {
    name: "Geschichte",
    themen: [
      "Weimarer Republik – die erste deutsche Demokratie",
      "Nationalsozialismus, Zweiter Weltkrieg und Holocaust",
      "Menschenrechte gestern und heute",
      "Deutschland und die Siegermächte 1945–1949",
      "Weltpolitik im Kalten Krieg",
    ],
  },
  RELIGION_ETHIK,
];

const KLASSE_10: Fach[] = [
  {
    name: "Mathematik",
    themen: [
      "Exponentielles Wachstum und Logarithmus",
      "Zusammengesetzte Zufallsexperimente und Simulationen",
      "Sinus- und Kosinusfunktion",
      "Ganzrationale Funktionen",
      "Raumgeometrie",
    ],
  },
  {
    name: "Deutsch",
    themen: [
      "Materialgestützte Erörterung",
      "Dramenanalyse",
      "Lyrik und literarische Epochen",
      "Sachtextanalyse",
      "Sprachliche Mittel und Stil",
    ],
  },
  {
    name: "Englisch",
    themen: [
      "Wiederholung und Vertiefung der Zeiten",
      "Mediation (Sprachmittlung)",
      "Essay writing",
      "Wortschatz: politics, environment",
    ],
  },
  {
    name: "Französisch",
    themen: [
      "Subjonctif",
      "Conditionnel",
      "Gérondif",
      "Indirekte Rede",
      "Textarbeit",
    ],
  },
  {
    name: "Physik",
    themen: [
      "Elektromagnetismus",
      "Impulserhaltung in der Mechanik",
      "Bewegungen und ihre Modellierung",
      "Kernphysik",
      "Halbleiterbauelemente (NTG)",
    ],
  },
  {
    name: "Chemie",
    themen: [
      "Säuren und Basen (Protonenübergänge)",
      "Redoxreaktionen (Elektronenübergänge)",
      "Einführung in die organische Chemie (Kohlenwasserstoffe)",
      "Funktionelle Gruppen (Alkohole)",
    ],
  },
  {
    name: "Biologie",
    themen: [
      "Ökosystem Mensch",
      "Biomoleküle als Energieträger und Baustoffe",
      "Verdauung",
      "Gasaustausch und Atemgastransport im Blutkreislauf",
      "Energiebereitstellung durch Stoffwechselvorgänge",
    ],
  },
  {
    name: "Geschichte",
    themen: [
      "Das geteilte Deutschland und die Wiedervereinigung",
      "Europäische Integration",
      "Globalisierte Welt bis zum Beginn des 21. Jahrhunderts",
    ],
  },
  {
    name: "Geographie",
    themen: [
      "Geographische Arbeitstechniken",
      "Leben in der Einen Welt",
      "Klima- und Vegetationszonen der Tropen und ariden Subtropen",
      "Klima im Wandel",
      "Nordafrika, Naher und Mittlerer Osten",
      "Afrika südlich der Sahara",
      "Mittel- und Südamerika, Karibik",
    ],
  },
  RELIGION_ETHIK,
];

const CURRICULUM: Record<number, Fach[]> = {
  5: KLASSE_5,
  6: KLASSE_6,
  7: KLASSE_7,
  8: KLASSE_8,
  9: KLASSE_9,
  10: KLASSE_10,
};

// Verwendete Schulbücher nach Fach (gelten jahrgangsübergreifend, da die
// Lehrwerksreihen mehrere Klassen abdecken). Werden dem Prompt als Kontext
// mitgegeben.
export const LEHRWERKE: Record<string, string> = {
  Mathematik: "Lambacher Schweizer",
  Deutsch: "Deutschbuch (Cornelsen)",
  Englisch: "Green Line (Klett)",
  Französisch: "Découvertes (Klett)",
  Physik: "Dorn-Bader Physik",
  Chemie: "Galvani (NTG)",
  Biologie: "Fokus Biologie (Cornelsen)",
  Geschichte: "Geschichte und Geschehen (Klett)",
  "Religion / Ethik": "Abenteuer Ethik",
};

// Kuratierte Unterthemen je Thema (Schlüssel: "Klasse|Fach|Thema"). Sie dienen
// den Unterthemen-Vorschlägen als verbindliche Grundlage statt freier Erfindung.
// Klasse 8 Physik: Kapitel laut Inhaltsverzeichnis Dorn-Bader. Klasse 9: ENTWURF
// aus dem LehrplanPLUS – noch mit dem Schulbuch abgleichen.
const UNTERTHEMEN: Record<string, string[]> = {
  "8|Physik|Elektrischer Strom": [
    "Die elektrische Stromstärke",
    "Elektrischer Strom braucht einen Antrieb (Spannung)",
    "Der elektrische Widerstand",
    "Kennlinien und ohmsche Widerstände",
    "Reihen- und Parallelschaltung",
    "Elektrische Schaltungen und Sicherheit im Haushalt",
  ],
  "8|Physik|Optik": [
    "Ein Gesetz für Spiegel (Reflexionsgesetz)",
    "Lichtbrechung und Totalreflexion",
    "Linsen machen Bilder",
    "Das Auge, ein optisches System",
  ],
  "9|Physik|Energie als Erhaltungsgröße (mechanisch, elektrisch)": [
    "Energieformen und Energieumwandlungen",
    "Energieerhaltung und Energieentwertung",
    "Höhenenergie und Spannenergie",
    "Bewegungsenergie",
    "Mechanische Arbeit und Leistung",
    "Wirkungsgrad",
    "Elektrische Energie und Leistung (P = U · I)",
    "Energiebilanz im Stromkreis",
  ],
  "9|Physik|Atome": [
    "Atommodell nach Rutherford (Kern und Hülle)",
    "Aufbau des Atoms: Protonen, Neutronen, Elektronen",
    "Elektrische Ladung und Ladungstrennung",
    "Elementarladung",
    "Elektrische Leitungsvorgänge (Metalle, Ionen)",
  ],
  "9|Physik|Wärmelehre (Teilchenmodell)": [
    "Teilchenmodell und Aggregatzustände",
    "Temperatur und innere Energie",
    "Thermische Ausdehnung",
    "Absolute Temperatur (Kelvin)",
    "Wärmekapazität und Wärmemenge",
    "Schmelzen, Verdampfen, Umwandlungswärme",
    "Mischungsversuche",
  ],
  "9|Physik|Thermischer Energietransport und Klima": [
    "Wärmeleitung",
    "Konvektion",
    "Wärmestrahlung",
    "Wärmedämmung",
    "Treibhauseffekt und Klima",
  ],
};

// Verbindlicher Stoffrahmen je Thema aus dem LehrplanPLUS Bayern (Gymnasium),
// Schlüssel wie bei UNTERTHEMEN. Wird dem Prompt als Obergrenze mitgegeben.
const LEHRPLAN: Record<string, string> = {
  "8|Physik|Elektrischer Strom":
    "Stromkreismodell (mit Modellgrenzen), Stromstärke, Stromrichtung, Spannung als Antrieb, Gleich- und Wechselstrom; Kennlinien eines ohmschen und eines nicht-ohmschen Widerstands (messen, protokollieren, Gefahren des Stroms beachten); Widerstand, Leiter, Isolator, Kurzschluss; Definitionsgleichung des elektrischen Widerstands in einfachen Stromkreisen (auf Einheiten und Messgenauigkeit achten); Reihen- und Parallelschaltung mit höchstens drei Widerständen (Stromstärken und Spannungen untersuchen); einfache Haushaltsinstallation und Sicherheit. NICHT Teil des Lehrplans: elektrische Ladung/Coulomb und Q = I · t.",
  Optik:
    "Lichtausbreitung (einfaches Modell), Reflexionsgesetz, Bildentstehung am Spiegel, virtuelles Bild; Brechung (halbquantitativ, kein Rechnen mit dem Brechungsgesetz); Abbildung durch eine Sammellinse, reelle und virtuelle Bilder (halbquantitative Aussagen, Zeichnungen); Auge und Fehlsichtigkeit, Zerstreuungslinsen; Totalreflexion und technische Anwendungen, Lichtleiter; Risiken im Umgang mit Lichtquellen (z. B. Laserpointer).",
  "Mechanik: Dynamik zweidimensionaler Bewegungen":
    "Betrag der Geschwindigkeit und Definitionsgleichung (abschätzen, bestimmen, einfach berechnen, Einheiten); Geschwindigkeitspfeil bei zweidimensionalen Bewegungen (Stroboskopbilder, Videos); Geschwindigkeitsänderung durch Krafteinwirkung, Pfeil der Geschwindigkeitsänderung (zeichnerisch); zweites Newton'sches Gesetz F · Δt = m · Δv, Definition der Kraft, Masse als Maß für die Trägheit, dynamische Kraftmessung; Beschleunigung und F = m · a nur im Spezialfall eindimensionaler Bewegung; Experiment zur Bestimmung einer Beschleunigung.",
  "Mechanik: Kräfte und ihre Wirkungen":
    "Masse und Gewichtskraft, Fallbeschleunigung, freier Fall als eindimensionale Bewegung; Bewegungen unter mehreren Kräften, Kräfteaddition (wie Geschwindigkeitspfeile), Reibungskräfte einschließlich Luftwiderstand nur als Hinweis; Kräftegleichgewicht und Trägheitssatz; Kräftezerlegung an der schiefen Ebene; statische Kraftmessung; Kräfte als Ursache von Verformung, Dehnung-Kraft-Diagramme, Hooke'scher Bereich; Sicherheitssysteme im Auto mit Trägheitssatz und zweitem Newton'schen Gesetz erklären.",
};

/** LehrplanPLUS-Stoffrahmen für Klasse + Fach + Thema (leer, wenn unbekannt). */
export function lehrplanFuer(
  klasse: number,
  fachName: string,
  thema: string,
): string {
  return LEHRPLAN[`${klasse}|${fachName}|${thema}`] ?? "";
}

/** Kuratierte Unterthemen für Klasse + Fach + Thema (leer, wenn unbekannt). */
export function unterthemenFuer(
  klasse: number,
  fachName: string,
  thema: string,
): string[] {
  return UNTERTHEMEN[`${klasse}|${fachName}|${thema}`] ?? [];
}

/** Fächer für eine Klasse (mit Themenvorschlägen, falls vorhanden). */
export function faecherFuerKlasse(klasse: number): Fach[] {
  return CURRICULUM[klasse] ?? BASIS_FAECHER;
}

/** Themenvorschläge für Klasse + Fach (kann leer sein → Freitext nutzen). */
export function themenFuer(klasse: number, fachName: string): string[] {
  const fach = faecherFuerKlasse(klasse).find((f) => f.name === fachName);
  return fach?.themen ?? [];
}

/** Verwendetes Schulbuch für Klasse + Fach, falls bekannt. */
export function lehrwerkFuer(
  klasse: number,
  fachName: string,
): string | undefined {
  const fach = faecherFuerKlasse(klasse).find((f) => f.name === fachName);
  return fach?.lehrwerk ?? LEHRWERKE[fachName];
}
