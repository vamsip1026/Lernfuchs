// Verbindlicher Stoffrahmen je Thema aus dem LehrplanPLUS Bayern (Gymnasium,
// Jahrgangsstufe 10). Schlüssel: "Klasse|Fach|Thema" wie LEHRPLAN in curriculum.ts.
export const LEHRPLAN_K10: Record<string, string> = {
  "10|Mathematik|Exponentielles Wachstum und Logarithmus":
    "Exponentielle Zu- und Abnahme, Abgrenzung zu linearem Wachstum; Funktionen der Form b · aˣ: y-Achsenabschnitt, Asymptote, Monotonie in Abhängigkeit von a und b; Definition des Logarithmus, Logarithmuswerte berechnen; nur einfache Exponentialgleichungen mit log_b(u^z) = z · log_b(u); Modellierung von Wachstums- und Abklingvorgängen (z. B. Bevölkerung, radioaktiver Zerfall).",
  "10|Mathematik|Zusammengesetzte Zufallsexperimente und Simulationen":
    "Mehrstufige Zufallsexperimente mit Baumdiagrammen, Rückführung auf Urnenexperimente; Pfadregeln; Simulation für Näherungswerte (z. B. Ziegenproblem, Geburtstagsproblem); Monte-Carlo-Methode für einen Näherungswert von π, Vergleich mit nicht zufallsbasiertem Verfahren.",
  "10|Mathematik|Sinus- und Kosinusfunktion":
    "Bogenmaß und Einheitskreis; Sinus- und Kosinuswerte für Winkel von 0 bis 2π mit Vorzeichen, Rückführung größerer und negativer Winkel; Graphen, Periodizität, Zusammenhang Sinus/Kosinus; Funktionen der Form a · sin(b · (x + c)) + d: Wirkung der Parameter, Amplitude und Periode, Funktionsterm aus dem Graphen; Modellierung periodischer Vorgänge.",
  "10|Mathematik|Ganzrationale Funktionen":
    "Summe von Potenzfunktionen mit nicht negativen ganzzahligen Exponenten; Verhalten an den Rändern; Nullstellen und Vielfachheit, auch biquadratische Gleichungen durch Substitution; Rückschlüsse vom Graphen auf Grad oder Term; Achsensymmetrie zur y-Achse und Punktsymmetrie zum Ursprung. Keine Differentialrechnung.",
  "10|Mathematik|Raumgeometrie":
    "Schrägbilder und Netze von Pyramiden und Kegeln; Kreiszylinder, Kreiskegel, Kugel als Rotationskörper; Oberfläche des geraden Kreiskegels; Volumen schiefer Prismen (Cavalieri), Pyramiden- und Kegelvolumen; Volumen und Oberfläche der Kugel; Anwendung mit Trigonometrie, Strahlensatz und Satz des Pythagoras.",

  "10|Deutsch|Materialgestützte Erörterung":
    "Komplexere, z. B. gesellschaftspolitische Themen im Anschluss an Texte oder unter Bezugnahme auf Material erörtern; auf Gegenargumente eingehen, Einräumungen, keine Pauschalurteile; linearer, antithetischer oder nach Sachgebieten gegliederter Aufbau; Argumentationstypen nach Stichhaltigkeit und Plausibilität.",
  "10|Deutsch|Dramenanalyse":
    "Ein Drama als Pflichtlektüre, auch als Inszenierung: Figurenkonzeption, Dialogführung, aufführungsbezogene Aspekte (Sprechweise, Mimik, Körpersprache); szenische Verfahren zur Interpretation.",
  "10|Deutsch|Lyrik und literarische Epochen":
    "Pflichtepoche Aufklärung: Ideen und Bedeutung für Politik, Gesellschaft und Individuum; in der Lyrik traditionelle und moderne Gestaltungsmittel und ihre Funktion (z. B. Sonett), Vers- und Gedichtformen.",
  "10|Deutsch|Sachtextanalyse":
    "Informierende und argumentierende Texte: Thesen, Struktur, Argumentationsweise, Adressatenbezug, Intention und sprachliche Gestaltung herausarbeiten; inhaltliche und argumentative Qualität beurteilen, auch im Textvergleich.",
  "10|Deutsch|Sprachliche Mittel und Stil":
    "Zusammenhang von sprachlich-stilistischer Gestaltung und Wirkung (u. a. Stilbruch, Ironie, Ellipse); Nominalstil, Perspektivwechsel, Pointe; Stilebenen; rhetorische Mittel sicher erkennen und einsetzen.",

  "10|Englisch|Wiederholung und Vertiefung der Zeiten":
    "Wiederholung und Vertiefung nach Bedarf, keine neuen Strukturen: Zeitenfolge (simple past, present perfect, past perfect, going-to-, will- und timetable-future), Passiv, Konditionalsätze, indirekte Rede, Adjektiv/Adverb.",
  "10|Englisch|Mediation (Sprachmittlung)":
    "Inhalt zunehmend komplexer Texte und Äußerungen sinngemäß wiedergeben, vor allem Deutsch → Englisch, vereinzelt Englisch → Deutsch; Informationen adressaten- und situationsgerecht auswählen, flexibel umschreiben, kulturspezifische Aspekte erklären. Keine wörtliche Übersetzung.",
  "10|Englisch|Essay writing":
    "Längere argumentative und zusammenfassende Texte, z. B. Stellungnahme zu gesellschaftlichen Problemen, Filmrezension; klare Struktur, Absatzgliederung, logische Argumentation, Kohäsion, angemessenes Register. Keine feste Wortzahl vorgegeben.",
  "10|Englisch|Wortschatz: politics, environment":
    "Themengebundener Wortschatz zu historischen Entwicklungen, politischem Handeln und Gesellschaft; Themengebiete Schottland, African Americans in den USA (Sklaverei, Civil War, Civil Rights Movement, Lincoln, Parks, King, Malcolm X, Obama), Jugendkultur, Musik im gesellschaftlichen Kontext, aktuelle Ereignisse; phrasal verbs, false friends. Umwelt ist im Lehrplan der Jgst. 10 nicht ausdrücklich genannt.",

  "10|Physik|Elektromagnetismus":
    "Feldbegriff; Magnetfeld von Permanentmagneten, Spule und Erde, Feldlinien; Rechte-Faust-Regel, Drei-Finger-Regel; Kraft auf stromdurchflossenen Leiter, Lorentzkraft; Elektromotor; Induktionsspannung (Je-desto-Aussagen), Generator; idealer Transformator: Spannungs- und Stromstärkeübersetzung.",
  "10|Physik|Impulserhaltung in der Mechanik":
    "Impuls als Erhaltungsgröße (zweidimensional), Abgrenzung zur Energieerhaltung; Rechnungen mit Impuls- und Energieerhaltung nur bei eindimensionalen, einfachen Stößen; Wechselwirkungsgesetz, Kräftepaar Wechselwirkung vs. Gleichgewicht.",
  "10|Physik|Bewegungen und ihre Modellierung":
    "Zeit-Ort- und Zeit-Geschwindigkeit-Diagramme; Bewegungsfunktionen bei konstanter Geschwindigkeit und konstanter Beschleunigung, freier Fall; waagrechter Wurf komponentenweise in Koordinatenschreibweise; Lösung mit Bewegungsfunktionen oder Erhaltungssätzen; Bewertung von Verkehrssituationen.",
  "10|Physik|Kernphysik":
    "Entdeckung der Radioaktivität; α-, β⁻- und γ-Strahlung, Zerfallsgleichungen; Atomkern aus Protonen und Neutronen, Nukleonen aus Quarks; Masse-Energie-Äquivalenz, Energieberechnung bei α-Zerfall und Kernprozessen; Kernreaktor; Halbwertszeit graphisch und rechnerisch; biologische Strahlenwirkung und Strahlenschutz.",
  "10|Physik|Halbleiterbauelemente (NTG)":
    "Kennlinie einer Diode, Transistor als Schalter und Verstärker, einfache Schaltungen aus Halbleiterbauelementen; nur einfache Modelle zu Halbleiter, Diode und Transistor.",

  "10|Biologie|Ökosystem Mensch":
    "Symbionten, Parasiten, Krankheitserreger; Bakterien (Vermehrung, Giftstoffe) und Viren (Bau, lytischer Zyklus); Übertragungswege, Hygiene, Schutz vor HIV; unspezifische Abwehr (Haut, Schleimhäute, Leukocyten, Entzündung); spezifische Abwehr (Antigen, Antikörper, humorale und zellvermittelte Immunantwort), Allergie; primäre/sekundäre Immunantwort, aktive/passive Immunisierung, Impfungen; Antibiotika und Resistenzen.",
  "10|Biologie|Biomoleküle als Energieträger und Baustoffe":
    "Mensch als offenes System; Kohlenhydrate (Mono-, Di-, Polysaccharide: Glucose, Fructose, Saccharose, Lactose, Stärke, Glykogen); Fette (gesättigte/ungesättigte Fettsäurereste, essenzielle Fettsäuren); Proteine aus Aminosäuren (Amino-, Carboxygruppe, Rest); Vitamine und Mineralsalze (je ein Beispiel); ausgewogene Ernährung.",
  "10|Biologie|Verdauung":
    "Enzyme (nur reine Proteinenzyme) als Biokatalysatoren: Aktivierungsenergie, Schlüssel-Schloss-Modell, aktives Zentrum, Enzym-Substrat-Komplex, Substrat- und Wirkungsspezifität; Einfluss von Substratkonzentration, pH-Wert, Temperatur (RGT-Regel), Denaturierung, keine mathematische Herleitung; Verdauungsorgane, Peristaltik, Ballaststoffe; Resorption im Dünndarm (Zotten, Mikrovilli, passiver/aktiver Transport).",
  "10|Biologie|Gasaustausch und Atemgastransport im Blutkreislauf":
    "Gasaustausch durch Diffusion (Oberfläche, Konzentrationsunterschied, Diffusionsstrecke); O₂- und CO₂-Transport, Hämoglobin; Lungen- und Körperkreislauf, Herzkammern, Herzklappen, Herzzyklus, Blutdruck; Gesundheitsvorsorge, Schäden durch Rauchen; Erste Hilfe, Blut- und Organspende.",
  "10|Biologie|Energiebereitstellung durch Stoffwechselvorgänge":
    "ATP als mobiler, universeller Energieträger (ATP-ADP-System); Glucoseabbau als exotherme Redoxreaktion, aerob zu CO₂ bzw. anaerob zu Milchsäure im Muskel, Vergleich der Energiebilanz – keine Teilschritte, keine Reduktionsäquivalente; Sportphysiologie (ATP-Vorrat, Zellatmung, Milchsäuregärung, Training).",

  "10|Geschichte|Das geteilte Deutschland und die Wiedervereinigung":
    "SED-Diktatur, Staatssicherheit, Widerstand und Unterdrückung; Ära Adenauer, Soziale Marktwirtschaft, Heimatvertriebene, Gastarbeiter; 68er-Bewegung, Terrorismus, sozial-liberale Reformen; jüdisches Leben nach 1945; deutsch-deutsches Verhältnis im Kalten Krieg; friedliche Revolution 1989 und Wiedervereinigung. Daten: 17. Juni 1953, Mauerbau, 1972 Grundlagenvertrag, 9. November 1989, 3. Oktober 1990.",
  "10|Geschichte|Europäische Integration":
    "Ziele und Etappen der europäischen Integration vor dem Hintergrund der Weltkriege bis zum Vertrag von Lissabon 2009; Osterweiterung der EU. Daten: 1963 deutsch-französischer Freundschaftsvertrag, 1992 Gründung der Europäischen Union.",
  "10|Geschichte|Globalisierte Welt bis zum Beginn des 21. Jahrhunderts":
    "Weltpolitische Akteure nach 1990 (USA, Russland, China), UNO und EU; Globalisierung und ihre Auswirkungen; Terrorismus (11. September 2001); internationale Rolle der Bundesrepublik nach der Wiedervereinigung.",

  "10|Geographie|Geographische Arbeitstechniken":
    "Komplexere Sachverhalte mit Atlas, digitalen Karten, Klimadiagrammen, Blockbildern und Diagrammen analysieren; Kausalprofile anfertigen; Hypothesen mit Experimenten prüfen; Stadtstrukturmodelle; Recherche in digitalen Medien.",
  "10|Geographie|Leben in der Einen Welt":
    "Lebensrealitäten Jugendlicher in Ländern unterschiedlichen Entwicklungsstands; Merkmale gering entwickelter Länder; Entwicklungsindikatoren kritisch bewerten; ungleiche Entwicklung, Entwicklungszusammenarbeit; Spurensuche im Heimatraum (z. B. Flüchtlinge).",
  "10|Geographie|Klima- und Vegetationszonen der Tropen und ariden Subtropen":
    "Globale Strahlungs- und Temperaturverhältnisse, zonale Anordnung; Passatzirkulation, thermische Hoch- und Tiefdruckgebiete, Zenitalregen; Regenwald, Savannen, Wüsten und ihre landwirtschaftliche Nutzung; Biodiversität und Verwundbarkeit.",
  "10|Geographie|Klima im Wandel":
    "Anthropogener Treibhauseffekt; extraterrestrische und terrestrische Antriebe; Klimaszenarien, regionale Unterschiede; Folgen (Extremwetter, Klimaflüchtlinge, Anpassung von Ökosystemen); Positionen kritisch prüfen; Klimaschutz im Heimatraum.",
  "10|Geographie|Nordafrika, Naher und Mittlerer Osten":
    "Natur- und kulturräumliche Merkmale; Orient als Konstrukt, orientalische Stadt; Wassermangel und Wasserkonflikte; Nomadismus, Oasenwirtschaft, Bewässerungslandwirtschaft; Migration; Erdöl und Erdgas, Wirtschaftsdiversifizierung, Strukturwandel; raumwirksame Konflikte.",
  "10|Geographie|Afrika südlich der Sahara":
    "Topographischer Überblick, Klima- und Vegetationszonen; endogene Entwicklungshemmnisse, gesellschaftliche Herausforderungen; Desertifikation in der Sahelzone (Ursachen, Folgen, Gegenmaßnahmen); ausländische Direktinvestitionen; nachhaltige Entwicklung.",
  "10|Geographie|Mittel- und Südamerika, Karibik":
    "Topographischer Überblick; Klimazonen, horizontale und vertikale Vegetationsverbreitung, Höhenstufen der Anden; Hurrikane und Verwundbarkeit der Karibik; Abholzung des Amazonas-Regenwalds; Metropolisierung, Marginalsiedlungen, Gated Communities, informeller Sektor; Plantagenwirtschaft; Ferntourismus.",
};
