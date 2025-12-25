import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, CheckCircle, AlertCircle, Lightbulb, Timer, Zap } from 'lucide-react';
import { sampleEventsCSV, dwcTerms } from './DwCTerms';
import DraggableColumn from './DraggableColumn';
import DropZone from './DropZone';
import QuizModal from './QuizModal';
import TutorialModal from './TutorialModal';
import { useValidator } from '@/hooks/useValidator';
import { GameState } from '@/hooks/useGameProgress';

// Required DwC terms for Event Core
const requiredTerms = ['eventID', 'scientificName', 'decimalLatitude', 'decimalLongitude', 'geodeticDatum', 'countryCode', 'eventDate', 'basisOfRecord'];
const optionalTerms = ['parentEventID', 'eventDate', 'recordedBy', 'organismQuantity', 'organismQuantityType', 'verbatimLocality', 'habitat'];

interface CoreBuilderProps {
    onComplete?: (score: number, data: unknown) => void;
    gameState?: GameState;
    addScore?: (points: number, reason?: string) => void;
    playSuccess?: () => void;
    playFail?: () => void;
    playDrop?: () => void;
    playLevelComplete?: () => void;
    startLevelTimer?: () => void;
}

export default function CoreBuilder({ onComplete, addScore, playSuccess, playFail, playDrop, playLevelComplete, startLevelTimer }: CoreBuilderProps) {
    const { validateField } = useValidator();

    // Parse CSV
    const parseCSV = useCallback((text: string) => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            const row: Record<string, string> = {};
            headers.forEach((header, idx) => {
                row[header] = values?.[idx]?.replace(/"/g, '').trim() || '';
            });
            return row;
        });
        return { headers, data };
    }, []);

    // Auto-load sample data on mount
    const { headers: initialColumns, data: initialData } = parseCSV(sampleEventsCSV);
    
    const [csvData, setCsvData] = useState<Record<string, string>[]>(initialData);
    const [columns, setColumns] = useState<string[]>(initialColumns);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [showHint, setShowHint] = useState(false);
    const [mappingErrors, setMappingErrors] = useState<Record<string, string>>({});

    // Start timer on mount
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

    // Handle mapping
    const handleDrop = useCallback((termName: string, columnName: string) => {
        // Check for restricted mappings
        const restrictions: Record<string, { only: string; error: string }> = {
            'decimalLatitude': { only: 'Latitude', error: 'Error: Latitude column must be mapped to decimalLatitude' },
            'decimalLongitude': { only: 'Longitude', error: 'Error: Longitude column must be mapped to decimalLongitude' },
            'eventID': { only: 'Id', error: 'Error: Id column must be mapped to eventID' },
            'scientificName': { only: 'Specimen', error: 'Error: Specimen column must be mapped to scientificName' }
        };

        if (restrictions[termName] && columnName !== restrictions[termName].only) {
            setMappingErrors(prev => ({ ...prev, [termName]: restrictions[termName].error }));
            playFail?.();
            setTimeout(() => {
                setMappingErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[termName];
                    return newErrors;
                });
            }, 3000);
            return;
        }

        setMappings(prev => {
            const newMappings = { ...prev };
            Object.keys(newMappings).forEach(key => {
                if (newMappings[key] === columnName) delete newMappings[key];
            });
            newMappings[termName] = columnName;
            return newMappings;
        });

        setMappingErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[termName];
            return newErrors;
        });
        playDrop?.();
    }, [playDrop, playFail]);

    // Remove mapping
    const handleRemoveMapping = useCallback((termName: string) => {
        setMappings(prev => {
            const newMappings = { ...prev };
            delete newMappings[termName];
            return newMappings;
        });
    }, []);

    // Get sample values for column
    const getSampleValues = useCallback((columnName: string) => {
        return csvData.slice(0, 3).map(row => row[columnName]).filter(Boolean);
    }, [csvData]);

    // Check if column is mapped
    const getColumnMapping = useCallback((columnName: string) => {
        return Object.entries(mappings).find(([, col]) => col === columnName)?.[0] || null;
    }, [mappings]);

    // Validate mapping
    const validateMapping = useCallback((termName: string): 'valid' | 'warning' | 'error' | null => {
        const columnName = mappings[termName];
        if (!columnName) return null;

        const allValues = csvData.map(row => row[columnName]);
        const errors = allValues.filter(val => {
            const result = validateField(termName, val, allValues);
            return !result.valid;
        });

        if (errors.length === 0) return 'valid';
        if (errors.length < allValues.length / 2) return 'warning';
        return 'error';
    }, [mappings, csvData, validateField]);

    // Calculate progress
    const progress = (requiredTerms.filter(term => mappings[term]).length / requiredTerms.length) * 100;
    const allRequiredMapped = requiredTerms.every(term => mappings[term]);

    // Calculate score
    useEffect(() => {
        let score = 0;
        requiredTerms.forEach(term => {
            if (mappings[term]) score += 20;
            if (validateMapping(term) === 'valid') score += 10;
        });
        optionalTerms.forEach(term => {
            if (mappings[term]) score += 5;
            if (validateMapping(term) === 'valid') score += 5;
        });

        if (timeLeft > 240) score += 50;
        else if (timeLeft > 180) score += 30;
        else if (timeLeft > 60) score += 10;

        setLevelScore(score);
    }, [mappings, validateMapping, timeLeft]);

    // Complete level
    const handleComplete = () => {
        if (!allRequiredMapped) {
            playFail?.();
            return;
        }
        setShowQuiz(true);
    };

    const handleQuizComplete = (quizScore: number) => {
        const finalScore = levelScore + (quizScore * 2);
        addScore?.(finalScore, 'Core Forge Complete!');
        playLevelComplete?.();
        onComplete?.(finalScore, { mappings, csvData, columns });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-yellow-950 dark:to-slate-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                                Mission 1: Core Forge
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">Map CSV columns to Darwin Core terms</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400">
                                {levelScore} pts
                            </Badge>
                        </div>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
                    <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-slate-400">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{requiredTerms.filter(t => mappings[t]).length}/{requiredTerms.length} required</span>
                    </div>
                </motion.div>

                {/* Main Content */}
                {columns.length > 0 && (
                    /* Mapping Interface - Side by Side */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Source Columns */}
                        <Card className="bg-white/90 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur h-full flex flex-col">
                            <CardHeader className="bg-gray-900 dark:bg-slate-900 rounded-t-lg">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-5 h-5" />
                                        CSV Columns ({columns.length})
                                    </span>
                                    <Badge variant="secondary" className="bg-gray-700 text-white">{csvData.length} rows</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 max-h-[60vh] overflow-y-auto space-y-2">
                                <AnimatePresence>
                                    {columns.map((column, idx) => (
                                        <DraggableColumn
                                            key={column}
                                            column={column}
                                            index={idx}
                                            isDragging={draggedColumn === column}
                                            mappedTo={getColumnMapping(column)}
                                            validationStatus={getColumnMapping(column) ? validateMapping(getColumnMapping(column)!) : null}
                                            onDragStart={(col) => setDraggedColumn(col)}
                                            onDragEnd={() => setDraggedColumn(null)}
                                            sampleValues={getSampleValues(column)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Target Terms */}
                        <Card className="bg-white/90 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur h-full flex flex-col">
                            <CardHeader className="bg-gray-900 dark:bg-slate-900 rounded-t-lg">
                                <CardTitle className="text-white flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Darwin Core Terms
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-800">
                                        <Lightbulb className="w-4 h-4 mr-1" />
                                        Hint
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 max-h-[60vh] overflow-y-auto">
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30">
                                                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                                    Drag columns from the left to the appropriate Darwin Core fields. Fields marked <Badge variant="destructive" className="text-xs mx-1">Required</Badge> must be filled to complete the level.
                                                </AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Tabs defaultValue="required" className="w-full">
                                    <TabsList className="w-full bg-gray-100 dark:bg-slate-700/50 mb-4">
                                        <TabsTrigger value="required" className="flex-1">Required ({requiredTerms.length})</TabsTrigger>
                                        <TabsTrigger value="optional" className="flex-1">Optional ({optionalTerms.length})</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="required" className="space-y-3 mt-0">
                                        {requiredTerms.map(term => (
                                            <div key={term}>
                                                <DropZone
                                                    termName={term}
                                                    mappedColumn={mappings[term] || null}
                                                    isRequired={true}
                                                    isValid={validateMapping(term) === 'valid'}
                                                    onDrop={handleDrop}
                                                    onRemove={handleRemoveMapping}
                                                    category={dwcTerms[term]?.category || 'core'}
                                                />
                                                {mappingErrors[term] && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="mt-2"
                                                    >
                                                        <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/50">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <AlertDescription className="text-sm">{mappingErrors[term]}</AlertDescription>
                                                        </Alert>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="optional" className="space-y-3 mt-0">
                                        {optionalTerms.map(term => (
                                            <DropZone
                                                key={term}
                                                termName={term}
                                                mappedColumn={mappings[term] || null}
                                                isRequired={false}
                                                isValid={validateMapping(term) === 'valid' || !mappings[term]}
                                                onDrop={handleDrop}
                                                onRemove={handleRemoveMapping}
                                                category={dwcTerms[term]?.category || 'event'}
                                            />
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                            <CardFooter className="border-t border-gray-200 dark:border-slate-700 pt-4">
                                <Button
                                    onClick={handleComplete}
                                    disabled={!allRequiredMapped}
                                    className={`w-full ${
                                        allRequiredMapped
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                            : 'bg-gray-300 dark:bg-slate-600'
                                    }`}
                                >
                                    {allRequiredMapped ? (
                                        <><CheckCircle className="w-5 h-5 mr-2" /> Complete Core Forge</>
                                    ) : (
                                        <><AlertCircle className="w-5 h-5 mr-2" /> Fill required fields</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* Tutorial Modal */}
                <TutorialModal
                    levelNumber={1}
                    isOpen={showTutorial}
                    onClose={() => setShowTutorial(false)}
                />

                {/* Quiz Modal */}
                {showQuiz && (
                    <QuizModal
                        levelNumber={1}
                        isOpen={showQuiz}
                        onClose={() => setShowQuiz(false)}
                        onComplete={handleQuizComplete}
                        playSuccess={playSuccess}
                        playFail={playFail}
                    />
                )}
            </div>
        </div>
    );
}
