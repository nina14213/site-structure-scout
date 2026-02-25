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
  MapPin,
  Calendar,
  User,
  Hash,
  Globe,
  Search,
  Compass,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { GameState } from "@/hooks/useGameProgress";
import { useLanguage } from "@/i18n/LanguageContext";

interface Puzzle {
  id: number;
  title: string;
  description: string;
  hint: string;
  clue: string;
  answer: string;
  unlocked: boolean;
  solved: boolean;
  category: "eventID" | "scientificName" | "recordedBy" | "quantity" | "coordinates" | "date" | "geodetic";
  difficulty: 1 | 2 | 3;
  icon: string;
}

const categoryConfig: Record<string, { color: string; bgColor: string; borderColor: string; glowColor: string; label: string }> = {
  eventID: { color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", glowColor: "shadow-amber-500/20", label: "Identyfikacja" },
  scientificName: { color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", glowColor: "shadow-emerald-500/20", label: "Taksonomia" },
  recordedBy: { color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", glowColor: "shadow-blue-500/20", label: "Obserwator" },
  quantity: { color: "text-pink-400", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30", glowColor: "shadow-pink-500/20", label: "Zliczanie" },
  coordinates: { color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30", glowColor: "shadow-cyan-500/20", label: "Współrzędne" },
  date: { color: "text-violet-400", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/30", glowColor: "shadow-violet-500/20", label: "Data" },
  geodetic: { color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", glowColor: "shadow-orange-500/20", label: "Geodezja" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  eventID: <Hash className="w-5 h-5" />,
  scientificName: <Search className="w-5 h-5" />,
  recordedBy: <User className="w-5 h-5" />,
  quantity: <Star className="w-5 h-5" />,
  coordinates: <MapPin className="w-5 h-5" />,
  date: <Calendar className="w-5 h-5" />,
  geodetic: <Globe className="w-5 h-5" />,
};

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
    difficulty: 1,
    icon: "🔍",
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
    difficulty: 3,
    icon: "🧬",
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
    category: "coordinates",
    difficulty: 2,
    icon: "📍",
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
    category: "date",
    difficulty: 1,
    icon: "📅",
  },
  {
    id: 5,
    title: "Zagadka Obserwatora",
    description: "Rozszyfruj zakodowane nazwisko używając szyfru Cezara z przesunięciem 1 (każda litera zamieniona na poprzednią w alfabecie): 'K. Lpxbmtlj'. Kto wykonał obserwację? Uwaga: tego nazwiska nie znajdziesz w notatkach terenowych!",
    hint: "Przesunięcie 1 oznacza: K→J, L→K, p→o, x→w, b→a, m→l, t→s, l→k, j→i",
    clue: "Wynik to inicjał imienia + nazwisko w formacie: X. Xxxxxxxx",
    answer: "J. Kowalski",
    unlocked: false,
    solved: false,
    category: "recordedBy",
    difficulty: 2,
    icon: "🕵️",
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
    category: "coordinates",
    difficulty: 2,
    icon: "🧭",
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
    difficulty: 1,
    icon: "🔢",
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
    category: "geodetic",
    difficulty: 3,
    icon: "🌍",
  },
];

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [0, -60, -120],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
    className="absolute rounded-full bg-amber-400/30 blur-sm pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
  />
);

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
  const { t } = useLanguage();
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
  const [showFieldNotes, setShowFieldNotes] = useState(false);

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

  const normalizeAnswer = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.\s*/g, '. ').replace(/\s*\.\s*/g, '. ').trimEnd();

  const handleSubmit = useCallback(() => {
    const puzzle = puzzleState[currentPuzzle];
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(puzzle.answer);

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

  const DifficultyStars = ({ level }: { level: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= level ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
        />
      ))}
    </div>
  );

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Celebration particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -200 - Math.random() * 300],
              x: [0, (Math.random() - 0.5) * 400],
            }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              left: `${Math.random() * 100}%`,
              bottom: 0,
              background: ['#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#22d3ee'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4 font-display">{t('escape.completed')}</h1>
          <p className="text-emerald-300 text-xl mb-2">{t('escape.allPuzzlesSolved')}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white text-5xl font-mono font-bold mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
          >
            {score} pts
          </motion.p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleComplete} size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-5 h-5 mr-2" />
              {t('escape.finishMission')}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="border-slate-500 hover:border-white">
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('escape.playAgain')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentPuzzleData = puzzleState[currentPuzzle];
  const catConfig = categoryConfig[currentPuzzleData.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-6 relative overflow-hidden">
      {/* Animated background particles */}
      {[...Array(12)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 1.5}
          duration={4 + Math.random() * 3}
          x={`${10 + Math.random() * 80}%`}
          y={`${30 + Math.random() * 60}%`}
          size={3 + Math.random() * 5}
        />
      ))}

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-display">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Key className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                </motion.div>
                {t('escape.title')}
              </h1>
              <p className="text-slate-400 mt-1">
                {t('escape.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white">
                {t('escape.back')}
              </Button>
              <motion.div
                animate={timeLeft < 60 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  timeLeft < 60
                    ? "bg-red-500/20 text-red-400 border-red-500/50"
                    : timeLeft < 180
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-slate-800/80 text-slate-300 border-slate-600"
                }`}
              >
                <Timer className={`w-5 h-5 ${timeLeft < 60 ? "animate-pulse" : ""}`} />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
              </motion.div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-lg font-bold text-amber-400">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress bar with glow */}
          <div className="relative">
            <Progress value={progress} className="h-3 bg-slate-700/50" />
            {progress > 0 && (
              <motion.div
                className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
          <div className="flex justify-between text-sm mt-2 text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {solvedCount}/{puzzleState.length} {t('escape.puzzlesSolved')}
            </span>
            <span>{attempts > 0 ? t('escape.attemptsInPuzzle', { count: attempts }) : t('escape.readyToSolve')}</span>
          </div>
        </motion.div>

        {/* Puzzle Progress — visual timeline */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {puzzleState.map((puzzle, idx) => {
            const pCat = categoryConfig[puzzle.category];
            return (
              <motion.button
                key={puzzle.id}
                onClick={() => puzzle.unlocked && !puzzle.solved && setCurrentPuzzle(idx)}
                disabled={!puzzle.unlocked || puzzle.solved}
                whileHover={puzzle.unlocked && !puzzle.solved ? { scale: 1.08, y: -2 } : {}}
                whileTap={puzzle.unlocked && !puzzle.solved ? { scale: 0.95 } : {}}
                className={`relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all min-w-[72px] ${
                  puzzle.solved
                    ? "bg-emerald-500/20 border-2 border-emerald-500/60"
                    : puzzle.unlocked
                    ? idx === currentPuzzle
                      ? `${pCat.bgColor} border-2 ${pCat.borderColor} shadow-lg ${pCat.glowColor}`
                      : "bg-slate-800/60 border border-slate-600 hover:border-amber-500/50"
                    : "bg-slate-800/30 border border-slate-700/50"
                }`}
              >
                <span className="text-lg">
                  {puzzle.solved ? "✅" : puzzle.unlocked ? puzzle.icon : "🔒"}
                </span>
                <span className={`text-[10px] font-bold ${
                  puzzle.solved ? "text-emerald-400" : puzzle.unlocked ? pCat.color : "text-slate-600"
                }`}>
                  {puzzle.id}
                </span>
                {/* Connector line */}
                {idx < puzzleState.length - 1 && (
                  <div className={`absolute -right-1 top-1/2 w-1.5 h-0.5 ${
                    puzzle.solved ? "bg-emerald-500" : "bg-slate-700"
                  }`} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Current Puzzle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPuzzle}
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`bg-slate-800/80 border-slate-700 backdrop-blur-lg overflow-hidden ${shake ? "animate-shake" : ""}`}>
              {/* Colored top accent bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${
                currentPuzzleData.category === "eventID" ? "from-amber-500 to-yellow-400" :
                currentPuzzleData.category === "scientificName" ? "from-emerald-500 to-green-400" :
                currentPuzzleData.category === "recordedBy" ? "from-blue-500 to-cyan-400" :
                currentPuzzleData.category === "quantity" ? "from-pink-500 to-rose-400" :
                currentPuzzleData.category === "coordinates" ? "from-cyan-500 to-teal-400" :
                currentPuzzleData.category === "date" ? "from-violet-500 to-purple-400" :
                "from-orange-500 to-amber-400"
              }`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    <span className="text-2xl">{currentPuzzleData.icon}</span>
                    <div>
                      <div className="text-lg">{currentPuzzleData.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <DifficultyStars level={currentPuzzleData.difficulty} />
                        <span className="text-xs text-slate-500">
                          {currentPuzzleData.difficulty === 1 ? t('escape.easy') : currentPuzzleData.difficulty === 2 ? t('escape.medium') : t('escape.hard')}
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                  <Badge className={`${catConfig.bgColor} ${catConfig.color} ${catConfig.borderColor} border flex items-center gap-1.5`}>
                    {categoryIcons[currentPuzzleData.category]}
                    {catConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Puzzle Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-xl p-5 border ${catConfig.borderColor} ${catConfig.bgColor}`}
                >
                  <p className="text-slate-200 text-base leading-relaxed">
                    {currentPuzzleData.description}
                  </p>
                </motion.div>

                {/* Hint & Clue Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowHint(!showHint)}
                    variant="outline"
                    size="sm"
                    className={`flex-1 rounded-xl transition-all ${showHint ? "border-yellow-500 text-yellow-400 bg-yellow-500/10" : "border-slate-600 text-slate-400 hover:border-yellow-500/50"}`}
                  >
                    {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHint ? t('escape.hide') : t('escape.hint')}
                    <span className="ml-1 text-xs opacity-60">-25</span>
                  </Button>
                  <Button
                    onClick={() => setShowClue(!showClue)}
                    variant="outline"
                    size="sm"
                    className={`flex-1 rounded-xl transition-all ${showClue ? "border-amber-500 text-amber-400 bg-amber-500/10" : "border-slate-600 text-slate-400 hover:border-amber-500/50"}`}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showClue ? t('escape.hide') : t('escape.clue')}
                    <span className="ml-1 text-xs opacity-60">-25</span>
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
                      <Alert className="bg-yellow-500/10 border-yellow-500/30 rounded-xl">
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
                      <Alert className="bg-amber-500/10 border-amber-500/30 rounded-xl">
                        <Key className="w-4 h-4 text-amber-400" />
                        <AlertDescription className="text-amber-300">
                          {currentPuzzleData.clue}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer Input */}
                <div className="space-y-3">
                  <label className="text-slate-300 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                    {t('escape.yourAnswer')}
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder={t('escape.enterSolution')}
                        className="h-12 bg-slate-900/80 border-slate-600 text-white placeholder:text-slate-500 text-lg rounded-xl pr-12 focus:border-amber-500 focus:ring-amber-500/20"
                      />
                      {userAnswer && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400/50" />
                        </motion.div>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      size="lg"
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl px-8 shadow-lg shadow-amber-500/20 disabled:opacity-30"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Attempts Warning */}
                <AnimatePresence>
                  {attempts >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert className="bg-red-500/10 border-red-500/30 rounded-xl">
                        <Skull className="w-4 h-4 text-red-400" />
                        <AlertDescription className="text-red-300">
                          {t('escape.tooManyAttempts', { count: attempts })}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-slate-700/50 pt-4">
                <span className="text-slate-500 text-xs">
                  {t('escape.wrongAttemptPenalty')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{t('escape.potential')}</span>
                  <motion.span
                    key={`${showHint}-${showClue}-${attempts}`}
                    initial={{ scale: 1.3, color: "#f59e0b" }}
                    animate={{ scale: 1, color: "#d4d4d8" }}
                    className="font-mono font-bold text-sm"
                  >
                    {Math.max(10, 100 - (showHint ? 25 : 0) - (showClue ? 25 : 0) - attempts * 10)} pts
                  </motion.span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Field Notes Toggle */}
        <motion.div className="mt-6" layout>
          <Button
            onClick={() => setShowFieldNotes(!showFieldNotes)}
            variant="outline"
            className="w-full border-amber-700/50 bg-amber-900/10 text-amber-300 hover:bg-amber-900/30 hover:border-amber-600 rounded-xl"
          >
            <span className="mr-2">📋</span>
            {t('escape.fieldNotes')}
            <motion.span
              animate={{ rotate: showFieldNotes ? 180 : 0 }}
              className="ml-2"
            >
              ▼
            </motion.span>
          </Button>

          <AnimatePresence>
            {showFieldNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mt-3 bg-amber-950/30 border-amber-800/40 backdrop-blur rounded-xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-200 text-sm flex items-center gap-2">
                      📋 Notatki Terenowe — Ailanthus altissima (Poznań, 2025)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {[
                        { id: "3431", name: "Las Dębina", observer: "K. Słupecka", date: "25.10.2025", coords: "51.7389°N, 19.4612°E" },
                        { id: "3432", name: "Park M. Skłodowskiej-Curie", observer: "M. Kowalski", date: "23.05.2025", coords: "51.7461°N, 19.4536°E" },
                        { id: "3433", name: "Park Jana Pawła II", observer: "K. Słupecka", date: "25.10.2025", coords: "51.7523°N, 19.4287°E" },
                        { id: "3434", name: "Park ul. Powstańców Wlkp.", observer: "M. Kowalski", date: "23.05.2025", coords: "51.7502°N, 19.4401°E" },
                      ].map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-800/60 p-3 rounded-lg border border-amber-800/20 hover:border-amber-600/40 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-amber-300 font-bold flex items-center gap-1.5">
                              <Hash className="w-3 h-3 opacity-60" />
                              {note.id}
                            </p>
                            <span className="text-slate-500 text-xs">1 {t('escape.individual')}</span>
                          </div>
                          <p className="text-slate-300 font-medium text-xs mb-1">{note.name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {note.observer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {note.date}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[10px] mt-1 flex items-center gap-1 group-hover:text-cyan-400/60 transition-colors">
                            <MapPin className="w-3 h-3" /> {note.coords}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Unlock Animation Overlay */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{
                  scale: [1, 1.3, 1.1],
                  rotate: [0, -10, 10, -5, 0],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow rings */}
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
                  <Lock className="w-20 h-20 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="absolute inset-0"
                >
                  <Unlock className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]" />
                </motion.div>
              </motion.div>

              {/* Sparks */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 100,
                    y: Math.sin((i * Math.PI * 2) / 12) * 100,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.04 }}
                  className="absolute rounded-full"
                  style={{
                    top: '50%', left: '50%',
                    width: 4 + Math.random() * 4,
                    height: 4 + Math.random() * 4,
                    background: i % 2 === 0 ? '#fbbf24' : '#34d399',
                  }}
                />
              ))}

              {/* Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-2xl font-bold text-emerald-300 font-display"
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
