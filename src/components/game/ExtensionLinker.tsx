import React, { useState, useCallback, useEffect } from "react";
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
  BookOpen,
  Clipboard,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuizModal from "./QuizModal";
import TutorialModal from "./TutorialModal";
import { GameState } from "@/hooks/useGameProgress";

// Field notes from scientists - contains extra "messy" information
const fieldNotes = [
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
          "Found a single mature Tree of Heaven (Ailanthus altissima). Height approximately 8m, DBH ~25cm. Bark grayish-brown with shallow fissures. Strong unpleasant odor from crushed leaves. Signs of root sprouting nearby. Photographed specimen #KS-341.",
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
          "Single young Ailanthus altissima sapling growing between shrubs. Height ~2m, stem diameter 4cm. Likely spread from nearby mature tree. Compound leaves with 13-25 leaflets observed. Sample collected for herbarium (voucher #KS-343).",
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
          "Observed one Tree of Heaven (Ailanthus altissima) specimen. Mature tree, estimated height 12m, trunk circumference 95cm (DBH ~30cm). Crown asymmetrical due to neighboring buildings. Distinctive pinnate leaves, 40-60cm long. No flowering observed yet. GPS marked for monitoring.",
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
          "Single Ailanthus altissima tree identified. Medium-sized specimen, height ~6m, DBH 15cm. Growing at park edge near fence. Leaves showing typical glandular base on leaflets. Evidence of previous pruning attempts. Noted for invasive species monitoring program.",
        quantity: "1 individual",
        eventID: "3434",
      },
    ],
  },
];

// Expected correct values for validation
const expectedOccurrenceData = [
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
const initialOccurrenceData = [
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
const eventReference = [
  { eventID: "3431", eventDate: "25.10.2025 11:21", locality: "Dębina municipal forest", recorder: "K. Słupecka" },
  { eventID: "3432", eventDate: "23.05.2025 15:47", locality: "M. Skłodowskiej-Curie Park", recorder: "M. Kowalski" },
  { eventID: "3433", eventDate: "25.10.2025 11:21", locality: "John Paul II Park", recorder: "K. Słupecka" },
  { eventID: "3434", eventDate: "23.05.2025 15:47", locality: "Powstańców Wlkp. Street park", recorder: "M. Kowalski" },
];

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
  const [occurrenceData, setOccurrenceData] = useState(initialOccurrenceData);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
  }>({ valid: false, errors: [] });
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [levelScore, setLevelScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const eventIds = new Set(eventReference.map((row) => row.eventID));

  useEffect(() => {
    startLevelTimer?.();
  }, [startLevelTimer]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Validate occurrence data - must match exactly the expected values
  const validateOccurrences = useCallback(() => {
    const errors: Array<{ row: number; field: string; message: string }> = [];
    occurrenceData.forEach((row, idx) => {
      const expected = expectedOccurrenceData[idx];

      // Check eventID
      if (!row.eventID) {
        errors.push({ row: idx + 1, field: "eventID", message: "Brak wartości" });
      } else if (!eventIds.has(row.eventID)) {
        errors.push({ row: idx + 1, field: "eventID", message: "Nieprawidłowy eventID" });
      } else if (row.eventID !== expected.eventID) {
        errors.push({ row: idx + 1, field: "eventID", message: "Błędna odpowiedź" });
      }

      // Check scientificName
      if (!row.scientificName) {
        errors.push({ row: idx + 1, field: "scientificName", message: "Brak wartości" });
      } else if (row.scientificName !== expected.scientificName) {
        errors.push({ row: idx + 1, field: "scientificName", message: "Błędna odpowiedź" });
      }

      // Check recordedBy
      if (!row.recordedBy) {
        errors.push({ row: idx + 1, field: "recordedBy", message: "Brak wartości" });
      } else if (row.recordedBy !== expected.recordedBy) {
        errors.push({ row: idx + 1, field: "recordedBy", message: "Błędna odpowiedź" });
      }

      // Check organismQuantity
      if (!row.organismQuantity) {
        errors.push({ row: idx + 1, field: "organismQuantity", message: "Brak wartości" });
      } else if (row.organismQuantity !== expected.organismQuantity) {
        errors.push({ row: idx + 1, field: "organismQuantity", message: "Błędna odpowiedź" });
      }

      // Check organismQuantityType
      if (!row.organismQuantityType) {
        errors.push({ row: idx + 1, field: "organismQuantityType", message: "Brak wartości" });
      } else if (row.organismQuantityType !== expected.organismQuantityType) {
        errors.push({ row: idx + 1, field: "organismQuantityType", message: "Błędna odpowiedź" });
      }
    });

    setValidationStatus({ valid: errors.length === 0, errors });
    if (errors.length === 0) {
      playSuccess?.();
    } else {
      playFail?.();
    }
    return errors;
  }, [occurrenceData, eventIds, playSuccess, playFail]);

  // Clear wrong answers
  const clearWrongAnswers = useCallback(() => {
    setOccurrenceData((prev) => {
      return prev.map((row, idx) => {
        const expected = expectedOccurrenceData[idx];
        const newRow = { ...row };

        if (row.eventID && row.eventID !== expected.eventID) {
          newRow.eventID = "";
        }
        if (row.scientificName && row.scientificName !== expected.scientificName) {
          newRow.scientificName = "";
        }
        if (row.recordedBy && row.recordedBy !== expected.recordedBy) {
          newRow.recordedBy = "";
        }
        if (row.organismQuantity && row.organismQuantity !== expected.organismQuantity) {
          newRow.organismQuantity = "";
        }
        if (row.organismQuantityType && row.organismQuantityType !== expected.organismQuantityType) {
          newRow.organismQuantityType = "";
        }

        return newRow;
      });
    });
    setValidationStatus({ valid: false, errors: [] });
  }, []);

  // Update occurrence cell value
  const updateOccurrenceCell = useCallback((rowIndex: number, field: string, value: string) => {
    setOccurrenceData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
    setValidationStatus({ valid: false, errors: [] });
  }, []);

  // Calculate score
  useEffect(() => {
    let score = 0;
    if (validationStatus.valid) score += 200;

    const totalCells = occurrenceData.length * 5;
    const filledCells = occurrenceData.reduce((acc, row) => {
      return (
        acc +
        (row.eventID ? 1 : 0) +
        (row.scientificName ? 1 : 0) +
        (row.recordedBy ? 1 : 0) +
        (row.organismQuantity ? 1 : 0) +
        (row.organismQuantityType ? 1 : 0)
      );
    }, 0);
    score += Math.floor((filledCells / totalCells) * 100);

    if (timeLeft > 240) score += 50;
    else if (timeLeft > 180) score += 30;
    else if (timeLeft > 60) score += 10;

    setLevelScore(score);
  }, [validationStatus, occurrenceData, timeLeft]);

  const progress = validationStatus.valid ? 100 : 0;
  const canComplete = validationStatus.valid;

  const handleComplete = () => {
    if (!canComplete) {
      playFail?.();
      return;
    }
    setShowQuiz(true);
  };

  const handleQuizComplete = (quizScore: number) => {
    const finalScore = levelScore + quizScore * 2;
    addScore?.(finalScore, "Extension Nexus Complete");
    playLevelComplete?.();
    onComplete?.(finalScore, { fieldNotes, occurrenceData });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                Mission 2: Extension Nexus
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                Fill in field notes and match occurrence to event
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
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-4 py-2 border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400"
              >
                {levelScore} pts
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
          <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-slate-400">
            <span>{Math.round(progress)}% complete</span>
            <span>{validationStatus.errors.length} errors</span>
          </div>
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
                  Field Notes: {note.noteId}
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
                        Event ID: {entry.eventID}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Entry #{entry.entryNumber}</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Time:</span> {entry.time}
                        </div>
                        <div>
                          <span className="font-medium">Weather:</span> {entry.weather}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{entry.location}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">GPS:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs ml-1 font-mono">
                          {entry.coordinates}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Habitat:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs ml-1">{entry.habitat}</span>
                      </div>

                      <div className="bg-amber-100/50 dark:bg-amber-900/30 rounded p-2 mt-2">
                        <span className="font-medium text-amber-800 dark:text-amber-300">Observation Notes:</span>
                        <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 leading-relaxed italic">
                          "{entry.observation}"
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pt-2 border-t border-amber-200 dark:border-amber-800">
                        <span className="text-xs">
                          <span className="font-medium">Quantity:</span> {entry.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Event Reference Table */}
        <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Event Reference (Quick Lookup)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                Use this reference to match eventIDs to locations and recorders from the field notes above.
              </AlertDescription>
            </Alert>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventID</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventDate</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">Locality</th>
                    <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">Recorder</th>
                  </tr>
                </thead>
                <tbody>
                  {eventReference.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                      <td className="p-2 font-mono text-purple-600 dark:text-purple-400">{row.eventID}</td>
                      <td className="p-2 text-gray-700 dark:text-slate-300">{row.eventDate}</td>
                      <td className="p-2 text-gray-700 dark:text-slate-300">{row.locality}</td>
                      <td className="p-2 text-gray-700 dark:text-slate-300">{row.recorder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Occurrence Extension (editable) */}
        <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Occurrence Extension - Fill Missing Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                Complete the missing values in field notes. All fields are required!
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
                            <SelectValue placeholder="Select eventID" />
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
                            <SelectValue placeholder="Select species" />
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
                            <SelectValue placeholder="Select recorder" />
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
                            <SelectValue placeholder="Quantity" />
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
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">individual</SelectItem>
                            <SelectItem value="colony">colony</SelectItem>
                            <SelectItem value="clump">clump</SelectItem>
                            <SelectItem value="patch">patch</SelectItem>
                            <SelectItem value="population">population</SelectItem>
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
              Validation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={validateOccurrences}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Validate Data
            </Button>

            {validationStatus.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">Znaleziono błędy:</h3>
                  <Button
                    onClick={clearWrongAnswers}
                    variant="outline"
                    size="sm"
                    className="border-red-400 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Usuń błędne odpowiedzi
                  </Button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {validationStatus.errors.map((err, idx) => (
                    <Alert key={idx} className="bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-300">
                        Wiersz {err.row}, {err.field}: {err.message}
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
                  All data is valid! Ready to complete the level.
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
              {canComplete ? "Complete Level" : "Fix Errors First"}
            </Button>
          </CardFooter>
        </Card>

        {/* Modals */}
        {showQuiz && <QuizModal onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />}

        {showTutorial && <TutorialModal levelNumber={2} isOpen={showTutorial} onClose={() => setShowTutorial(false)} />}
      </div>
    </div>
  );
}
