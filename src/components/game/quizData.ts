import type { Language } from '@/i18n/translations';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

type QuizQuestionSet = Record<number, QuizQuestion[]>;

const pl: QuizQuestionSet = {
    1: [
        {
            id: 1,
            question: "Co oznacza termin 'occurrenceID' w Darwin Core?",
            options: ["Nazwa gatunku", "Unikalny identyfikator obserwacji/wystąpienia", "Data obserwacji", "Lokalizacja geograficzna"],
            correctIndex: 1,
            explanation: "occurrenceID to unikalny identyfikator dla każdego rekordu wystąpienia organizmu w zbiorze danych.",
        },
        {
            id: 2,
            question: "Do czego służy pole 'scientificName'?",
            options: ["Nazwa lokalizacji badania", "Pełna nazwa naukowa taksonu", "Imię badacza", "Nazwa projektu"],
            correctIndex: 1,
            explanation: "scientificName zawiera pełną nazwę naukową taksonu, włącznie z autorem, np. 'Quercus robur L.'.",
        },
        {
            id: 3,
            question: "Co oznacza 'basisOfRecord'?",
            options: ["Podstawa prawna zbierania danych", "Typ dowodu/źródła rekordu (np. obserwacja, okaz)", "Numer referencyjny", "Baza danych źródłowa"],
            correctIndex: 1,
            explanation: "basisOfRecord określa typ dowodu, np. 'HumanObservation', 'PreservedSpecimen', 'FossilSpecimen'.",
        },
    ],
    2: [
        {
            id: 4,
            question: "Jaki format daty jest zalecany w standardzie Darwin Core?",
            options: ["DD/MM/YYYY", "MM-DD-YYYY", "ISO 8601 (YYYY-MM-DD)", "DD.MM.YY"],
            correctIndex: 2,
            explanation: "Darwin Core zaleca format ISO 8601 (YYYY-MM-DD) dla dat, np. 2024-03-15.",
        },
        {
            id: 5,
            question: "Co to jest 'eventDate'?",
            options: ["Data utworzenia rekordu w bazie", "Data wydarzenia/obserwacji w terenie", "Data publikacji danych", "Data walidacji danych"],
            correctIndex: 1,
            explanation: "eventDate to data lub zakres dat, kiedy nastąpiło wydarzenie, np. obserwacja albo zbiór okazu.",
        },
        {
            id: 6,
            question: "Do czego służy pole 'recordedBy'?",
            options: ["Nazwa instytucji przechowującej dane", "Osoba lub osoby, które zarejestrowały obserwację", "System bazy danych", "Numer katalogowy"],
            correctIndex: 1,
            explanation: "recordedBy zawiera listę osób, które przeprowadziły obserwację lub zebrały okaz.",
        },
    ],
    3: [
        {
            id: 7,
            question: "Jakie współrzędne geograficzne są standardem w Darwin Core?",
            options: ["UTM", "PUWG 1992", "WGS84 (stopnie dziesiętne)", "Gauss-Krüger"],
            correctIndex: 2,
            explanation: "Darwin Core używa WGS84 ze współrzędnymi w stopniach dziesiętnych: decimalLatitude i decimalLongitude.",
        },
        {
            id: 8,
            question: "Co oznacza 'coordinateUncertaintyInMeters'?",
            options: ["Wysokość nad poziomem morza", "Promień niepewności lokalizacji w metrach", "Odległość od najbliższego miasta", "Głębokość obserwacji"],
            correctIndex: 1,
            explanation: "To promień, w metrach, okręgu niepewności wokół podanych współrzędnych.",
        },
        {
            id: 9,
            question: "Jaka jest różnica między 'genus' a 'specificEpithet'?",
            options: ["Nie ma różnicy", "genus to rodzaj, specificEpithet to epitet gatunkowy", "genus to gatunek, specificEpithet to rodzina", "Oba oznaczają nazwę potoczną"],
            correctIndex: 1,
            explanation: "genus to nazwa rodzaju, np. 'Quercus', a specificEpithet to epitet gatunkowy, np. 'robur'.",
        },
    ],
    4: [
        {
            id: 10,
            question: "Co to jest GBIF Backbone Taxonomy?",
            options: ["Baza danych muzealnych okazów", "Hierarchiczna klasyfikacja łącząca nazwy gatunków w GBIF", "System zarządzania kolekcjami", "Format pliku do eksportu danych"],
            correctIndex: 1,
            explanation: "GBIF Backbone Taxonomy to ujednolicona klasyfikacja łącząca nazwy gatunków z wielu źródeł.",
        },
        {
            id: 11,
            question: "Co to jest synonim taksonomiczny?",
            options: ["Nazwa potoczna gatunku", "Nazwa naukowa odnosząca się do tego samego taksonu co nazwa akceptowana", "Błąd w pisowni nazwy naukowej", "Nazwa gatunku w innym języku"],
            correctIndex: 1,
            explanation: "Synonim taksonomiczny odnosi się do tego samego taksonu co inna, akceptowana nazwa.",
        },
        {
            id: 12,
            question: "Jaka kategoria taksonomiczna jest najniższa w standardowej hierarchii?",
            options: ["Family (rodzina)", "Genus (rodzaj)", "Species (gatunek)", "Order (rząd)"],
            correctIndex: 2,
            explanation: "Species, czyli gatunek, to najniższa podstawowa kategoria w standardowej hierarchii taksonomicznej.",
        },
    ],
    5: [
        {
            id: 13,
            question: "Co to jest Darwin Core Archive (DwC-A)?",
            options: ["Archiwum historyczne Darwina", "Standardowy format pakowania danych bioróżnorodności", "Program komputerowy", "Muzeum przyrodnicze"],
            correctIndex: 1,
            explanation: "DwC-A to format ZIP zawierający pliki danych i metadane opisujące ich strukturę.",
        },
        {
            id: 14,
            question: "Co oznacza pole 'taxonRank'?",
            options: ["Pozycja taksonu w rankingu popularności", "Ranga taksonomiczna, np. gatunek, rodzaj, rodzina", "Numer katalogowy taksonu", "Ocena jakości identyfikacji"],
            correctIndex: 1,
            explanation: "taxonRank określa rangę taksonomiczną, np. 'species', 'genus' albo 'family'.",
        },
        {
            id: 15,
            question: "Jakie pole opisuje typ licencji danych w Darwin Core?",
            options: ["dataLicense", "rights", "license", "copyrightHolder"],
            correctIndex: 2,
            explanation: "Pole 'license' zawiera URI licencji, np. CC0 lub CC-BY, na której udostępniane są dane.",
        },
    ],
};

const en: QuizQuestionSet = {
    1: [
        {
            id: 1,
            question: "What does 'occurrenceID' mean in Darwin Core?",
            options: ["Species name", "A unique identifier for an occurrence record", "Observation date", "Geographic location"],
            correctIndex: 1,
            explanation: "occurrenceID is a unique identifier for each organism occurrence record in a dataset.",
        },
        {
            id: 2,
            question: "What is 'scientificName' used for?",
            options: ["Study location name", "The full scientific name of the taxon", "Researcher name", "Project name"],
            correctIndex: 1,
            explanation: "scientificName stores the full scientific name of the taxon, including authorship when available.",
        },
        {
            id: 3,
            question: "What does 'basisOfRecord' describe?",
            options: ["Legal basis for collecting data", "The evidence type or source of the record", "Reference number", "Source database"],
            correctIndex: 1,
            explanation: "basisOfRecord describes the record evidence type, such as HumanObservation, PreservedSpecimen, or FossilSpecimen.",
        },
    ],
    2: [
        {
            id: 4,
            question: "Which date format is recommended in Darwin Core?",
            options: ["DD/MM/YYYY", "MM-DD-YYYY", "ISO 8601 (YYYY-MM-DD)", "DD.MM.YY"],
            correctIndex: 2,
            explanation: "Darwin Core recommends ISO 8601 dates, for example 2024-03-15.",
        },
        {
            id: 5,
            question: "What is 'eventDate'?",
            options: ["The date the database record was created", "The date or date range of the field event", "The publication date", "The validation date"],
            correctIndex: 1,
            explanation: "eventDate is the date or date range when the event, observation, or collection happened.",
        },
        {
            id: 6,
            question: "What is 'recordedBy' used for?",
            options: ["The institution holding the data", "The person or people who recorded the observation", "The database system", "The catalogue number"],
            correctIndex: 1,
            explanation: "recordedBy lists the people who made the observation or collected the specimen.",
        },
    ],
    3: [
        {
            id: 7,
            question: "Which geographic coordinates are standard in Darwin Core?",
            options: ["UTM", "PUWG 1992", "WGS84 decimal degrees", "Gauss-Krüger"],
            correctIndex: 2,
            explanation: "Darwin Core uses WGS84 decimal degrees through decimalLatitude and decimalLongitude.",
        },
        {
            id: 8,
            question: "What does 'coordinateUncertaintyInMeters' mean?",
            options: ["Elevation above sea level", "The radius of location uncertainty in meters", "Distance to the nearest city", "Observation depth"],
            correctIndex: 1,
            explanation: "It is the radius, in meters, of the uncertainty circle around the given coordinates.",
        },
        {
            id: 9,
            question: "What is the difference between 'genus' and 'specificEpithet'?",
            options: ["There is no difference", "genus is the genus name, specificEpithet is the species epithet", "genus is the species, specificEpithet is the family", "Both mean the common name"],
            correctIndex: 1,
            explanation: "genus is the genus name, such as Quercus, and specificEpithet is the species epithet, such as robur.",
        },
    ],
    4: [
        {
            id: 10,
            question: "What is the GBIF Backbone Taxonomy?",
            options: ["A database of museum specimens", "A hierarchical classification connecting species names in GBIF", "A collection management system", "A data export file format"],
            correctIndex: 1,
            explanation: "The GBIF Backbone Taxonomy is a unified classification that connects species names from many sources.",
        },
        {
            id: 11,
            question: "What is a taxonomic synonym?",
            options: ["A species common name", "A scientific name referring to the same taxon as an accepted name", "A spelling error in a scientific name", "A species name in another language"],
            correctIndex: 1,
            explanation: "A taxonomic synonym refers to the same taxon as another, accepted scientific name.",
        },
        {
            id: 12,
            question: "Which taxonomic rank is the lowest in the standard hierarchy?",
            options: ["Family", "Genus", "Species", "Order"],
            correctIndex: 2,
            explanation: "Species is the lowest basic rank in the standard taxonomic hierarchy.",
        },
    ],
    5: [
        {
            id: 13,
            question: "What is a Darwin Core Archive (DwC-A)?",
            options: ["Darwin's historical archive", "A standard package format for biodiversity data", "A computer program", "A natural history museum"],
            correctIndex: 1,
            explanation: "DwC-A is a ZIP-based format containing data files and metadata describing their structure.",
        },
        {
            id: 14,
            question: "What does 'taxonRank' mean?",
            options: ["The taxon's popularity ranking", "The taxonomic rank, such as species, genus, or family", "A taxon catalogue number", "The identification quality score"],
            correctIndex: 1,
            explanation: "taxonRank describes the taxonomic rank, such as species, genus, or family.",
        },
        {
            id: 15,
            question: "Which Darwin Core field describes the data license?",
            options: ["dataLicense", "rights", "license", "copyrightHolder"],
            correctIndex: 2,
            explanation: "The 'license' field contains the URI of the license, such as CC0 or CC-BY.",
        },
    ],
};

const fr: QuizQuestionSet = {
    1: [
        {
            id: 1,
            question: "Que signifie 'occurrenceID' dans Darwin Core ?",
            options: ["Le nom de l'espèce", "Un identifiant unique pour un enregistrement d'occurrence", "La date d'observation", "La localisation géographique"],
            correctIndex: 1,
            explanation: "occurrenceID est l'identifiant unique de chaque occurrence d'organisme dans un jeu de données.",
        },
        {
            id: 2,
            question: "À quoi sert le champ 'scientificName' ?",
            options: ["Au nom du site d'étude", "Au nom scientifique complet du taxon", "Au nom du chercheur", "Au nom du projet"],
            correctIndex: 1,
            explanation: "scientificName contient le nom scientifique complet du taxon, avec l'auteur quand il est disponible.",
        },
        {
            id: 3,
            question: "Que décrit 'basisOfRecord' ?",
            options: ["La base juridique de la collecte", "Le type de preuve ou la source de l'enregistrement", "Un numéro de référence", "La base de données source"],
            correctIndex: 1,
            explanation: "basisOfRecord décrit le type de preuve, par exemple HumanObservation, PreservedSpecimen ou FossilSpecimen.",
        },
    ],
    2: [
        {
            id: 4,
            question: "Quel format de date est recommandé dans Darwin Core ?",
            options: ["DD/MM/YYYY", "MM-DD-YYYY", "ISO 8601 (YYYY-MM-DD)", "DD.MM.YY"],
            correctIndex: 2,
            explanation: "Darwin Core recommande les dates ISO 8601, par exemple 2024-03-15.",
        },
        {
            id: 5,
            question: "Qu'est-ce que 'eventDate' ?",
            options: ["La date de création de l'enregistrement", "La date ou période de l'événement de terrain", "La date de publication", "La date de validation"],
            correctIndex: 1,
            explanation: "eventDate est la date ou la période pendant laquelle l'événement, l'observation ou la collecte a eu lieu.",
        },
        {
            id: 6,
            question: "À quoi sert 'recordedBy' ?",
            options: ["À l'institution qui conserve les données", "À la personne ou aux personnes qui ont enregistré l'observation", "Au système de base de données", "Au numéro de catalogue"],
            correctIndex: 1,
            explanation: "recordedBy liste les personnes qui ont fait l'observation ou collecté le spécimen.",
        },
    ],
    3: [
        {
            id: 7,
            question: "Quelles coordonnées géographiques sont standard dans Darwin Core ?",
            options: ["UTM", "PUWG 1992", "WGS84 en degrés décimaux", "Gauss-Krüger"],
            correctIndex: 2,
            explanation: "Darwin Core utilise WGS84 en degrés décimaux avec decimalLatitude et decimalLongitude.",
        },
        {
            id: 8,
            question: "Que signifie 'coordinateUncertaintyInMeters' ?",
            options: ["L'altitude au-dessus du niveau de la mer", "Le rayon d'incertitude de la position en mètres", "La distance à la ville la plus proche", "La profondeur d'observation"],
            correctIndex: 1,
            explanation: "C'est le rayon, en mètres, du cercle d'incertitude autour des coordonnées indiquées.",
        },
        {
            id: 9,
            question: "Quelle est la différence entre 'genus' et 'specificEpithet' ?",
            options: ["Il n'y a pas de différence", "genus est le genre, specificEpithet est l'épithète spécifique", "genus est l'espèce, specificEpithet est la famille", "Les deux indiquent le nom commun"],
            correctIndex: 1,
            explanation: "genus est le nom du genre, comme Quercus, et specificEpithet est l'épithète spécifique, comme robur.",
        },
    ],
    4: [
        {
            id: 10,
            question: "Qu'est-ce que la GBIF Backbone Taxonomy ?",
            options: ["Une base de spécimens de musée", "Une classification hiérarchique reliant les noms d'espèces dans GBIF", "Un système de gestion des collections", "Un format d'export de données"],
            correctIndex: 1,
            explanation: "La GBIF Backbone Taxonomy est une classification unifiée qui relie les noms d'espèces provenant de nombreuses sources.",
        },
        {
            id: 11,
            question: "Qu'est-ce qu'un synonyme taxonomique ?",
            options: ["Un nom commun d'espèce", "Un nom scientifique désignant le même taxon qu'un nom accepté", "Une faute d'orthographe dans un nom scientifique", "Un nom d'espèce dans une autre langue"],
            correctIndex: 1,
            explanation: "Un synonyme taxonomique désigne le même taxon qu'un autre nom scientifique accepté.",
        },
        {
            id: 12,
            question: "Quel rang taxonomique est le plus bas dans la hiérarchie standard ?",
            options: ["Famille", "Genre", "Espèce", "Ordre"],
            correctIndex: 2,
            explanation: "L'espèce est le rang de base le plus bas dans la hiérarchie taxonomique standard.",
        },
    ],
    5: [
        {
            id: 13,
            question: "Qu'est-ce qu'une Darwin Core Archive (DwC-A) ?",
            options: ["Les archives historiques de Darwin", "Un format standard de paquet pour les données de biodiversité", "Un programme informatique", "Un musée d'histoire naturelle"],
            correctIndex: 1,
            explanation: "DwC-A est un format ZIP contenant des fichiers de données et des métadonnées décrivant leur structure.",
        },
        {
            id: 14,
            question: "Que signifie 'taxonRank' ?",
            options: ["Le classement de popularité du taxon", "Le rang taxonomique, par exemple espèce, genre ou famille", "Un numéro de catalogue du taxon", "Le score de qualité de l'identification"],
            correctIndex: 1,
            explanation: "taxonRank décrit le rang taxonomique, par exemple species, genus ou family.",
        },
        {
            id: 15,
            question: "Quel champ Darwin Core décrit la licence des données ?",
            options: ["dataLicense", "rights", "license", "copyrightHolder"],
            correctIndex: 2,
            explanation: "Le champ 'license' contient l'URI de la licence, par exemple CC0 ou CC-BY.",
        },
    ],
};

const de: QuizQuestionSet = {
    1: [
        {
            id: 1,
            question: "Was bedeutet 'occurrenceID' in Darwin Core?",
            options: ["Artname", "Eine eindeutige Kennung für einen Vorkommensdatensatz", "Beobachtungsdatum", "Geografischer Ort"],
            correctIndex: 1,
            explanation: "occurrenceID ist die eindeutige Kennung für jeden Organismus-Vorkommensdatensatz in einem Datensatz.",
        },
        {
            id: 2,
            question: "Wofür wird 'scientificName' verwendet?",
            options: ["Für den Namen des Untersuchungsortes", "Für den vollständigen wissenschaftlichen Namen des Taxons", "Für den Namen des Forschers", "Für den Projektnamen"],
            correctIndex: 1,
            explanation: "scientificName enthält den vollständigen wissenschaftlichen Namen des Taxons, wenn möglich mit Autorenschaft.",
        },
        {
            id: 3,
            question: "Was beschreibt 'basisOfRecord'?",
            options: ["Die rechtliche Grundlage der Datenerhebung", "Den Nachweis- oder Quellentyp des Datensatzes", "Eine Referenznummer", "Die Quelldatenbank"],
            correctIndex: 1,
            explanation: "basisOfRecord beschreibt den Nachweistyp, z. B. HumanObservation, PreservedSpecimen oder FossilSpecimen.",
        },
    ],
    2: [
        {
            id: 4,
            question: "Welches Datumsformat wird in Darwin Core empfohlen?",
            options: ["DD/MM/YYYY", "MM-DD-YYYY", "ISO 8601 (YYYY-MM-DD)", "DD.MM.YY"],
            correctIndex: 2,
            explanation: "Darwin Core empfiehlt ISO-8601-Daten, zum Beispiel 2024-03-15.",
        },
        {
            id: 5,
            question: "Was ist 'eventDate'?",
            options: ["Das Erstellungsdatum des Datenbankeintrags", "Das Datum oder der Zeitraum des Feldereignisses", "Das Veröffentlichungsdatum", "Das Validierungsdatum"],
            correctIndex: 1,
            explanation: "eventDate ist das Datum oder der Zeitraum, in dem Ereignis, Beobachtung oder Sammlung stattfand.",
        },
        {
            id: 6,
            question: "Wofür wird 'recordedBy' verwendet?",
            options: ["Für die Institution, die die Daten hält", "Für die Person oder Personen, die die Beobachtung erfasst haben", "Für das Datenbanksystem", "Für die Katalognummer"],
            correctIndex: 1,
            explanation: "recordedBy listet die Personen auf, die die Beobachtung gemacht oder das Exemplar gesammelt haben.",
        },
    ],
    3: [
        {
            id: 7,
            question: "Welche geografischen Koordinaten sind in Darwin Core Standard?",
            options: ["UTM", "PUWG 1992", "WGS84 in Dezimalgrad", "Gauss-Krüger"],
            correctIndex: 2,
            explanation: "Darwin Core verwendet WGS84 in Dezimalgrad mit decimalLatitude und decimalLongitude.",
        },
        {
            id: 8,
            question: "Was bedeutet 'coordinateUncertaintyInMeters'?",
            options: ["Höhe über dem Meeresspiegel", "Der Unsicherheitsradius der Position in Metern", "Entfernung zur nächsten Stadt", "Beobachtungstiefe"],
            correctIndex: 1,
            explanation: "Das ist der Radius des Unsicherheitskreises um die angegebenen Koordinaten, gemessen in Metern.",
        },
        {
            id: 9,
            question: "Was ist der Unterschied zwischen 'genus' und 'specificEpithet'?",
            options: ["Es gibt keinen Unterschied", "genus ist der Gattungsname, specificEpithet das Art-Epitheton", "genus ist die Art, specificEpithet die Familie", "Beide bedeuten den Trivialnamen"],
            correctIndex: 1,
            explanation: "genus ist der Gattungsname, etwa Quercus, und specificEpithet ist das Art-Epitheton, etwa robur.",
        },
    ],
    4: [
        {
            id: 10,
            question: "Was ist die GBIF Backbone Taxonomy?",
            options: ["Eine Datenbank mit Museumsbelegen", "Eine hierarchische Klassifikation, die Artnamen in GBIF verbindet", "Ein Sammlungsverwaltungssystem", "Ein Dateiformat für den Datenexport"],
            correctIndex: 1,
            explanation: "Die GBIF Backbone Taxonomy ist eine einheitliche Klassifikation, die Artnamen aus vielen Quellen verbindet.",
        },
        {
            id: 11,
            question: "Was ist ein taxonomisches Synonym?",
            options: ["Ein Trivialname einer Art", "Ein wissenschaftlicher Name, der dasselbe Taxon wie ein akzeptierter Name bezeichnet", "Ein Schreibfehler in einem wissenschaftlichen Namen", "Ein Artname in einer anderen Sprache"],
            correctIndex: 1,
            explanation: "Ein taxonomisches Synonym bezeichnet dasselbe Taxon wie ein anderer, akzeptierter wissenschaftlicher Name.",
        },
        {
            id: 12,
            question: "Welcher taxonomische Rang ist in der Standardhierarchie der niedrigste?",
            options: ["Familie", "Gattung", "Art", "Ordnung"],
            correctIndex: 2,
            explanation: "Die Art ist der niedrigste grundlegende Rang in der standardmäßigen taxonomischen Hierarchie.",
        },
    ],
    5: [
        {
            id: 13,
            question: "Was ist ein Darwin Core Archive (DwC-A)?",
            options: ["Darwins historisches Archiv", "Ein Standard-Paketformat für Biodiversitätsdaten", "Ein Computerprogramm", "Ein Naturkundemuseum"],
            correctIndex: 1,
            explanation: "DwC-A ist ein ZIP-basiertes Format mit Datendateien und Metadaten, die deren Struktur beschreiben.",
        },
        {
            id: 14,
            question: "Was bedeutet 'taxonRank'?",
            options: ["Der Popularitätsrang des Taxons", "Der taxonomische Rang, z. B. Art, Gattung oder Familie", "Eine Katalognummer des Taxons", "Die Qualitätsbewertung der Bestimmung"],
            correctIndex: 1,
            explanation: "taxonRank beschreibt den taxonomischen Rang, z. B. species, genus oder family.",
        },
        {
            id: 15,
            question: "Welches Darwin-Core-Feld beschreibt die Datenlizenz?",
            options: ["dataLicense", "rights", "license", "copyrightHolder"],
            correctIndex: 2,
            explanation: "Das Feld 'license' enthält die URI der Lizenz, zum Beispiel CC0 oder CC-BY.",
        },
    ],
};

export const quizQuestionsByLanguage: Record<Language, QuizQuestionSet> = { pl, en, fr, de };

export function getQuizQuestionsByLevel(language: Language): QuizQuestionSet {
    return quizQuestionsByLanguage[language] ?? quizQuestionsByLanguage.pl;
}

/** Shuffle an array of options and return new options + updated correct index */
export function shuffleOptions(options: string[], correctIndex: number): { options: string[]; correctIndex: number } {
    const correctAnswer = options[correctIndex];
    const shuffled = [...options];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newCorrectIndex = shuffled.indexOf(correctAnswer);
    return { options: shuffled, correctIndex: newCorrectIndex };
}
