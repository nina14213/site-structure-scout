import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Timer, CheckCircle, XCircle, Loader2, Zap, Trophy } from 'lucide-react';
import QuizModal from './QuizModal';
import TutorialModal from './TutorialModal';
import { GameState } from '@/hooks/useGameProgress';

interface ValidationStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    message?: string;
}

interface ValidatorProps {
    onComplete?: (score: number, data: unknown) => void;
    gameState?: GameState;
    addScore?: (points: number, reason?: string) => void;
    playSuccess?: () => void;
    playFail?: () => void;
    playLevelComplete?: () => void;
    startLevelTimer?: () => void;
}

export default function Validator({ onComplete, addScore, playSuccess, playFail, playLevelComplete, startLevelTimer }: ValidatorProps) {
    const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
        { id: 'utf8', name: 'UTF-8 Encoding', description: 'Check file encoding', status: 'pending' },
        { id: 'required', name: 'Required Fields', description: 'Validate required DwC terms', status: 'pending' },
        { id: 'ids', name: 'Unique IDs', description: 'Check ID uniqueness', status: 'pending' },
        { id: 'dates', name: 'Date Format', description: 'Validate ISO 8601 dates', status: 'pending' },
        { id: 'coords', name: 'Coordinates', description: 'Check lat/long values', status: 'pending' },
        { id: 'integrity', name: 'Referential Integrity', description: 'Verify foreign key links', status: 'pending' },
    ]);
    const [isValidating, setIsValidating] = useState(false);
    const [validationComplete, setValidationComplete] = useState(false);
    const [allPassed, setAllPassed] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    useEffect(() => {
        startLevelTimer?.();
    }, [startLevelTimer]);

    // Timer countdown
    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerRunning, timeLeft]);

    const runValidation = useCallback(async () => {
        setIsValidating(true);
        setValidationComplete(false);
        let score = 0;
        let passed = true;

        for (let i = 0; i < validationSteps.length; i++) {
            // Set current step to running
            setValidationSteps(prev => prev.map((step, idx) => 
                idx === i ? { ...step, status: 'running' } : step
            ));

            // Simulate validation delay
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

            // Simulate validation result (90% pass rate for demo)
            const passes = Math.random() > 0.1;
            
            setValidationSteps(prev => prev.map((step, idx) => 
                idx === i ? { 
                    ...step, 
                    status: passes ? 'passed' : 'failed',
                    message: passes ? 'Validation passed' : 'Validation failed - check data'
                } : step
            ));

            if (passes) {
                score += 50;
                playSuccess?.();
            } else {
                passed = false;
                playFail?.();
            }
        }

        setLevelScore(score);
        setValidationComplete(true);
        setAllPassed(passed);
        setIsValidating(false);

        if (passed) {
            score += 200; // Bonus for perfect validation
            setLevelScore(score);
        }
    }, [validationSteps.length, playSuccess, playFail]);

    const resetValidation = () => {
        setValidationSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));
        setValidationComplete(false);
        setAllPassed(false);
        setLevelScore(0);
    };

    const progress = (validationSteps.filter(s => s.status === 'passed' || s.status === 'failed').length / validationSteps.length) * 100;

    const handleComplete = () => {
        if (!allPassed) return;
        setShowQuiz(true);
    };

    const handleQuizComplete = (quizScore: number) => {
        const finalScore = levelScore + (quizScore * 2);
        addScore?.(finalScore, 'BOSS Defeated!');
        playLevelComplete?.();
        onComplete?.(finalScore, { validationSteps, allPassed });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStepIcon = (status: ValidationStep['status']) => {
        switch (status) {
            case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-red-950 dark:to-slate-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Shield className="w-8 h-8 text-red-500 dark:text-red-400" />
                                BOSS: Chaos Validator
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">
                                Defeat the validator by passing all checks!
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-red-400 text-red-600 dark:border-red-500 dark:text-red-400">
                                {levelScore} pts
                            </Badge>
                        </div>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
                </motion.div>

                {/* Boss Visual */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ 
                            scale: isValidating ? [1, 1.1, 1] : 1,
                            rotate: allPassed ? 0 : isValidating ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ duration: 0.5, repeat: isValidating ? Infinity : 0 }}
                        className="inline-block"
                    >
                        <span className="text-8xl">
                            {allPassed ? '😵' : isValidating ? '😈' : '👹'}
                        </span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                        {allPassed ? 'DEFEATED!' : isValidating ? 'Validating...' : 'CHAOS VALIDATOR'}
                    </h2>
                </motion.div>

                {/* Validation Steps */}
                <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Validation Checks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <AnimatePresence>
                            {validationSteps.map((step, idx) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                                        step.status === 'passed' ? 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30' :
                                        step.status === 'failed' ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' :
                                        step.status === 'running' ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' :
                                        'bg-gray-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600'
                                    }`}
                                >
                                    {getStepIcon(step.status)}
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">{step.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">{step.description}</div>
                                        {step.message && (
                                            <div className={`text-xs mt-1 ${step.status === 'passed' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {step.message}
                                            </div>
                                        )}
                                    </div>
                                    {step.status === 'passed' && (
                                        <Badge className="bg-green-500 text-white">+50 pts</Badge>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex gap-4">
                        {!validationComplete ? (
                            <Button
                                onClick={runValidation}
                                disabled={isValidating}
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                size="lg"
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Running Validation...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Run GBIF Validation
                                    </>
                                )}
                            </Button>
                        ) : allPassed ? (
                            <Button
                                onClick={handleComplete}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                Claim Victory!
                            </Button>
                        ) : (
                            <Button
                                onClick={resetValidation}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                size="lg"
                            >
                                Try Again
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Victory Alert */}
                {allPassed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Alert className="bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30">
                            <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-800 dark:text-green-300 text-lg font-semibold">
                                Congratulations! You defeated the Chaos Validator! 🎉
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Modals */}
                {showQuiz && (
                    <QuizModal
                        onComplete={handleQuizComplete}
                        onClose={() => setShowQuiz(false)}
                    />
                )}

                {showTutorial && (
                    <TutorialModal
                        levelNumber={4}
                        isOpen={showTutorial}
                        onClose={() => setShowTutorial(false)}
                    />
                )}
            </div>
        </div>
    );
}
