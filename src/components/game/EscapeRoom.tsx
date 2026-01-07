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
    description: "Naukowiec zapisał w notatkach: 'Obserwacja z lasu miejskiego Dębina ma ID równy sumie: rok odkrycia bożonarodzeniowego drzewa (1824) + numer domu przy ul. Polnej 7 + liczba liter w słowie GBIF'",
    hint: "Bożonarodzeniowe drzewo to choinka (Tannenbaum). Rok: 1824, numer domu: 7, GBIF ma 4 litery. Ale to nie ta suma...",
    clue: "Sprawdź notatki terenowe - szukaj 4-cyfrowego kodu zaczynającego się od 34...",
    answer: "3431",
    unlocked: true,
    solved: false,
    category: "eventID",
  },
  {
    id: 2,
    title: "Zagadka Gatunku",
    description: "Drzewo to nazywane jest 'Drzewem Niebios'. Pochodzi z Chin, ma pierzaste liście i nieprzyjemny zapach. Jego łacińska nazwa oznacza dosłownie 'bardzo wysokie drzewo z Moluków'.",
    hint: "Ailanthus pochodzi od malajskiego 'ailanto' (drzewo niebios), a 'altissima' znaczy 'najwyższy'.",
    clue: "Wpisz pełną nazwę łacińską: rodzaj + epitet gatunkowy",
    answer: "Ailanthus altissima",
    unlocked: false,
    solved: false,
    category: "scientificName",
  },
  {
    id: 3,
    title: "Zagadka Obserwatora",
    description: "W szyfrze Cezara przesunięcie wynosi 1. Odszyfruj: 'L. Tmvqfdlb'",
    hint: "Szyfr Cezara przesuwa litery. Przy przesunięciu 1: B→A, C→B, itd.",
    clue: "Rezultat to inicjał + nazwisko obserwatorki z lasu Dębina",
    answer: "K. Słupecka",
    unlocked: false,
    solved: false,
    category: "recordedBy",
  },
  {
    id: 4,
    title: "Zagadka Ilości",
    description: "Ile osobników drzewa Ailanthus altissima zaobserwowano w KAŻDEJ lokalizacji według notatek terenowych? Podaj cyfrę.",
    hint: "Sprawdź pole 'Quantity' w każdej notatce terenowej...",
    clue: "Wszystkie obserwacje mają tę samą liczbę - ile?",
    answer: "1",
    unlocked: false,
    solved: false,
    category: "quantity",
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minut
  const [isComplete, setIsComplete] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

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
      
      // Oblicz punkty
      let puzzleScore = 100;
      if (showHint) puzzleScore -= 25;
      if (showClue) puzzleScore -= 25;
      puzzleScore -= attempts * 10;
      puzzleScore = Math.max(10, puzzleScore);
      
      setScore((prev) => prev + puzzleScore);

      setPuzzleState((prev) => {
        const updated = [...prev];
        updated[currentPuzzle] = { ...updated[currentPuzzle], solved: true };
        
        // Odblokuj następną zagadkę
        if (currentPuzzle + 1 < updated.length) {
          updated[currentPuzzle + 1] = { ...updated[currentPuzzle + 1], unlocked: true };
        }
        
        return updated;
      });

      // Sprawdź czy wszystkie rozwiązane
      const allSolved = puzzleState.filter((p) => p.solved).length === puzzleState.length - 1;
      if (allSolved) {
        setIsComplete(true);
        const timeBonus = Math.floor(timeLeft / 10);
        const finalScore = score + puzzleScore + timeBonus + 200;
        setScore(finalScore);
        addScore?.(finalScore, "Escape Room Complete");
        playLevelComplete?.();
      } else {
        // Przejdź do następnej zagadki
        setCurrentPuzzle((prev) => prev + 1);
        setUserAnswer("");
        setShowHint(false);
        setShowClue(false);
        setAttempts(0);
      }
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
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3432 - Park M. Skłodowskiej-Curie</p>
                <p className="text-slate-400">M. Kowalski, 23.05.2025, 1 osobnik</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3433 - Park Jana Pawła II</p>
                <p className="text-slate-400">K. Słupecka, 25.10.2025, 1 osobnik</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-amber-300 font-medium">Event 3434 - Park ul. Powstańców Wlkp.</p>
                <p className="text-slate-400">M. Kowalski, 23.05.2025, 1 osobnik</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
