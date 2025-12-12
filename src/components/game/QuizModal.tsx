import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { HelpCircle, Trophy } from 'lucide-react';

interface QuizModalProps {
    onClose?: () => void;
    onComplete?: (score: number) => void;
    levelNumber?: number;
    isOpen?: boolean;
    playSuccess?: () => void;
    playFail?: () => void;
}

export default function QuizModal({ onClose, onComplete }: QuizModalProps) {
    const [isFinished, setIsFinished] = useState(false);

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
                                <span className="font-semibold">Quiz</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {!isFinished ? (
                            <>
                                <h2 className="text-lg font-bold text-white mb-4">
                                    Sample Question
                                </h2>
                                <p className="text-slate-300 mb-6">
                                    Quiz functionality coming soon...
                                </p>
                                <Button
                                    onClick={() => {
                                        setIsFinished(true);
                                        onComplete?.(75);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Skip Quiz
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Quiz Complete!
                                </h2>
                                <Button
                                    onClick={() => onClose?.()}
                                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Zamknij
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
