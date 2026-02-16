export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

// Questions grouped by level (3 per level)
export const quizQuestionsByLevel: Record<number, QuizQuestion[]> = {
    1: [
        {
            id: 1,
            question: "Co oznacza termin 'occurrenceID' w Darwin Core?",
            options: [
                "Nazwa gatunku",
                "Unikalny identyfikator obserwacji/wystąpienia",
                "Data obserwacji",
                "Lokalizacja geograficzna"
            ],
            correctIndex: 1,
            explanation: "occurrenceID to unikalny identyfikator dla każdego rekordu wystąpienia organizmu w zbiorze danych."
        },
        {
            id: 2,
            question: "Do czego służy pole 'scientificName'?",
            options: [
                "Nazwa lokalizacji badania",
                "Pełna nazwa naukowa taksonu",
                "Imię badacza",
                "Nazwa projektu"
            ],
            correctIndex: 1,
            explanation: "scientificName zawiera pełną nazwę naukową taksonu, włącznie z autorem, np. 'Quercus robur L.'"
        },
        {
            id: 3,
            question: "Co oznacza 'basisOfRecord'?",
            options: [
                "Podstawa prawna zbierania danych",
                "Typ dowodu/źródła rekordu (np. obserwacja, okaz)",
                "Numer referencyjny",
                "Baza danych źródłowa"
            ],
            correctIndex: 1,
            explanation: "basisOfRecord określa typ dowodu, np. 'HumanObservation', 'PreservedSpecimen', 'FossilSpecimen'."
        }
    ],
    2: [
        {
            id: 4,
            question: "Jaki format daty jest zalecany w standardzie Darwin Core?",
            options: [
                "DD/MM/YYYY",
                "MM-DD-YYYY",
                "ISO 8601 (YYYY-MM-DD)",
                "DD.MM.YY"
            ],
            correctIndex: 2,
            explanation: "Darwin Core zaleca format ISO 8601 (YYYY-MM-DD) dla dat, np. 2024-03-15."
        },
        {
            id: 5,
            question: "Co to jest 'eventDate'?",
            options: [
                "Data utworzenia rekordu w bazie",
                "Data wydarzenia/obserwacji w terenie",
                "Data publikacji danych",
                "Data walidacji danych"
            ],
            correctIndex: 1,
            explanation: "eventDate to data lub zakres dat, kiedy nastąpiło wydarzenie (obserwacja, zbiór okazu)."
        },
        {
            id: 6,
            question: "Do czego służy pole 'recordedBy'?",
            options: [
                "Nazwa instytucji przechowującej dane",
                "Osoba lub osoby, które zarejestrowały obserwację",
                "System bazy danych",
                "Numer katalogowy"
            ],
            correctIndex: 1,
            explanation: "recordedBy zawiera listę osób, które przeprowadziły obserwację lub zebrały okaz."
        }
    ],
    3: [
        {
            id: 7,
            question: "Jakie współrzędne geograficzne są standardem w Darwin Core?",
            options: [
                "UTM",
                "PUWG 1992",
                "WGS84 (stopnie dziesiętne)",
                "Gauss-Krüger"
            ],
            correctIndex: 2,
            explanation: "Darwin Core używa WGS84 ze współrzędnymi w stopniach dziesiętnych (decimalLatitude, decimalLongitude)."
        },
        {
            id: 8,
            question: "Co oznacza 'coordinateUncertaintyInMeters'?",
            options: [
                "Wysokość nad poziomem morza",
                "Promień niepewności lokalizacji w metrach",
                "Odległość od najbliższego miasta",
                "Głębokość obserwacji"
            ],
            correctIndex: 1,
            explanation: "To promień (w metrach) okręgu niepewności wokół podanych współrzędnych."
        },
        {
            id: 9,
            question: "Jaka jest różnica między 'genus' a 'specificEpithet'?",
            options: [
                "Nie ma różnicy",
                "genus to rodzaj, specificEpithet to epitet gatunkowy",
                "genus to gatunek, specificEpithet to rodzina",
                "Oba oznaczają nazwę potoczną"
            ],
            correctIndex: 1,
            explanation: "genus to nazwa rodzaju (np. 'Quercus'), a specificEpithet to epitet gatunkowy (np. 'robur')."
        }
    ],
    4: [
        {
            id: 10,
            question: "Co to jest Darwin Core Archive (DwC-A)?",
            options: [
                "Archiwum historyczne Darwina",
                "Standardowy format pakowania danych biodiversity",
                "Program komputerowy",
                "Muzeum przyrodnicze"
            ],
            correctIndex: 1,
            explanation: "DwC-A to standardowy format ZIP zawierający pliki CSV z danymi i metadane opisujące strukturę."
        },
        {
            id: 11,
            question: "Co oznacza pole 'taxonRank'?",
            options: [
                "Pozycja taksonu w rankingu popularności",
                "Ranga taksonomiczna (np. gatunek, rodzaj, rodzina)",
                "Numer katalogowy taksonu",
                "Ocena jakości identyfikacji"
            ],
            correctIndex: 1,
            explanation: "taxonRank określa rangę taksonomiczną, np. 'species', 'genus', 'family'."
        },
        {
            id: 12,
            question: "Jakie pole opisuje typ licencji danych w Darwin Core?",
            options: [
                "dataLicense",
                "rights",
                "license",
                "copyrightHolder"
            ],
            correctIndex: 2,
            explanation: "Pole 'license' zawiera URI licencji (np. CC0, CC-BY), na której udostępniane są dane."
        }
    ],
    5: [
        {
            id: 13,
            question: "Co to jest GBIF Backbone Taxonomy?",
            options: [
                "Baza danych muzealnych okazów",
                "Hierarchiczna klasyfikacja łącząca wszystkie nazwy gatunków w GBIF",
                "System zarządzania kolekcjami",
                "Format pliku do eksportu danych"
            ],
            correctIndex: 1,
            explanation: "GBIF Backbone Taxonomy to ujednolicona hierarchiczna klasyfikacja łącząca ponad 2 miliony nazw gatunków z różnych źródeł."
        },
        {
            id: 14,
            question: "Co to jest synonim taksonomiczny?",
            options: [
                "Nazwa potoczna gatunku",
                "Nazwa naukowa uznana za równoznaczną z inną, akceptowaną nazwą",
                "Błąd w pisowni nazwy naukowej",
                "Nazwa gatunku w innym języku"
            ],
            correctIndex: 1,
            explanation: "Synonim taksonomiczny to nazwa, która odnosi się do tego samego taksonu co inna, akceptowana nazwa — np. Hirundo urbica to synonim Delichon urbicum."
        },
        {
            id: 15,
            question: "Jaka kategoria taksonomiczna jest najniższa w standardowej hierarchii?",
            options: [
                "Family (rodzina)",
                "Genus (rodzaj)",
                "Species (gatunek)",
                "Order (rząd)"
            ],
            correctIndex: 2,
            explanation: "Species (gatunek) to najniższy podstawowy rank w standardowej hierarchii taksonomicznej (Kingdom > Phylum > Class > Order > Family > Genus > Species)."
        }
    ]
};

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
