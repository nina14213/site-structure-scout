import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, Trophy, ArrowRight, SkipForward } from 'lucide-react';
import { getQuizQuestionsByLevel, shuffleOptions } from './quizData';
import { useLanguage } from '@/i18n/LanguageContext';

interface QuizModalProps {
    onClose?: () => void;
    onComplete?: (score: number) => void;
    levelNumber?: number;
    isOpen?: boolean;
    playSuccess?: () => void;
    playFail?: () => void;
}

export default function QuizModal({ onClose, onComplete, levelNumber = 1 }: QuizModalProps) {
    const { t, language } = useLanguage();
    const questions = useMemo(() => {
        const quizQuestionsByLevel = getQuizQuestionsByLevel(language);
        const raw = quizQuestionsByLevel[levelNumber] || quizQuestionsByLevel[1];
        return raw.map(q => {
            const { options, correctIndex } = shuffleOptions(q.options, q.correctIndex);
            return { ...q, options, correctIndex };
        });
    }, [language, levelNumber]);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        window.setTimeout(() => dialogRef.current?.focus(), 0);

        return () => {
            previousFocusRef.current?.focus?.();
        };
    }, []);

    // Escape do zamknięcia quizu (WCAG 2.1.2)
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const question = questions[currentQuestion];

    const levelNames: Record<number, string> = {
        1: t('level.1.name'),
        2: t('level.2.name'),
        3: t('level.3.name'),
        4: t('level.4.name'),
        5: t('level.5.name'),
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        if (index === question.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
            const finalScore = Math.round((score / questions.length) * 100);
            onComplete?.(finalScore);
        }
    };

    const getOptionClass = (index: number) => {
        if (!isAnswered) {
            return 'border-border bg-muted/50 hover:border-indigo-400 hover:bg-indigo-500/10 text-foreground';
        }
        if (index === question.correctIndex) {
            return 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
        }
        if (index === selectedAnswer) {
            return 'border-red-500 bg-red-500/20 text-red-700 dark:text-red-300';
        }
        return 'border-border bg-muted/30 opacity-50 text-muted-foreground';
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-card rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-border"
                    ref={dialogRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="quiz-title"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" aria-hidden="true" />
                                <span id="quiz-title" className="font-semibold">{t('quiz.title')} — {levelNames[levelNumber] || `Level ${levelNumber}`}</span>
                            </div>
                            {!isFinished && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                        {currentQuestion + 1} / {questions.length}
                                    </span>
                                    <Button
                                        data-demo-id="quiz-skip"
                                        variant="ghost"
                                        size="sm"
                                        aria-label={t('quiz.skip')}
                                        onClick={() => {
                                            setIsFinished(true);
                                            const finalScore = Math.round((score / questions.length) * 100);
                                            onComplete?.(finalScore);
                                        }}
                                        className="text-white/70 hover:text-white hover:bg-white/20 text-xs gap-1 h-7 px-2"
                                    >
                                        {t('quiz.skip')}
                                        <SkipForward className="w-3 h-3" aria-hidden="true" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {!isFinished && (
                            <div
                                className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={questions.length}
                                aria-valuenow={currentQuestion + 1}
                                aria-label={`${currentQuestion + 1} / ${questions.length}`}
                            >
                                <motion.div
                                    className="h-full bg-white/80"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        {!isFinished ? (
                            <>
                                <h2 className="text-lg font-bold text-foreground mb-4">
                                    {question.question}
                                </h2>

                                <div className="space-y-3 mb-6" role="group" aria-label={question.question}>
                                    {question.options.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            type="button"
                                            data-demo-id={index === question.correctIndex ? "quiz-correct-option" : `quiz-option-${index}`}
                                            onClick={() => handleAnswer(index)}
                                            disabled={isAnswered}
                                            aria-pressed={selectedAnswer === index}
                                            aria-describedby={isAnswered ? "quiz-feedback" : undefined}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${getOptionClass(index)}`}
                                            whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        >
                                            <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span>{option}</span>
                                            {isAnswered && index === question.correctIndex && (
                                                <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0" aria-hidden="true" />
                                            )}
                                            {isAnswered && index === selectedAnswer && index !== question.correctIndex && (
                                                <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" aria-hidden="true" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {isAnswered && (
                                    <motion.div
                                        id="quiz-feedback"
                                        role="status"
                                        aria-live="polite"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl mb-4 ${
                                            selectedAnswer === question.correctIndex
                                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                                : "bg-amber-500/20 border border-amber-500/50"
                                        }`}
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">{t('quiz.explanation')} </span>
                                            {question.explanation}
                                        </p>
                                    </motion.div>
                                )}

                                <Button
                                    data-demo-id="quiz-next"
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
                                >
                                    {currentQuestion < questions.length - 1 ? (
                                        <>
                                            {t('quiz.nextQuestion')}
                                            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                                        </>
                                    ) : (
                                        t('quiz.seeResult')
                                    )}
                                </Button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-4"
                            >
                                <Trophy className="w-20 h-20 text-yellow-500 mb-4" aria-hidden="true" />
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    {t('quiz.completed')}
                                </h2>
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 mb-2">
                                    {score} / {questions.length}
                                </p>
                                <p className="text-muted-foreground mb-6">
                                    {score === questions.length
                                        ? t('quiz.perfect')
                                        : score >= questions.length * 0.7
                                            ? t('quiz.great')
                                            : t('quiz.tryAgain')}
                                </p>
                                <Button
                                    data-demo-id="quiz-continue"
                                    onClick={() => onClose?.()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {t('quiz.continue')}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
