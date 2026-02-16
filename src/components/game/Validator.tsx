import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Timer, CheckCircle, XCircle, Loader2, Zap, Trophy, Edit, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TutorialModal from './TutorialModal';
import { GameState } from '@/hooks/useGameProgress';
import bossDefeatedIcon from '@/assets/boss-defeated-x.png';

interface ValidationStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    message?: string;
    fieldIndex?: number;
}

interface DataRecord {
    id: string;
    occurrenceID: string;
    eventID: string;
    scientificName: string;
    eventDate: string;
    decimalLatitude: string;
    decimalLongitude: string;
}

// Sample data with intentional errors for user to fix - wrong fields are empty so user must fill them
const initialDataRecords: DataRecord[] = [
    { id: '1', occurrenceID: 'OCC001', eventID: '3431', scientificName: 'Ailanthus altissima', eventDate: '2025-10-25', decimalLatitude: '52.369327', decimalLongitude: '16.925402' },
    { id: '2', occurrenceID: 'OCC002', eventID: '3432', scientificName: 'Ailanthus altissima', eventDate: '', decimalLatitude: '52.3935', decimalLongitude: '16.9187' }, // Empty date - user must enter correct format
    { id: '3', occurrenceID: '', eventID: '3433', scientificName: 'Ailanthus altissima', eventDate: '2025-10-25', decimalLatitude: '52.39006', decimalLongitude: '16.92480' }, // Empty ID - user must enter unique ID
    { id: '4', occurrenceID: 'OCC004', eventID: '', scientificName: 'Ailanthus altissima', eventDate: '2025-05-23', decimalLatitude: '52.4038', decimalLongitude: '16.9175' }, // Empty eventID - user must select valid one
];

const validEventIDs = ['3431', '3432', '3433', '3434'];

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
    const [dataRecords, setDataRecords] = useState<DataRecord[]>(initialDataRecords);
    const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
        { id: 'utf8', name: 'UTF-8 Encoding', description: 'Sprawdzanie kodowania pliku', status: 'pending' },
        { id: 'required', name: 'Wymagane pola', description: 'Walidacja wymaganych pól DwC', status: 'pending' },
        { id: 'ids', name: 'Unikalne ID', description: 'Sprawdzanie unikalności ID', status: 'pending' },
        { id: 'dates', name: 'Format daty', description: 'Walidacja dat ISO 8601 (YYYY-MM-DD)', status: 'pending' },
        { id: 'coords', name: 'Współrzędne', description: 'Sprawdzanie wartości lat/long', status: 'pending' },
        { id: 'integrity', name: 'Integralność', description: 'Weryfikacja kluczy obcych (eventID)', status: 'pending' },
    ]);
    const [isValidating, setIsValidating] = useState(false);
    const [validationComplete, setValidationComplete] = useState(false);
    const [allPassed, setAllPassed] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [showDataEditor, setShowDataEditor] = useState(false);
    const [errorDetails, setErrorDetails] = useState<Array<{ rowId: string; field: string; message: string }>>([]);

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

    const validateData = useCallback(() => {
        const errors: Array<{ rowId: string; field: string; message: string }> = [];
        
        // Check for empty or duplicate IDs
        dataRecords.forEach(record => {
            if (!record.occurrenceID || record.occurrenceID.trim() === '') {
                errors.push({ rowId: record.id, field: 'occurrenceID', message: 'Brak ID - wpisz unikalny identyfikator' });
            }
        });
        
        const ids = dataRecords.map(r => r.occurrenceID).filter(id => id && id.trim() !== '');
        const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
        duplicates.forEach(dupId => {
            const record = dataRecords.find(r => r.occurrenceID === dupId);
            if (record) {
                errors.push({ rowId: record.id, field: 'occurrenceID', message: 'Duplikat ID' });
            }
        });

        // Check date format (ISO 8601: YYYY-MM-DD)
        dataRecords.forEach(record => {
            if (!record.eventDate || record.eventDate.trim() === '') {
                errors.push({ rowId: record.id, field: 'eventDate', message: 'Brak daty - wpisz w formacie YYYY-MM-DD' });
            } else {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(record.eventDate)) {
                    errors.push({ rowId: record.id, field: 'eventDate', message: 'Nieprawidłowy format daty (wymagany: YYYY-MM-DD)' });
                }
            }
        });

        // Check eventID integrity
        dataRecords.forEach(record => {
            if (!record.eventID || record.eventID.trim() === '') {
                errors.push({ rowId: record.id, field: 'eventID', message: 'Brak eventID - wybierz z listy' });
            } else if (!validEventIDs.includes(record.eventID)) {
                errors.push({ rowId: record.id, field: 'eventID', message: 'Nieprawidłowy eventID' });
            }
        });

        return errors;
    }, [dataRecords]);

    const runValidation = useCallback(async () => {
        setIsValidating(true);
        setValidationComplete(false);
        setErrorDetails([]);
        let score = 0;

        // Reset all steps to pending
        setValidationSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

        const errors = validateData();

        for (let i = 0; i < validationSteps.length; i++) {
            // Set current step to running
            setValidationSteps(prev => prev.map((step, idx) => 
                idx === i ? { ...step, status: 'running' } : step
            ));

            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));

            let stepPassed = true;
            let stepMessage = 'Walidacja przeszła pomyślnie';

            // Check specific validation for each step
            if (validationSteps[i].id === 'ids') {
                const idErrors = errors.filter(e => e.field === 'occurrenceID');
                if (idErrors.length > 0) {
                    stepPassed = false;
                    stepMessage = `Znaleziono ${idErrors.length} duplikat(ów) ID`;
                }
            } else if (validationSteps[i].id === 'dates') {
                const dateErrors = errors.filter(e => e.field === 'eventDate');
                if (dateErrors.length > 0) {
                    stepPassed = false;
                    stepMessage = `Znaleziono ${dateErrors.length} błąd(ów) formatu daty`;
                }
            } else if (validationSteps[i].id === 'integrity') {
                const integrityErrors = errors.filter(e => e.field === 'eventID');
                if (integrityErrors.length > 0) {
                    stepPassed = false;
                    stepMessage = `Znaleziono ${integrityErrors.length} nieprawidłowy(ch) eventID`;
                }
            }

            setValidationSteps(prev => prev.map((step, idx) => 
                idx === i ? { 
                    ...step, 
                    status: stepPassed ? 'passed' : 'failed',
                    message: stepMessage
                } : step
            ));

            if (stepPassed) {
                score += 50;
                playSuccess?.();
            } else {
                playFail?.();
            }
        }

        setErrorDetails(errors);
        setLevelScore(score);
        setValidationComplete(true);
        setAllPassed(errors.length === 0);
        setIsValidating(false);

        if (errors.length === 0) {
            score += 200;
            setLevelScore(score);
        } else {
            setShowDataEditor(true);
        }
    }, [validationSteps, validateData, playSuccess, playFail]);

    const updateRecord = (id: string, field: keyof DataRecord, value: string) => {
        setDataRecords(prev => prev.map(record => 
            record.id === id ? { ...record, [field]: value } : record
        ));
    };

    const resetValidation = () => {
        setValidationSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));
        setValidationComplete(false);
        setAllPassed(false);
        setErrorDetails([]);
    };

    const progress = (validationSteps.filter(s => s.status === 'passed' || s.status === 'failed').length / validationSteps.length) * 100;

    const handleComplete = () => {
        if (!allPassed) return;
        const finalScore = levelScore;
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

    const hasError = (rowId: string, field: string) => {
        return errorDetails.some(e => e.rowId === rowId && e.field === field);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-red-950 dark:to-slate-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
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
                                Popraw błędy w danych i przejdź walidację!
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
                    className="text-center mb-6"
                >
                    <motion.div
                        animate={{ 
                            scale: isValidating ? [1, 1.1, 1] : 1,
                            rotate: allPassed ? 0 : isValidating ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ duration: 0.5, repeat: isValidating ? Infinity : 0 }}
                    >
                        {allPassed ? (
                            <motion.span 
                                className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                Victory!
                            </motion.span>
                        ) : (
                            <span className="text-7xl">👹</span>
                        )}
                    </motion.div>
                </motion.div>

                {/* Data Editor */}
                {showDataEditor && errorDetails.length > 0 && (
                    <Card className="mb-6 bg-white/80 border-orange-300 dark:bg-slate-800/50 dark:border-orange-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-orange-500" />
                                Edytor danych - Napraw błędy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert className="mb-4 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30">
                                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <AlertDescription className="text-orange-800 dark:text-orange-300">
                                    Pola z błędami są zaznaczone na czerwono. Popraw je i uruchom walidację ponownie.
                                </AlertDescription>
                            </Alert>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">occurrenceID</th>
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventID</th>
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">scientificName</th>
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventDate</th>
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">decimalLatitude</th>
                                            <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">decimalLongitude</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataRecords.map((record) => (
                                            <tr key={record.id} className="border-b border-gray-200 dark:border-slate-700">
                                                <td className="p-2">
                                                    <Input
                                                        value={record.occurrenceID}
                                                        onChange={(e) => updateRecord(record.id, 'occurrenceID', e.target.value)}
                                                        placeholder="Wpisz ID"
                                                        className={`text-gray-900 dark:text-white ${hasError(record.id, 'occurrenceID') ? 'border-red-500 bg-red-50 dark:bg-red-500/20' : 'bg-white dark:bg-slate-700'}`}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Select
                                                        value={record.eventID}
                                                        onValueChange={(val) => updateRecord(record.id, 'eventID', val)}
                                                    >
                                                        <SelectTrigger className={`text-gray-900 dark:text-white ${hasError(record.id, 'eventID') ? 'border-red-500 bg-red-50 dark:bg-red-500/20' : 'bg-white dark:bg-slate-700'}`}>
                                                            <SelectValue placeholder="Wybierz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {validEventIDs.map(id => (
                                                                <SelectItem key={id} value={id}>{id}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={record.scientificName}
                                                        onChange={(e) => updateRecord(record.id, 'scientificName', e.target.value)}
                                                        className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={record.eventDate}
                                                        onChange={(e) => updateRecord(record.id, 'eventDate', e.target.value)}
                                                        placeholder="YYYY-MM-DD"
                                                        className={`text-gray-900 dark:text-white ${hasError(record.id, 'eventDate') ? 'border-red-500 bg-red-50 dark:bg-red-500/20' : 'bg-white dark:bg-slate-700'}`}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={record.decimalLatitude}
                                                        onChange={(e) => updateRecord(record.id, 'decimalLatitude', e.target.value)}
                                                        className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={record.decimalLongitude}
                                                        onChange={(e) => updateRecord(record.id, 'decimalLongitude', e.target.value)}
                                                        className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                                                        readOnly
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Error List */}
                            <div className="mt-4 space-y-2">
                                <h4 className="font-semibold text-red-600 dark:text-red-400">Znalezione błędy:</h4>
                                {errorDetails.map((error, idx) => (
                                    <Alert key={idx} className="bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 py-2">
                                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
                                            Wiersz {error.rowId}, pole <strong>{error.field}</strong>: {error.message}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Validation Steps */}
                <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Kroki walidacji
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
                        {!validationComplete || !allPassed ? (
                            <Button
                                onClick={() => { resetValidation(); runValidation(); }}
                                disabled={isValidating}
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                size="lg"
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Walidacja...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        {validationComplete ? 'Waliduj ponownie' : 'Uruchom walidację GBIF'}
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                            >
                                <Trophy className="w-4 h-4 mr-2" />
                                Zdobądź zwycięstwo!
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
                                Gratulacje! Pokonałeś Chaos Validator! 🎉
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Modals */}

                {showTutorial && (
                    <TutorialModal
                        levelNumber={5}
                        isOpen={showTutorial}
                        onClose={() => setShowTutorial(false)}
                    />
                )}
            </div>
        </div>
    );
}
