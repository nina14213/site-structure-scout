import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, Trophy, ArrowRight } from 'lucide-react';
import { quizQuestionsByLevel, shuffleOptions } from './quizData';

interface QuizModalProps {
    onClose?: () => void;
    onComplete?: (score: number) => void;
    levelNumber?: number;
    isOpen?: boolean;
    playSuccess?: () => void;
    playFail?: () => void;
}

export default function QuizModal({ onClose, onComplete, levelNumber = 1 }: QuizModalProps) {
    const questions = useMemo(() => {
        const raw = quizQuestionsByLevel[levelNumber] || quizQuestionsByLevel[1];
        return raw.map(q => {
            const { options, correctIndex } = shuffleOptions(q.options, q.correctIndex);
            return { ...q, options, correctIndex };
        });
    }, [levelNumber]);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const question = questions[currentQuestion];

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
            return selectedAnswer === index
                ? "border-indigo-500 bg-indigo-500/20"
                : "border-slate-600 hover:border-indigo-400 hover:bg-slate-700/50";
        }
        if (index === question.correctIndex) {
            return "border-emerald-500 bg-emerald-500/20";
        }
        if (index === selectedAnswer && index !== question.correctIndex) {
            return "border-red-500 bg-red-500/20";
        }
        return "border-slate-600 opacity-50";
    };

    const levelNames: Record<number, string> = {
        1: 'Core Forge',
        2: 'Extension Nexus',
        3: 'Package Seal',
        4: 'Validate'
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                <span className="font-semibold">Quiz — {levelNames[levelNumber] || `Poziom ${levelNumber}`}</span>
                            </div>
                            {!isFinished && (
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                    {currentQuestion + 1} / {questions.length}
                                </span>
                            )}
                        </div>
                        {!isFinished && (
                            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
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
                                <h2 className="text-lg font-bold text-white mb-4">
                                    {question.question}
                                </h2>

                                <div className="space-y-3 mb-6">
                                    {question.options.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => handleAnswer(index)}
                                            disabled={isAnswered}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${getOptionClass(index)}`}
                                            whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        >
                                            <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-slate-200">{option}</span>
                                            {isAnswered && index === question.correctIndex && (
                                                <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto shrink-0" />
                                            )}
                                            {isAnswered && index === selectedAnswer && index !== question.correctIndex && (
                                                <XCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl mb-4 ${
                                            selectedAnswer === question.correctIndex
                                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                                : "bg-amber-500/20 border border-amber-500/50"
                                        }`}
                                    >
                                        <p className="text-sm text-slate-300">
                                            <span className="font-semibold text-white">Wyjaśnienie: </span>
                                            {question.explanation}
                                        </p>
                                    </motion.div>
                                )}

                                <Button
                                    onClick={handleNext}
                                    disabled={!isAnswered}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {currentQuestion < questions.length - 1 ? (
                                        <>
                                            Następne pytanie
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    ) : (
                                        "Zobacz wynik"
                                    )}
                                </Button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-4"
                            >
                                <Trophy className="w-20 h-20 text-yellow-500 mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Quiz ukończony!
                                </h2>
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                                    {score} / {questions.length}
                                </p>
                                <p className="text-slate-400 mb-6">
                                    {score === questions.length
                                        ? "Perfekcyjny wynik! 🎉"
                                        : score >= questions.length * 0.7
                                            ? "Świetna robota!"
                                            : "Spróbuj ponownie po przejrzeniu materiału."}
                                </p>
                                <Button
                                    onClick={() => onClose?.()}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Kontynuuj
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
