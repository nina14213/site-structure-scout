import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Database,
  FileText,
  Timer,
  XCircle,
  Check,
  Lightbulb,
  Clipboard,
  Key,
  Sparkles,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TutorialModal from "./TutorialModal";
import EscapeRoom from "./EscapeRoom";
import { GameState } from "@/hooks/useGameProgress";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useLanguage } from "@/i18n/LanguageContext";
import { calculateTimeBonus, formatCountdownTime } from "./gameHelpers";
import { useGuideSurfaceState } from "./GuideSurfaceContext";

// PL: Ksztalt wiersza, ktory gracz uzupelnia w tabeli occurrence.
// EN: Shape of the occurrence row filled in by the player.
interface OccurrenceRow {
  eventID: string;
  scientificName: string;
  recordedBy: string;
  organismQuantity: string;
  organismQuantityType: string;
}

interface OccurrenceValidationError {
  row: number;
  field: keyof OccurrenceRow;
  message: string;
}

const OCCURRENCE_FIELDS: Array<keyof OccurrenceRow> = [
  "eventID",
  "scientificName",
  "recordedBy",
  "organismQuantity",
  "organismQuantityType",
];

// Field notes from scientists - contains extra "messy" information
const baseFieldNotes = [
  {
    scientist: "Mgr. Katarzyna Słupecka",
    date: "25 October 2025",
    noteId: "KS-2025-001",
    entries: [
      {
        entryNumber: 1,
        time: "11:21",
        location: "Dębina municipal forest in Poznań, Poland",
        coordinates: "52.369327°N, 16.925402°E (WGS84)",
        weather: "Partly cloudy, 14°C, light wind from SW",
        habitat: "Forest edge near abandoned railroad tracks, sandy soil",
        observation:
          "A solitary Ailanthus altissima was growing at the forest margin beside the disused tracks. Tree c. 8 m tall, DBH close to 25 cm; bark dull grey with shallow fissures. Freshly crushed leaves released the typical sharp odor. Several young root suckers were visible within a couple of meters. Photographed as specimen #KS-341.",
        quantity: "1 individual",
        eventID: "3431",
      },
      {
        entryNumber: 2,
        time: "11:21",
        location: "In John Paul II Park, opposite the intersection of Krzyżowa and Dolna Wilda Streets, Poznań",
        coordinates: "52.39006°N, 16.92480°E (WGS84)",
        weather: "Partly cloudy, 15°C",
        habitat: "Small ornamental bush area, urban park setting",
        observation:
          "Between decorative shrubs I noticed a juvenile Ailanthus altissima, most likely a self-seeded recruit from a nearby street tree. Height roughly 2 m, stem about 4 cm in diameter. Compound leaves were well developed, with 13-25 leaflets and clear basal glands. A small voucher branch was collected for the herbarium (#KS-343).",
        quantity: "1 individual",
        eventID: "3433",
      },
    ],
  },
  {
    scientist: "Mgr. Michał Kowalski",
    date: "23 May 2025",
    noteId: "MK-2025-047",
    entries: [
      {
        entryNumber: 1,
        time: "15:47",
        location: "Marii Skłodowskiej-Curie Park, Poznań, Poland",
        coordinates: "52.3935°N, 16.9187°E (WGS84)",
        weather: "Sunny, 22°C, no wind",
        habitat: "Urban park, near walking path, loamy soil",
        observation:
          "One mature Ailanthus altissima was recorded along the park path. Estimated height around 12 m, DBH near 30 cm, with the crown leaning toward the open light between adjacent buildings. Pinnate leaves measured roughly 40-60 cm in length. No flowers or samaras were present during inspection. GPS position marked for follow-up monitoring.",
        quantity: "1 individual",
        eventID: "3432",
      },
      {
        entryNumber: 2,
        time: "15:47",
        location: "In the park at Powstańców Wielkopolskich Street, Poznań",
        coordinates: "52.4038°N, 16.9175°E (WGS84)",
        weather: "Sunny, 23°C",
        habitat: "Park lawn area, proximity to old buildings",
        observation:
          "At the edge of the lawn, close to an old fence line, a medium-sized Ailanthus altissima was confirmed. Height about 6 m, DBH approximately 15 cm. Recent pruning scars were visible on the lower crown, but the tree still appeared vigorous. Typical leaflet glands were easy to see. Added to the invasive species monitoring list.",
        quantity: "1 individual",
        eventID: "3434",
      },
    ],
  },
];

// Expected correct values for validation
const expectedOccurrenceData: OccurrenceRow[] = [
  {
    eventID: "3431",
    scientificName: "Ailanthus altissima",
    recordedBy: "K. Słupecka",
    organismQuantity: "1",
    organismQuantityType: "individual",
  },
  {
    eventID: "3432",
    scientificName: "Ailanthus altissima",
    recordedBy: "M. Kowalski",
    organismQuantity: "1",
    organismQuantityType: "individual",
  },
  {
    eventID: "3433",
    scientificName: "Ailanthus altissima",
    recordedBy: "K. Słupecka",
    organismQuantity: "1",
    organismQuantityType: "individual",
  },
  {
    eventID: "3434",
    scientificName: "Ailanthus altissima",
    recordedBy: "M. Kowalski",
    organismQuantity: "1",
    organismQuantityType: "individual",
  },
];

// Initial occurrence data with blanks for player to fill
const initialOccurrenceData: OccurrenceRow[] = [
  { eventID: "3431", scientificName: "", recordedBy: "", organismQuantity: "", organismQuantityType: "" },
  { eventID: "", scientificName: "", recordedBy: "", organismQuantity: "1", organismQuantityType: "" },
  {
    eventID: "3433",
    scientificName: "Ailanthus altissima",
    recordedBy: "",
    organismQuantity: "",
    organismQuantityType: "individual",
  },
  { eventID: "", scientificName: "", recordedBy: "M. Kowalski", organismQuantity: "1", organismQuantityType: "" },
];

// Event reference table (simplified from field notes)
const baseEventReference = [
  { eventID: "3431", eventDate: "25.10.2025 11:21", locality: "Dębina municipal forest", recorder: "K. Słupecka" },
  { eventID: "3432", eventDate: "23.05.2025 15:47", locality: "M. Skłodowskiej-Curie Park", recorder: "M. Kowalski" },
  { eventID: "3433", eventDate: "25.10.2025 11:21", locality: "John Paul II Park", recorder: "K. Słupecka" },
  { eventID: "3434", eventDate: "23.05.2025 15:47", locality: "Powstańców Wlkp. Street park", recorder: "M. Kowalski" },
];

// PL: Waliduje pojedynczy wiersz i zwraca precyzyjne bledy dla UI.
// EN: Validates one row and returns field-level errors for the UI.
function validateOccurrenceRow(
  row: OccurrenceRow,
  expected: OccurrenceRow,
  rowNumber: number,
  validEventIds: Set<string>,
): OccurrenceValidationError[] {
  const errors: OccurrenceValidationError[] = [];

  if (!row.eventID) {
    errors.push({ row: rowNumber, field: "eventID", message: "Brak wartości" });
  } else if (!validEventIds.has(row.eventID)) {
    errors.push({ row: rowNumber, field: "eventID", message: "Nieprawidłowy eventID" });
  } else if (row.eventID !== expected.eventID) {
    errors.push({ row: rowNumber, field: "eventID", message: "Błędna odpowiedź" });
  }

  OCCURRENCE_FIELDS.filter((field) => field !== "eventID").forEach((field) => {
    if (!row[field]) {
      errors.push({ row: rowNumber, field, message: "Brak wartości" });
    } else if (row[field] !== expected[field]) {
      errors.push({ row: rowNumber, field, message: "Błędna odpowiedź" });
    }
  });

  return errors;
}

// PL: Usuwa tylko te odpowiedzi, ktore sa wypelnione i niezgodne z kluczem.
// EN: Clears only filled answers that do not match the answer key.
function clearInvalidOccurrenceValues(row: OccurrenceRow, expected: OccurrenceRow): OccurrenceRow {
  const cleaned = { ...row };

  OCCURRENCE_FIELDS.forEach((field) => {
    if (row[field] && row[field] !== expected[field]) {
      cleaned[field] = "";
    }
  });

  return cleaned;
}

// PL: Liczy wypelnione komorki niezaleznie od ich poprawnosci.
// EN: Counts filled cells independently from validation correctness.
function countFilledOccurrenceCells(rows: OccurrenceRow[]): number {
  return rows.reduce((filledCount, row) => {
    return filledCount + OCCURRENCE_FIELDS.filter((field) => Boolean(row[field])).length;
  }, 0);
}

interface ExtensionLinkerProps {
  onComplete?: (score: number, data: unknown) => void;
  gameState?: GameState;
  addScore?: (points: number, reason?: string) => void;
  playSuccess?: () => void;
  playFail?: () => void;
  playDrop?: () => void;
  playLevelComplete?: () => void;
  startLevelTimer?: () => void;
  previousLevelData?: unknown;
}

export default function ExtensionLinker({
  onComplete,
  addScore,
  playSuccess,
  playFail,
  playLevelComplete,
  startLevelTimer,
}: ExtensionLinkerProps) {
  const { t, language } = useLanguage();
  const pick = useCallback((pl: string, en: string, fr: string, de: string) => {
    if (language === "en") return en;
    if (language === "fr") return fr;
    if (language === "de") return de;
    return pl;
  }, [language]);

  const noteUiCopy = useMemo(() => ({
    fieldNotesTitle: pick("Notatki terenowe", "Field Notes", "Notes de terrain", "Feldnotizen"),
    fieldObservationIdLabel: pick("Obserwacja terenowa ID", "Field observation ID", "ID d'observation de terrain", "Feldbeobachtung-ID"),
    entryLabel: pick("Wpis", "Entry", "Entrée", "Eintrag"),
    timeLabel: pick("Godzina", "Time", "Heure", "Uhrzeit"),
    weatherLabel: pick("Pogoda", "Weather", "Météo", "Wetter"),
    locationLabel: pick("Lokalizacja", "Location", "Lieu", "Fundort"),
    gpsLabel: "GPS",
    habitatLabel: pick("Siedlisko", "Habitat", "Habitat", "Habitat"),
    observationLabel: pick("Opis obserwacji", "Observation Notes", "Notes d'observation", "Beobachtungsnotizen"),
    quantityLabel: pick("Liczebność", "Quantity", "Quantité", "Menge"),
    dbhExplanation: pick(
      "Pierśnica (DBH) to średnica pnia drzewa mierzona na wysokości 130 cm nad powierzchnią gruntu.",
      "DBH = trunk diameter measured at about 130 cm above ground.",
      "DBH = diamètre du tronc mesuré à environ 130 cm du sol.",
      "DBH = Stammdurchmesser, gemessen in etwa 130 cm Höhe."
    ),
    eventDateHeader: pick("Data zdarzenia", "eventDate", "eventDate", "eventDate"),
    localityHeader: pick("Lokalizacja", "Locality", "Localité", "Fundort"),
    recorderHeader: pick("Obserwator", "Recorder", "Observateur", "Erfasser"),
    validationTitle: pick("Status walidacji", "Validation Status", "Statut de validation", "Validierungsstatus"),
    progressComplete: pick("ukończono", "complete", "terminé", "abgeschlossen"),
    errorsLabel: pick("błędów", "errors", "erreurs", "Fehler"),
    pointsUnit: pick("pkt", "pts", "pts", "Pkt."),
    selectEventId: pick("Wybierz eventID", "Select eventID", "Sélectionner eventID", "eventID auswählen"),
    selectSpecies: pick("Wybierz gatunek", "Select species", "Sélectionner l'espèce", "Art auswählen"),
    selectRecorder: pick("Wybierz obserwatora", "Select recorder", "Sélectionner l'observateur", "Erfasser auswählen"),
    quantityPlaceholder: pick("Liczba", "Quantity", "Quantité", "Menge"),
    typePlaceholder: pick("Typ", "Type", "Type", "Typ"),
    individualLabel: pick("osobnik", "individual", "individu", "Individuum"),
    colonyLabel: pick("kolonia", "colony", "colonie", "Kolonie"),
    clumpLabel: pick("kępa", "clump", "touffe", "Horst"),
    patchLabel: pick("płat", "patch", "plaque", "Bestand"),
    populationLabel: pick("populacja", "population", "population", "Population"),
  }), [pick]);

  const fieldNotes = useMemo(() => {
    if (language !== "pl") return baseFieldNotes;

    return [
      {
        ...baseFieldNotes[0],
        date: "25 października 2025",
        entries: [
          {
            ...baseFieldNotes[0].entries[0],
            location: "Las Dębina w Poznaniu, Polska",
            weather: "Przejaśnienia, 14°C, lekki SW",
            habitat: "Skraj lasu przy torach, piach",
            observation:
              "1 × Ailanthus altissima. Skraj lasu przy torach. Wys. ok. 8 m, DBH ~25 cm. Kora szarawa, płytko spękana. Liście po roztarciu ostry zapach. W pobliżu kilka młodych odrostów. Foto #KS-341.",
            quantity: "1 osobnik",
          },
          {
            ...baseFieldNotes[0].entries[1],
            location: "W Parku Jana Pawła II, naprzeciw skrzyżowania ulic Krzyżowej i Dolna Wilda w Poznaniu",
            weather: "Lekko pochmurno, 15°C",
            habitat: "Pas krzewów ozdobnych, park miejski",
            observation:
              "1 × juv. Ailanthus altissima między krzewami. Wys. ok. 2 m, śr. pędu ok. 4 cm. Liście złożone, 13-25 listków, gruczołki u nasady widoczne. Prawdopodobnie samosiew z pobliskiego drzewa. Pobrano gałązkę zielnikową, voucher #KS-343.",
            quantity: "1 osobnik",
          },
        ],
      },
      {
        ...baseFieldNotes[1],
        date: "23 maja 2025",
        entries: [
          {
            ...baseFieldNotes[1].entries[0],
            location: "Park im. Marii Skłodowskiej-Curie w Poznaniu, Polska",
            weather: "Słonecznie, 22°C, wiatr niewyczuwalny",
            habitat: "Park miejski przy alejce spacerowej; podłoże gliniaste",
            observation:
              "Przy alejce parkowej stwierdzono dojrzały okaz Ailanthus altissima. Wysokość oszacowano na około 12 m, DBH na blisko 30 cm. Korona rozwinięta jednostronnie, z wyraźnym wychyleniem ku wolnej przestrzeni między zabudową. Liście pierzaste długości około 40-60 cm. W dniu obserwacji nie odnotowano kwiatów ani skrzydlaków. Lokalizację zapisano do dalszej kontroli.",
            quantity: "1 osobnik",
          },
          {
            ...baseFieldNotes[1].entries[1],
            location: "W parku przy ul. Powstańców Wielkopolskich w Poznaniu",
            weather: "Słonecznie, 23°C",
            habitat: "Trawnik parkowy w sąsiedztwie starszej zabudowy i ogrodzenia",
            observation:
              "Na obrzeżu trawnika, przy starej linii ogrodzenia, potwierdzono średniej wielkości okaz Ailanthus altissima. Wysokość oceniono na około 6 m, DBH na około 15 cm. W dolnej części korony widoczne świeże ślady wcześniejszych cięć pielęgnacyjnych, bez wyraźnego pogorszenia kondycji drzewa. Gruczołki u nasady listków czytelne. Stanowisko włączono do monitoringu gatunków inwazyjnych.",
            quantity: "1 osobnik",
          },
        ],
      },
    ];
  }, [language]);

  const eventReference = useMemo(() => {
    if (language !== "pl") return baseEventReference;

    return [
      { ...baseEventReference[0], locality: "las Dębina" },
      { ...baseEventReference[1], locality: "Park im. M. Skłodowskiej-Curie" },
      { ...baseEventReference[2], locality: "Park Jana Pawła II" },
      { ...baseEventReference[3], locality: "park przy ul. Powstańców Wlkp." },
    ];
  }, [language]);
  const [occurrenceData, setOccurrenceData] = useState(initialOccurrenceData);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errors: OccurrenceValidationError[];
  }>({ valid: false, errors: [] });
  const [showTutorial, setShowTutorial] = useState(true);
  const [levelScore, setLevelScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showEscapeRoom, setShowEscapeRoom] = useState(false);

  useGuideSurfaceState({ key: "tutorial", levelNumber: 2 }, showTutorial && !showEscapeRoom);
  useGuideSurfaceState({ key: "extensionEscapeRoom" }, showEscapeRoom);

  const eventIds = useMemo(() => new Set(eventReference.map((row) => row.eventID)), [eventReference]);

  useEffect(() => {
    startLevelTimer?.();
  }, [startLevelTimer]);

  // PL: Odliczanie jest wspolne z innymi poziomami gry.
  // EN: Countdown behavior is shared with the other game levels.
  const handleTimerExpired = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  useCountdownTimer({
    isRunning: isTimerRunning,
    timeLeft,
    setTimeLeft,
    onExpire: handleTimerExpired,
  });

  // PL: Walidacja musi pasowac dokladnie do klucza odpowiedzi dla tego poziomu.
  // EN: Validation must match this level's answer key exactly.
  const validateOccurrences = useCallback(() => {
    const errors = occurrenceData.flatMap((row, idx) =>
      validateOccurrenceRow(row, expectedOccurrenceData[idx], idx + 1, eventIds),
    );

    setValidationStatus({ valid: errors.length === 0, errors });
    if (errors.length === 0) {
      playSuccess?.();
    } else {
      playFail?.();
    }
    return errors;
  }, [occurrenceData, eventIds, playSuccess, playFail]);

  // PL: Pomoc dla gracza - zostawia poprawne pola i kasuje tylko bledne.
  // EN: Player assist - keeps correct fields and clears only wrong ones.
  const clearWrongAnswers = useCallback(() => {
    setOccurrenceData((prev) => {
      return prev.map((row, idx) => clearInvalidOccurrenceValues(row, expectedOccurrenceData[idx]));
    });
    setValidationStatus({ valid: false, errors: [] });
  }, []);

  // PL: Kazda edycja uniewaznia poprzedni wynik walidacji.
  // EN: Every edit invalidates the previous validation result.
  const updateOccurrenceCell = useCallback((rowIndex: number, field: keyof OccurrenceRow, value: string) => {
    setOccurrenceData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
    setValidationStatus({ valid: false, errors: [] });
  }, []);

  // PL: Wynik laczy poprawna walidacje, wypelnienie tabeli i bonus za czas.
  // EN: Score combines valid data, table completion, and the time bonus.
  useEffect(() => {
    let score = 0;
    if (validationStatus.valid) score += 200;

    const totalCells = occurrenceData.length * 5;
    const filledCells = countFilledOccurrenceCells(occurrenceData);
    score += Math.floor((filledCells / totalCells) * 100);
    score += calculateTimeBonus(timeLeft);

    setLevelScore(score);
  }, [validationStatus, occurrenceData, timeLeft]);

  const progress = validationStatus.valid ? 100 : 0;
  const canComplete = validationStatus.valid;

  const handleComplete = () => {
    if (!canComplete) {
      playFail?.();
      return;
    }
    const finalScore = levelScore;
    addScore?.(finalScore, "Extension Nexus Complete");
    playLevelComplete?.();
    onComplete?.(finalScore, { fieldNotes, occurrenceData });
  };

  const handleEscapeRoomComplete = (escapeScore: number, data: unknown) => {
    addScore?.(escapeScore, "Escape Room Complete");
    playLevelComplete?.();
    onComplete?.(escapeScore, data);
  };

  // Escape Room Mode
  if (showEscapeRoom) {
    return (
      <EscapeRoom
        onComplete={handleEscapeRoomComplete}
        onBack={() => setShowEscapeRoom(false)}
        addScore={addScore}
        playSuccess={playSuccess}
        playFail={playFail}
        playLevelComplete={playLevelComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                {t('ext.title')}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                {t('ext.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 60
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Timer className={`w-5 h-5 ${timeLeft < 60 ? "animate-pulse" : ""}`} />
                <span className="font-mono text-lg">{formatCountdownTime(timeLeft)}</span>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400"
              >
                {levelScore} {noteUiCopy.pointsUnit}
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
          <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-slate-400">
            <span>{Math.round(progress)}% {noteUiCopy.progressComplete}</span>
            <span>{validationStatus.errors.length} {noteUiCopy.errorsLabel}</span>
          </div>
        </motion.div>

        {/* Escape Room Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowEscapeRoom(true)}
            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 p-1 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25"
          >
            <div className="relative flex items-center justify-between gap-4 rounded-lg bg-slate-900/90 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <Key className="h-6 w-6 text-amber-400" />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     🔐 {t('ext.escapeRoom')}
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </h3>
                    <p className="text-sm text-slate-400">
                      {t('ext.escapeRoomDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-amber-400 transition-transform group-hover:translate-x-1">
                  <span className="text-sm font-medium">{t('ext.enter')}</span>
                  <span className="text-xl">→</span>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 opacity-50 blur-xl" />
          </button>
        </motion.div>

        {/* Field Notes from Scientists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {fieldNotes.map((note, noteIdx) => (
            <Card
              key={noteIdx}
              className="bg-amber-50/90 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700 backdrop-blur shadow-lg"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-900 dark:text-amber-200 flex items-center gap-2 text-lg">
                  <Clipboard className="w-5 h-5" />
                  {noteUiCopy.fieldNotesTitle}: {note.noteId}
                </CardTitle>
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">{note.scientist}</span> • {note.date}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {note.entries.map((entry, entryIdx) => (
                  <div
                    key={entryIdx}
                    className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-600"
                      >
                        {noteUiCopy.fieldObservationIdLabel}: {entry.eventID}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{noteUiCopy.entryLabel} #{entry.entryNumber}</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">{noteUiCopy.timeLabel}:</span> {entry.time}
                        </div>
                        <div>
                          <span className="font-medium">{noteUiCopy.weatherLabel}:</span> {entry.weather}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{noteUiCopy.locationLabel}:</span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{entry.location}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{noteUiCopy.gpsLabel}:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs ml-1 font-mono">
                          {entry.coordinates}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{noteUiCopy.habitatLabel}:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs ml-1">{entry.habitat}</span>
                      </div>

                      <div className="bg-amber-100/50 dark:bg-amber-900/30 rounded p-2 mt-2">
                        <span className="font-medium text-amber-800 dark:text-amber-300">{noteUiCopy.observationLabel}:</span>
                        <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 leading-relaxed italic">
                          "{entry.observation}"
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pt-2 border-t border-amber-200 dark:border-amber-800">
                        <span className="text-xs">
                          <span className="font-medium">{noteUiCopy.quantityLabel}:</span> {entry.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-100/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
          <span className="font-semibold">DBH</span> — {noteUiCopy.dbhExplanation}
        </div>

        {/* Occurrence Extension (editable) */}
        <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t('ext.occurrenceTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                {t('ext.occurrenceHint')}
              </AlertDescription>
            </Alert>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventID</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">scientificName</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">recordedBy</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">organismQuantity</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">organismQuantityType</th>
                  </tr>
                </thead>
                <tbody>
                  {occurrenceData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                      <td className="p-2">
                        <Select value={row.eventID} onValueChange={(val) => updateOccurrenceCell(idx, "eventID", val)}>
                          <SelectTrigger
                            className={`w-full ${!row.eventID ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                          >
                            <SelectValue placeholder={noteUiCopy.selectEventId} />
                          </SelectTrigger>
                          <SelectContent>
                            {eventReference.map((evt) => (
                              <SelectItem key={evt.eventID} value={evt.eventID}>
                                {evt.eventID}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.scientificName}
                          onValueChange={(val) => updateOccurrenceCell(idx, "scientificName", val)}
                        >
                          <SelectTrigger
                            className={`w-full ${!row.scientificName ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                          >
                            <SelectValue placeholder={noteUiCopy.selectSpecies} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ailanthus altissima">Ailanthus altissima</SelectItem>
                            <SelectItem value="Robinia pseudoacacia">Robinia pseudoacacia</SelectItem>
                            <SelectItem value="Acer negundo">Acer negundo</SelectItem>
                            <SelectItem value="Solidago canadensis">Solidago canadensis</SelectItem>
                            <SelectItem value="Reynoutria japonica">Reynoutria japonica</SelectItem>
                            <SelectItem value="Impatiens glandulifera">Impatiens glandulifera</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.recordedBy}
                          onValueChange={(val) => updateOccurrenceCell(idx, "recordedBy", val)}
                        >
                          <SelectTrigger
                            className={`w-full ${!row.recordedBy ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                          >
                            <SelectValue placeholder={noteUiCopy.selectRecorder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="K. Słupecka">K. Słupecka</SelectItem>
                            <SelectItem value="M. Kowalski">M. Kowalski</SelectItem>
                            <SelectItem value="A. Nowak">A. Nowak</SelectItem>
                            <SelectItem value="J. Wiśniewski">J. Wiśniewski</SelectItem>
                            <SelectItem value="P. Zieliński">P. Zieliński</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.organismQuantity}
                          onValueChange={(val) => updateOccurrenceCell(idx, "organismQuantity", val)}
                        >
                          <SelectTrigger
                            className={`w-full ${!row.organismQuantity ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                          >
                            <SelectValue placeholder={noteUiCopy.quantityPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.organismQuantityType}
                          onValueChange={(val) => updateOccurrenceCell(idx, "organismQuantityType", val)}
                        >
                          <SelectTrigger
                            className={`w-full ${!row.organismQuantityType ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-slate-600"} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                          >
                            <SelectValue placeholder={noteUiCopy.typePlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">{noteUiCopy.individualLabel}</SelectItem>
                            <SelectItem value="colony">{noteUiCopy.colonyLabel}</SelectItem>
                            <SelectItem value="clump">{noteUiCopy.clumpLabel}</SelectItem>
                            <SelectItem value="patch">{noteUiCopy.patchLabel}</SelectItem>
                            <SelectItem value="population">{noteUiCopy.populationLabel}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Validation */}
        <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              {validationStatus.valid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {noteUiCopy.validationTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={validateOccurrences}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              {t('ext.validateData')}
            </Button>

            {validationStatus.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">{t('ext.errorsFound')}</h3>
                  <Button
                    onClick={clearWrongAnswers}
                    variant="outline"
                    size="sm"
                    className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('ext.removeWrong')}
                  </Button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {validationStatus.errors.map((err, idx) => (
                    <Alert key={idx} className="bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-300">
                        {t('val.row')} {err.row}, {err.field}: {err.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {validationStatus.valid && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {t('ext.allValid')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`w-full ${canComplete ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 dark:bg-slate-600"}`}
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {canComplete ? t('ext.completeLevel') : t('ext.fixFirst')}
            </Button>
          </CardFooter>
        </Card>

        {/* Modals */}
        

        {showTutorial && <TutorialModal levelNumber={2} isOpen={showTutorial} onClose={() => setShowTutorial(false)} />}
      </div>
    </div>
  );
}
