import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Key,
  Timer,
  Lightbulb,
  Skull,
  Trophy,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { GameState } from "@/hooks/useGameProgress";

interface Puzzle {
  id: number;
  title: string;
  description: string;
  hint: string;
  clue: string;
  answer: string;
  unlocked: boolean;
  solved: boolean;
  category: "eventID" | "scientificName" | "recordedBy" | "quantity";
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    title: "Zagadka Identyfikatora",
    description: "W notatkach terenowych z lasu miejskiego Dębina znajdziesz obserwację Ailanthus altissima wykonaną przez K. Słupecką. Jaki numer eventID został przypisany tej obserwacji?",
    hint: "Poszukaj w ściądze notatek terenowych wpisu dla 'Las Dębina' z datą 25.10.2025.",
    clue: "To 4-cyfrowa liczba zaczynająca się od 343...",
    answer: "3431",
    unlocked: true,
    solved: false,
    category: "eventID",
  },
  {
    id: 2,
    title: "Zagadka Gatunku (GBIF)",
    description: "🌐 Wejdź na stronę GBIF.org i wyszukaj gatunek 'Ailanthus altissima'. Znajdź informację o autorze nazwy naukowej (Authorship). Kto jako pierwszy formalnie opisał ten gatunek? Podaj nazwisko autora.",
    hint: "Na GBIF.org wpisz 'Ailanthus altissima' w wyszukiwarkę, kliknij wynik i sprawdź sekcję z autorem nazwy (zazwyczaj w nawiasach po nazwie gatunku).",
    clue: "Szukaj formatu: Ailanthus altissima (Nazwisko) Nazwisko2. Odpowiedź to nazwisko w nawiasie.",
    answer: "Mill.",
    unlocked: false,
    solved: false,
    category: "scientificName",
  },
  {
    id: 3,
    title: "Zagadka Współrzędnych",
    description: "📍 Obserwacja w Parku M. Skłodowskiej-Curie została wykonana pod współrzędnymi 51.7461°N, 19.4536°E. W standardzie Darwin Core pole 'decimalLatitude' przechowuje szerokość geograficzną. Jaka jest wartość decimalLatitude tej obserwacji? (podaj z 4 miejscami po przecinku)",
    hint: "Szerokość geograficzna (latitude) to wartość N/S. Szukaj liczby przy oznaczeniu °N.",
    clue: "Odpowiedź to liczba z 4 miejscami po przecinku, zaczynająca się od 51...",
    answer: "51.7461",
    unlocked: false,
    solved: false,
    category: "eventID",
  },
  {
    id: 4,
    title: "Zagadka Daty",
    description: "📅 Obserwacja w Lesie Dębina odbyła się 25 października 2025 roku. W standardzie Darwin Core daty zapisuje się w formacie ISO 8601. Jak prawidłowo zapisać tę datę w polu 'eventDate'?",
    hint: "Format ISO 8601 to: RRRR-MM-DD, gdzie RRRR to rok, MM to miesiąc, DD to dzień.",
    clue: "Odpowiedź ma format: 2025-XX-XX. Październik to miesiąc numer 10.",
    answer: "2025-10-25",
    unlocked: false,
    solved: false,
    category: "eventID",
  },
  {
    id: 5,
    title: "Zagadka Obserwatora",
    description: "Rozszyfruj zakodowane nazwisko używając szyfru Cezara z przesunięciem 1 (każda litera zamieniona na poprzednią w alfabecie): 'K. Lpxbmtlj'. Kto wykonał obserwację?",
    hint: "Przesunięcie 1 oznacza: K→J, L→K, p→o, x→w, b→a, m→l, t→s, l→k, j→i",
    clue: "Wynik to inicjał imienia + nazwisko w formacie: X. Xxxxxxxx",
    answer: "J. Kowalski",
    unlocked: false,
    solved: false,
    category: "recordedBy",
  },
  {
    id: 6,
    title: "Zagadka Hemisfer",
    description: "🧭 Obserwacja w Parku Jana Pawła II ma współrzędne 51.7523°N, 19.4287°E. W polu 'decimalLongitude' zapisujemy długość geograficzną. Podaj wartość decimalLongitude (z 4 miejscami po przecinku).",
    hint: "Długość geograficzna (longitude) to wartość E/W. Szukaj liczby przy oznaczeniu °E.",
    clue: "Odpowiedź to liczba zaczynająca się od 19...",
    answer: "19.4287",
    unlocked: false,
    solved: false,
    category: "eventID",
  },
  {
    id: 7,
    title: "Zagadka Ilości",
    description: "Przejrzyj wszystkie notatki terenowe. Przy każdej obserwacji Ailanthus altissima w polu 'Quantity' podano liczbę osobników. Jaka wartość pojawia się we WSZYSTKICH wpisach?",
    hint: "Sprawdź wpisy: Las Dębina, Park M. Skłodowskiej-Curie, Park Jana Pawła II, Park ul. Powstańców Wlkp.",
    clue: "Każda obserwacja dotyczy tej samej liczby drzew. Podaj cyfrę.",
    answer: "1",
    unlocked: false,
    solved: false,
    category: "quantity",
  },
  {
    id: 8,
    title: "Zagadka Geodezyjna",
    description: "🌍 Wszystkie obserwacje wykonano w Polsce. W standardzie Darwin Core pole 'geodeticDatum' określa układ odniesienia współrzędnych. Jaki jest najczęściej stosowany globalny układ odniesienia GPS? (podaj skrót)",
    hint: "To światowy system geodezyjny używany przez odbiorniki GPS na całym świecie, ustanowiony w 1984 roku.",
    clue: "Skrót składa się z 5 znaków: 3 litery + 2 cyfry.",
    answer: "WGS84",
    unlocked: false,
    solved: false,
    category: "eventID",
  },
];

interface EscapeRoomProps {
  onComplete?: (score: number, data: unknown) => void;
  onBack?: () => void;
  gameState?: GameState;
  addScore?: (points: number, reason?: string) => void;
  playSuccess?: () => void;
  playFail?: () => void;
  playLevelComplete?: () => void;
}

export default function EscapeRoom({
  onComplete,
  onBack,
  addScore,
  playSuccess,
  playFail,
  playLevelComplete,
}: EscapeRoomProps) {
  const [puzzleState, setPuzzleState] = useState<Puzzle[]>(puzzles);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isComplete, setIsComplete] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [unlockedPuzzleId, setUnlockedPuzzleId] = useState<number | null>(null);

  // Timer
  useEffect(() => {
    if (isComplete || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(() => {
    const puzzle = puzzleState[currentPuzzle];
    const isCorrect = userAnswer.trim().toLowerCase() === puzzle.answer.toLowerCase();

    if (isCorrect) {
      playSuccess?.();
      
      let puzzleScore = 100;
      if (showHint) puzzleScore -= 25;
      if (showClue) puzzleScore -= 25;
      puzzleScore -= attempts * 10;
      puzzleScore = Math.max(10, puzzleScore);
      
      setScore((prev) => prev + puzzleScore);
      setUnlockedPuzzleId(currentPuzzle);
      setShowUnlockAnimation(true);

      setPuzzleState((prev) => {
        const updated = [...prev];
        updated[currentPuzzle] = { ...updated[currentPuzzle], solved: true };
        if (currentPuzzle + 1 < updated.length) {
          updated[currentPuzzle + 1] = { ...updated[currentPuzzle + 1], unlocked: true };
        }
        return updated;
      });

      const allSolved = puzzleState.filter((p) => p.solved).length === puzzleState.length - 1;
      
      // Delay progression to show unlock animation
      setTimeout(() => {
        setShowUnlockAnimation(false);
        setUnlockedPuzzleId(null);

        if (allSolved) {
          setIsComplete(true);
          const timeBonus = Math.floor(timeLeft / 10);
          const finalScore = score + puzzleScore + timeBonus + 200;
          setScore(finalScore);
          addScore?.(finalScore, "Escape Room Complete");
          playLevelComplete?.();
        } else {
          setCurrentPuzzle((prev) => prev + 1);
          setUserAnswer("");
          setShowHint(false);
          setShowClue(false);
          setAttempts(0);
        }
      }, 2000);
    } else {
      playFail?.();
      setShake(true);
      setAttempts((prev) => prev + 1);
      setTimeout(() => setShake(false), 500);
    }
  }, [puzzleState, currentPuzzle, userAnswer, showHint, showClue, attempts, score, timeLeft, playSuccess, playFail, playLevelComplete, addScore]);

  const handleReset = () => {
    setPuzzleState(puzzles);
    setCurrentPuzzle(0);
    setUserAnswer("");
    setShowHint(false);
    setShowClue(false);
    setAttempts(0);
    setTimeLeft(600);
    setIsComplete(false);
    setScore(0);
  };

  const solvedCount = puzzleState.filter((p) => p.solved).length;
  const progress = (solvedCount / puzzleState.length) * 100;

  const handleComplete = () => {
    onComplete?.(score, { mode: "escapeRoom", puzzlesSolved: solvedCount });
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Trophy className="w-24 h-24 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">🎉 Escape Room Ukończony!</h1>
          <p className="text-emerald-300 text-xl mb-2">Rozwiązałeś wszystkie zagadki!</p>
          <p className="text-white text-3xl font-mono mb-8">{score} punktów</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleComplete} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              Zakończ Misję
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              Zagraj Ponownie
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentPuzzleData = puzzleState[currentPuzzle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Key className="w-8 h-8 text-amber-400" />
                🔐 Escape Room Danych
              </h1>
              <p className="text-slate-400 mt-1">
                Rozwiąż zagadki, aby odblokować sekrety Darwin Core
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white">
                ← Powrót
              </Button>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 60
                    ? "bg-red-500/20 text-red-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                <Timer className={`w-5 h-5 ${timeLeft < 60 ? "animate-pulse" : ""}`} />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2 border-amber-500 text-amber-400">
                {score} pts
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="h-3 bg-slate-700" />
          <div className="flex justify-between text-sm mt-2 text-slate-400">
            <span>{solvedCount}/{puzzleState.length} zagadek rozwiązanych</span>
            <span>{attempts} prób w tej zagadce</span>
          </div>
        </motion.div>

        {/* Puzzle Progress */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {puzzleState.map((puzzle, idx) => (
            <motion.button
              key={puzzle.id}
              onClick={() => puzzle.unlocked && !puzzle.solved && setCurrentPuzzle(idx)}
              disabled={!puzzle.unlocked || puzzle.solved}
              whileHover={puzzle.unlocked && !puzzle.solved ? { scale: 1.05 } : {}}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all min-w-fit ${
                puzzle.solved
                  ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                  : puzzle.unlocked
                  ? idx === currentPuzzle
                    ? "bg-amber-500/20 border-2 border-amber-500 text-amber-400"
                    : "bg-slate-800 border border-slate-600 text-slate-300 hover:border-amber-500/50"
                  : "bg-slate-800/50 border border-slate-700 text-slate-600"
              }`}
            >
              {puzzle.solved ? (
                <Unlock className="w-4 h-4" />
              ) : puzzle.unlocked ? (
                <Key className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Zagadka {puzzle.id}</span>
            </motion.button>
          ))}
        </div>

        {/* Current Puzzle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPuzzle}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className={`bg-slate-800/80 border-slate-700 backdrop-blur ${shake ? "animate-shake" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    {currentPuzzleData.title}
                  </CardTitle>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500">
                    {currentPuzzleData.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Puzzle Description */}
                <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-600">
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {currentPuzzleData.description}
                  </p>
                </div>

                {/* Hint & Clue Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowHint(!showHint)}
                    variant="outline"
                    className={`flex-1 ${showHint ? "border-yellow-500 text-yellow-400" : "border-slate-600 text-slate-400"}`}
                  >
                    {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHint ? "Ukryj Podpowiedź" : "Pokaż Podpowiedź"} (-25 pts)
                  </Button>
                  <Button
                    onClick={() => setShowClue(!showClue)}
                    variant="outline"
                    className={`flex-1 ${showClue ? "border-amber-500 text-amber-400" : "border-slate-600 text-slate-400"}`}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showClue ? "Ukryj Wskazówkę" : "Pokaż Wskazówkę"} (-25 pts)
                  </Button>
                </div>

                {/* Hint */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="bg-yellow-500/10 border-yellow-500/30">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-300">
                          {currentPuzzleData.hint}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Clue */}
                <AnimatePresence>
                  {showClue && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="bg-amber-500/10 border-amber-500/30">
                        <Key className="w-4 h-4 text-amber-400" />
                        <AlertDescription className="text-amber-300">
                          {currentPuzzleData.clue}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer Input */}
                <div className="space-y-4">
                  <label className="text-slate-300 font-medium">Twoja odpowiedź:</label>
                  <div className="flex gap-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Wpisz rozwiązanie..."
                      className="flex-1 h-12 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 text-lg"
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 px-8"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Attempts Warning */}
                {attempts >= 3 && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <Skull className="w-4 h-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      Już {attempts} nieudanych prób! Rozważ użycie podpowiedzi.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-slate-700 pt-4">
                <span className="text-slate-400 text-sm">
                  Każda błędna próba: -10 pts
                </span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Potencjalne punkty:</span>
                  <span className="font-mono text-amber-400">
                    {Math.max(10, 100 - (showHint ? 25 : 0) - (showClue ? 25 : 0) - attempts * 10)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Field Notes Reference */}
        <Card className="mt-6 bg-amber-900/20 border-amber-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-amber-200 text-sm flex items-center gap-2">
              📋 Notatki Terenowe (Podręczna Ściąga)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3431 - Las Dębina</p>
                <p className="text-slate-400">K. Słupecka, 25.10.2025, 1 osobnik</p>
                <p className="text-slate-500 text-xs">📍 51.7389°N, 19.4612°E</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3432 - Park M. Skłodowskiej-Curie</p>
                <p className="text-slate-400">M. Kowalski, 23.05.2025, 1 osobnik</p>
                <p className="text-slate-500 text-xs">📍 51.7461°N, 19.4536°E</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3433 - Park Jana Pawła II</p>
                <p className="text-slate-400">K. Słupecka, 25.10.2025, 1 osobnik</p>
                <p className="text-slate-500 text-xs">📍 51.7523°N, 19.4287°E</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3434 - Park ul. Powstańców Wlkp.</p>
                <p className="text-slate-400">M. Kowalski, 23.05.2025, 1 osobnik</p>
                <p className="text-slate-500 text-xs">📍 51.7502°N, 19.4401°E</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unlock Animation Overlay */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center">
              {/* Lock icon that transforms to unlocked */}
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{
                  scale: [1, 1.3, 1.1],
                  rotate: [0, -10, 10, -5, 0],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow ring */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 2.5], opacity: [0.8, 0] }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
                  style={{ width: 160, height: 160, top: -40, left: -40 }}
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 3], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl"
                  style={{ width: 200, height: 200, top: -60, left: -60 }}
                />

                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Lock className="w-20 h-20 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="absolute inset-0"
                >
                  <Unlock className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                </motion.div>
              </motion.div>

              {/* Sparks */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 80,
                    y: Math.sin((i * Math.PI * 2) / 8) * 80,
                    scale: [0, 1, 0],
                  }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                  className="absolute w-2 h-2 rounded-full bg-amber-400"
                  style={{ top: '50%', left: '50%' }}
                />
              ))}

              {/* Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-2xl font-bold text-emerald-300"
              >
                🔓 Zamek odblokowany!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-slate-400 mt-2"
              >
                Zagadka {(unlockedPuzzleId ?? 0) + 1} rozwiązana!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
