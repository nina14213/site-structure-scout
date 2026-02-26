import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, CheckCircle, XCircle, AlertTriangle, Dna, FlaskConical } from 'lucide-react';
import { GameState } from '@/hooks/useGameProgress';
import TutorialModal from './TutorialModal';
import { useLanguage } from '@/i18n/LanguageContext';

// --- Data ---

interface SpeciesEntry {
  id: number;
  inputName: string;
  correctName: string;
  kingdom: string;
  errorType: 'typo' | 'synonym' | 'correct' | 'subspecies';
  options?: string[];
  kingdomOptions?: string[];
}

const round1Data: SpeciesEntry[] = [
  {
    id: 1, inputName: 'Ailantus altisima', correctName: 'Ailanthus altissima', kingdom: 'Plantae', errorType: 'typo',
    options: ['Ailanthus altissima', 'Ailanthus glandulosa', 'Ailantus altisima', 'Alanthus altissima'],
  },
  {
    id: 2, inputName: 'Puma concolour', correctName: 'Puma concolor', kingdom: 'Animalia', errorType: 'typo',
    options: ['Puma concolor', 'Puma concolour', 'Panthera concolor', 'Felis concolor'],
  },
  {
    id: 3, inputName: 'Agaricus campester', correctName: 'Agaricus campestris', kingdom: 'Fungi', errorType: 'typo',
    options: ['Agaricus campestris', 'Agaricus campester', 'Agaricus bisporus', 'Amanita campestris'],
  },
  {
    id: 4, inputName: 'Glis glis', correctName: 'Glis glis', kingdom: 'Animalia', errorType: 'correct',
    options: ['Glis glis', 'Myoxus glis', 'Glis italicus', 'Muscardinus glis'],
  },
];

const round2Data: SpeciesEntry[] = [
  {
    id: 5, inputName: 'Hirundo urbica', correctName: 'Delichon urbicum', kingdom: 'Animalia', errorType: 'synonym',
    options: ['Delichon urbicum', 'Hirundo rustica', 'Hirundo urbica', 'Delichon dasypus'],
  },
  {
    id: 6, inputName: 'Quercus pedunculata', correctName: 'Quercus robur', kingdom: 'Plantae', errorType: 'synonym',
    options: ['Quercus robur', 'Quercus petraea', 'Quercus pedunculata', 'Quercus pubescens'],
  },
  {
    id: 7, inputName: 'Ursus arctos arctos', correctName: 'Ursus arctos', kingdom: 'Animalia', errorType: 'subspecies',
    options: ['Ursus arctos', 'Ursus arctos arctos', 'Ursus maritimus', 'Ursus americanus'],
  },
];

const round3Data: SpeciesEntry[] = [
  {
    id: 8, inputName: 'Boletus edulis', correctName: 'Boletus edulis', kingdom: 'Fungi', errorType: 'correct',
    kingdomOptions: ['Animalia', 'Plantae', 'Fungi', 'Bacteria'],
  },
  {
    id: 9, inputName: 'Corvus corax', correctName: 'Corvus corax', kingdom: 'Animalia', errorType: 'correct',
    kingdomOptions: ['Animalia', 'Plantae', 'Fungi', 'Protista'],
  },
  {
    id: 10, inputName: 'Taraxacum officinale', correctName: 'Taraxacum officinale', kingdom: 'Plantae', errorType: 'correct',
    kingdomOptions: ['Animalia', 'Plantae', 'Fungi', 'Bacteria'],
  },
  {
    id: 11, inputName: 'Lactarius deliciosus', correctName: 'Lactarius deliciosus', kingdom: 'Fungi', errorType: 'correct',
    kingdomOptions: ['Animalia', 'Plantae', 'Fungi', 'Protista'],
  },
  {
    id: 12, inputName: 'Salamandra salamandra', correctName: 'Salamandra salamandra', kingdom: 'Animalia', errorType: 'correct',
    kingdomOptions: ['Animalia', 'Plantae', 'Fungi', 'Bacteria'],
  },
];

// --- Component ---

interface SpeciesMatcherProps {
  onComplete: (score: number) => void;
  gameState: GameState;
  addScore?: (points: number, reason?: string) => void;
  playSuccess?: () => void;
  playFail?: () => void;
  playLevelComplete?: () => void;
  startLevelTimer?: () => void;
}

type Round = 1 | 2 | 3;

export default function SpeciesMatcher({
  onComplete, gameState, addScore, playSuccess, playFail, playLevelComplete, startLevelTimer,
}: SpeciesMatcherProps) {
  const { t } = useLanguage();
  const [showTutorial, setShowTutorial] = useState(true);
  const [round, setRound] = useState<Round>(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { chosen: string; correct: boolean }>>({});

  const roundData: Record<Round, SpeciesEntry[]> = { 1: round1Data, 2: round2Data, 3: round3Data };
  const roundTitles: Record<Round, string> = { 1: t('species.round1'), 2: t('species.round2'), 3: t('species.round3') };
  const roundDescs: Record<Round, string> = {
    1: t('species.round1desc'),
    2: t('species.round2desc'),
    3: t('species.round3desc'),
  };

  const currentData = roundData[round];
  const currentEntry = currentData[currentIdx];
  const totalEntries = round1Data.length + round2Data.length + round3Data.length;
  const completedEntries = Object.keys(answers).length;

  useEffect(() => {
    if (!showTutorial) startLevelTimer?.();
  }, [showTutorial, startLevelTimer]);

  const handleAnswer = useCallback((chosen: string) => {
    if (scanning || feedback) return;
    setScanning(true);

    // Simulate scanning
    setTimeout(() => {
      setScanning(false);
      const isRound3 = round === 3;
      const correctValue = isRound3 ? currentEntry.kingdom : currentEntry.correctName;
      const isCorrect = chosen === correctValue;

      setFeedback(isCorrect ? 'correct' : 'wrong');
      setAnswers(prev => ({ ...prev, [currentEntry.id]: { chosen, correct: isCorrect } }));

      let pts = 0;
      if (isCorrect) {
        if (isRound3) pts = 10;
        else if (currentEntry.errorType === 'synonym' || currentEntry.errorType === 'subspecies') pts = 30;
        else pts = 20;
        playSuccess?.();
      } else {
        pts = -5;
        playFail?.();
      }
      setScore(prev => prev + pts);
      addScore?.(pts, isCorrect ? t('species.correctMatch') : t('species.wrongMatch'));

      // Auto-advance after delay
      setTimeout(() => {
        setFeedback(null);
        if (currentIdx < currentData.length - 1) {
          setCurrentIdx(prev => prev + 1);
        } else if (round < 3) {
          setRound(prev => (prev + 1) as Round);
          setCurrentIdx(0);
        } else {
          setFinished(true);
          playLevelComplete?.();
        }
      }, 1200);
    }, 800);
  }, [scanning, feedback, round, currentIdx, currentData, currentEntry, addScore, playSuccess, playFail, playLevelComplete]);

  if (showTutorial) {
    return (
      <TutorialModal
        isOpen={true}
        onClose={() => setShowTutorial(false)}
        levelNumber={4}
      />
    );
  }

  if (finished) {
    const correctCount = Object.values(answers).filter(a => a.correct).length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full">
          <Card className="bg-card/90 border-emerald-300 dark:border-emerald-500/30 backdrop-blur">
            <CardHeader className="text-center">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} className="text-5xl mb-2">
                🧬
              </motion.div>
              <CardTitle className="text-2xl text-foreground">{t('species.completed')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                   <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{score}</div>
                   <div className="text-xs text-muted-foreground">{t('species.points')}</div>
                 </div>
                 <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                   <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{correctCount}/{totalEntries}</div>
                   <div className="text-xs text-muted-foreground">{t('species.correctCount')}</div>
                </div>
              </div>
              <Button
                onClick={() => onComplete(Math.max(0, score))}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {t('species.finishLevel')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const options = round === 3 ? currentEntry.kingdomOptions! : currentEntry.options;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto pt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{roundTitles[round]}</span>
            </div>
             <Badge variant="outline" className="text-cyan-600 dark:text-cyan-400 border-cyan-500/50">
               {t('species.score')}: {score}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{roundDescs[round]}</p>
          <Progress value={(completedEntries / totalEntries) * 100} className="h-2 bg-gray-200 dark:bg-slate-700" />

          {/* GBIF hint box */}
          <details className="mt-3 group">
             <summary className="text-xs text-emerald-400/80 cursor-pointer hover:text-emerald-300 transition-colors flex items-center gap-1">
               <Search className="w-3 h-3" />
               {t('species.howToGBIF')}
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-muted/60 border border-emerald-300 dark:border-emerald-500/20 text-xs text-foreground/80 space-y-1.5">
              <p>
                <strong className="text-emerald-400">1.</strong> Wejdź na{' '}
                <a href="https://www.gbif.org/tools/species-lookup" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
                  GBIF Species Lookup
                </a>{' '}
                — wklej listę nazw i sprawdź dopasowania do Backbone Taxonomy.
              </p>
              <p>
                <strong className="text-emerald-400">2.</strong> Użyj{' '}
                <a href="https://www.gbif.org/species/search" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
                  GBIF Species Search
                </a>{' '}
                — wpisz nazwę gatunku, aby zobaczyć jego status (accepted/synonym), królestwo i pełną hierarchię.
              </p>
              <p>
                <strong className="text-emerald-400">3.</strong> Sprawdź kolumnę <em className="text-amber-400">taxonomicStatus</em> — wartość „ACCEPTED" oznacza aktualną nazwę, „SYNONYM" to synonim przekierowujący do akceptowanej nazwy.
              </p>
            </div>
          </details>
        </motion.div>

        {/* Species Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEntry.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/90 border-border backdrop-blur mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    {round === 3 ? <Dna className="w-5 h-5 text-emerald-400" /> : <Search className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground font-mono italic">{currentEntry.inputName}</CardTitle>
                     <p className="text-xs text-muted-foreground">
                       {round === 3 ? t('species.assignKingdom') : t('species.selectCorrect')}
                     </p>
                  </div>
                  {currentEntry.errorType !== 'correct' && round !== 3 && (
                    <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">
                       <AlertTriangle className="w-3 h-3 mr-1" />
                       {currentEntry.errorType === 'typo' ? t('species.typo') : currentEntry.errorType === 'synonym' ? t('species.synonym') : t('species.subspecies')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Scanning bar */}
                {scanning && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.7 }}
                    className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-4"
                  />
                )}

                {/* Feedback */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                      feedback === 'correct' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    {feedback === 'correct' ? (
                      <>
                         <CheckCircle className="w-5 h-5 text-emerald-500" />
                         <span className="text-emerald-700 dark:text-emerald-300 text-sm">{t('species.correct')}</span>
                      </>
                    ) : (
                      <>
                         <XCircle className="w-5 h-5 text-red-500" />
                         <span className="text-red-700 dark:text-red-300 text-sm">
                           {t('species.wrong')} <span className="font-mono italic">{round === 3 ? currentEntry.kingdom : currentEntry.correctName}</span>
                        </span>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={!scanning && !feedback ? { scale: 1.03 } : {}}
                      whileTap={!scanning && !feedback ? { scale: 0.97 } : {}}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!scanning || !!feedback}
                      className={`p-3 rounded-lg border text-left transition-colors disabled:cursor-not-allowed ${
                        feedback
                          ? opt === (round === 3 ? currentEntry.kingdom : currentEntry.correctName)
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : answers[currentEntry.id]?.chosen === opt && !answers[currentEntry.id]?.correct
                              ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300'
                              : 'border-border bg-muted/30 text-muted-foreground'
                          : 'border-border bg-muted/50 text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <span className={round !== 3 ? 'font-mono italic text-sm' : 'text-sm font-medium'}>{opt}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Round indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(r => (
            <div
              key={r}
                className={`w-3 h-3 rounded-full transition-colors ${
                r === round ? 'bg-emerald-500' : r < round ? 'bg-emerald-700 dark:bg-emerald-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
