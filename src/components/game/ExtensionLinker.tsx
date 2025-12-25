import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database, FileText, Timer, XCircle, Check, Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuizModal from './QuizModal';
import TutorialModal from './TutorialModal';
import { GameState } from '@/hooks/useGameProgress';

// Sample event data (from field sampling)
const sampleEventData = [
    { eventID: '3431', eventDate: '25.10.2025 11:21', verbatimLocality: 'Dębina municipal forest in Poznań, Poland', decimalLatitude: '52.369327', decimalLongitude: '16.925402', geodeticDatum: 'WGS84', habitat: 'Forest near railroad' },
    { eventID: '3432', eventDate: '23.05.2025 15:47', verbatimLocality: 'Marii Skłodowskiej-Curie Park, Poznań, Poland', decimalLatitude: '52.3935228', decimalLongitude: '16.918701', geodeticDatum: 'WGS84', habitat: 'Park' },
    { eventID: '3433', eventDate: '25.10.2025 11:21', verbatimLocality: 'In John Paul II Park, opposite the intersection of Krzyżowa and Dolna Wilda Streets, Poznań', decimalLatitude: '52.39006168575653', decimalLongitude: '16.924799750827287', geodeticDatum: 'WGS84', habitat: 'small bush' },
    { eventID: '3434', eventDate: '23.05.2025 15:47', verbatimLocality: 'In the park at Powstańców Wielkopolskich Street, Poznań', decimalLatitude: '52.4037546037329', decimalLongitude: '16.91747009754181', geodeticDatum: 'WGS84', habitat: 'Park' },
];

// Sample occurrence data (field notes - with missing values)
const initialOccurrenceData = [
    { eventID: '3431', scientificName: 'Ailanthus altissima', recordedBy: '', organismQuantity: '1', organismQuantityType: 'individual' },
    { eventID: '', scientificName: 'Ailanthus altissima', recordedBy: 'K. Słupecka', organismQuantity: '', organismQuantityType: 'individual' },
    { eventID: '3433', scientificName: '', recordedBy: 'K. Słupecka', organismQuantity: '1', organismQuantityType: '' },
    { eventID: '3434', scientificName: 'Ailanthus altissima', recordedBy: 'K. Słupecka', organismQuantity: '1', organismQuantityType: 'individual' },
];

interface ExtensionLinkerProps {
    onComplete?: (score: number, data: unknown) => void;
    gameState?: GameState;
    addScore?: (points: number, reason?: string) => void;
    playSuccess?: () => void;
    playFail?: () => void;
    playDrop?: () => void;
    playLevelComplete?: () => void;
    startLevelTimer?: () => void;
    previousLevelData?: unknown;
}

export default function ExtensionLinker({ onComplete, addScore, playSuccess, playFail, playLevelComplete, startLevelTimer }: ExtensionLinkerProps) {
    const [eventData] = useState(sampleEventData);
    const [occurrenceData, setOccurrenceData] = useState(initialOccurrenceData);
    const [validationStatus, setValidationStatus] = useState<{ valid: boolean; errors: Array<{ row: number; field: string; message: string }> }>({ valid: false, errors: [] });
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const eventIds = new Set(eventData.map(row => row.eventID).filter(Boolean));

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

    // Validate occurrence data
    const validateOccurrences = useCallback(() => {
        const errors: Array<{ row: number; field: string; message: string }> = [];
        occurrenceData.forEach((row, idx) => {
            if (!row.eventID) {
                errors.push({ row: idx + 1, field: 'eventID', message: 'Missing eventID' });
            } else if (!eventIds.has(row.eventID)) {
                errors.push({ row: idx + 1, field: 'eventID', message: `eventID "${row.eventID}" doesn't exist in event` });
            }

            if (!row.scientificName) {
                errors.push({ row: idx + 1, field: 'scientificName', message: 'Missing scientificName' });
            }
            if (!row.recordedBy) {
                errors.push({ row: idx + 1, field: 'recordedBy', message: 'Missing recordedBy' });
            }
            if (!row.organismQuantity) {
                errors.push({ row: idx + 1, field: 'organismQuantity', message: 'Missing organismQuantity' });
            }
            if (!row.organismQuantityType) {
                errors.push({ row: idx + 1, field: 'organismQuantityType', message: 'Missing organismQuantityType' });
            }
        });

        setValidationStatus({ valid: errors.length === 0, errors });
        if (errors.length === 0) {
            playSuccess?.();
        } else {
            playFail?.();
        }
        return errors;
    }, [occurrenceData, eventIds, playSuccess, playFail]);

    // Update occurrence cell value
    const updateOccurrenceCell = useCallback((rowIndex: number, field: string, value: string) => {
        setOccurrenceData(prev => {
            const updated = [...prev];
            updated[rowIndex] = { ...updated[rowIndex], [field]: value };
            return updated;
        });
        setValidationStatus({ valid: false, errors: [] });
    }, []);

    // Calculate score
    useEffect(() => {
        let score = 0;
        if (validationStatus.valid) score += 200;

        const totalCells = occurrenceData.length * 5;
        const filledCells = occurrenceData.reduce((acc, row) => {
            return acc + (row.eventID ? 1 : 0) + (row.scientificName ? 1 : 0) + (row.recordedBy ? 1 : 0) + (row.organismQuantity ? 1 : 0) + (row.organismQuantityType ? 1 : 0);
        }, 0);
        score += Math.floor((filledCells / totalCells) * 100);

        if (timeLeft > 240) score += 50;
        else if (timeLeft > 180) score += 30;
        else if (timeLeft > 60) score += 10;

        setLevelScore(score);
    }, [validationStatus, occurrenceData, timeLeft]);

    const progress = validationStatus.valid ? 100 : 0;
    const canComplete = validationStatus.valid;

    const handleComplete = () => {
        if (!canComplete) {
            playFail?.();
            return;
        }
        setShowQuiz(true);
    };

    const handleQuizComplete = (quizScore: number) => {
        const finalScore = levelScore + (quizScore * 2);
        addScore?.(finalScore, 'Extension Nexus Complete');
        playLevelComplete?.();
        onComplete?.(finalScore, { eventData, occurrenceData });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900 p-4 md:p-6">
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
                                <Database className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                                Mission 2: Extension Nexus
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">
                                Fill in field notes and match occurrence to event
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400">
                                {levelScore} pts
                            </Badge>
                        </div>
                    </div>

                    <Progress value={progress} className="h-3 bg-gray-200 dark:bg-slate-700" />
                    <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-slate-400">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{validationStatus.errors.length} errors</span>
                    </div>
                </motion.div>

                {/* Event Core Data (read-only) */}
                <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Event Core (event.txt) - Read Only
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30">
                            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-800 dark:text-blue-300">
                                These are the sampling events. Each occurrence must reference a valid eventID.
                            </AlertDescription>
                        </Alert>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventID</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventDate</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">verbatimLocality</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">decimalLatitude</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">decimalLongitude</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">geodeticDatum</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">habitat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                                            <td className="p-2 font-mono text-purple-600 dark:text-purple-400">{row.eventID}</td>
                                            <td className="p-2 text-gray-700 dark:text-slate-300">{row.eventDate}</td>
                                            <td className="p-2 text-gray-700 dark:text-slate-300">{row.verbatimLocality}</td>
                                            <td className="p-2 font-mono text-gray-700 dark:text-slate-300">{row.decimalLatitude}</td>
                                            <td className="p-2 font-mono text-gray-700 dark:text-slate-300">{row.decimalLongitude}</td>
                                            <td className="p-2 text-gray-700 dark:text-slate-300">{row.geodeticDatum}</td>
                                            <td className="p-2 text-gray-700 dark:text-slate-300">{row.habitat}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Occurrence Extension (editable) */}
                <Card className="mb-6 bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Occurrence Extension (occurrence.txt) - Fill Missing Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                                Complete the missing values in field notes. All fields are required!
                            </AlertDescription>
                        </Alert>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 dark:border-slate-600">
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">eventID</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">scientificName</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">recordedBy</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">organismQuantity</th>
                                        <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">organismQuantityType</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {occurrenceData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                                            <td className="p-2">
                                                <Select
                                                    value={row.eventID}
                                                    onValueChange={(val) => updateOccurrenceCell(idx, 'eventID', val)}
                                                >
                                                    <SelectTrigger className={`w-full ${!row.eventID ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}>
                                                        <SelectValue placeholder="Select eventID" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {eventData.map(evt => (
                                                            <SelectItem key={evt.eventID} value={evt.eventID}>
                                                                {evt.eventID}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Select
                                                    value={row.scientificName}
                                                    onValueChange={(val) => updateOccurrenceCell(idx, 'scientificName', val)}
                                                >
                                                    <SelectTrigger className={`w-full ${!row.scientificName ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}>
                                                        <SelectValue placeholder="Select species" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Ailanthus altissima">Ailanthus altissima</SelectItem>
                                                        <SelectItem value="Robinia pseudoacacia">Robinia pseudoacacia</SelectItem>
                                                        <SelectItem value="Acer negundo">Acer negundo</SelectItem>
                                                        <SelectItem value="Solidago canadensis">Solidago canadensis</SelectItem>
                                                        <SelectItem value="Reynoutria japonica">Reynoutria japonica</SelectItem>
                                                        <SelectItem value="Impatiens glandulifera">Impatiens glandulifera</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Select
                                                    value={row.recordedBy}
                                                    onValueChange={(val) => updateOccurrenceCell(idx, 'recordedBy', val)}
                                                >
                                                    <SelectTrigger className={`w-full ${!row.recordedBy ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}>
                                                        <SelectValue placeholder="Select recorder" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="K. Słupecka">K. Słupecka</SelectItem>
                                                        <SelectItem value="M. Kowalski">M. Kowalski</SelectItem>
                                                        <SelectItem value="A. Nowak">A. Nowak</SelectItem>
                                                        <SelectItem value="J. Wiśniewski">J. Wiśniewski</SelectItem>
                                                        <SelectItem value="P. Zieliński">P. Zieliński</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Select
                                                    value={row.organismQuantity}
                                                    onValueChange={(val) => updateOccurrenceCell(idx, 'organismQuantity', val)}
                                                >
                                                    <SelectTrigger className={`w-full ${!row.organismQuantity ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}>
                                                        <SelectValue placeholder="Quantity" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1</SelectItem>
                                                        <SelectItem value="2">2</SelectItem>
                                                        <SelectItem value="3">3</SelectItem>
                                                        <SelectItem value="5">5</SelectItem>
                                                        <SelectItem value="10">10</SelectItem>
                                                        <SelectItem value="25">25</SelectItem>
                                                        <SelectItem value="50">50</SelectItem>
                                                        <SelectItem value="100">100</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Select
                                                    value={row.organismQuantityType}
                                                    onValueChange={(val) => updateOccurrenceCell(idx, 'organismQuantityType', val)}
                                                >
                                                    <SelectTrigger className={`w-full ${!row.organismQuantityType ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}>
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="individual">individual</SelectItem>
                                                        <SelectItem value="colony">colony</SelectItem>
                                                        <SelectItem value="clump">clump</SelectItem>
                                                        <SelectItem value="patch">patch</SelectItem>
                                                        <SelectItem value="population">population</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Validation */}
                <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                            {validationStatus.valid ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            Validation Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={validateOccurrences}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            size="lg"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Validate Data
                        </Button>

                        {validationStatus.errors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-red-600 dark:text-red-400">Errors Found:</h3>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {validationStatus.errors.map((err, idx) => (
                                        <Alert key={idx} className="bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30">
                                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            <AlertDescription className="text-red-800 dark:text-red-300">
                                                Row {err.row}, {err.field}: {err.message}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            </div>
                        )}

                        {validationStatus.valid && (
                            <Alert className="bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-green-800 dark:text-green-300">
                                    All data is valid! Ready to complete the level.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleComplete}
                            disabled={!canComplete}
                            className={`w-full ${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 dark:bg-slate-600'}`}
                            size="lg"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {canComplete ? 'Complete Level' : 'Fix Errors First'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Modals */}
                {showQuiz && (
                    <QuizModal
                        onComplete={handleQuizComplete}
                        onClose={() => setShowQuiz(false)}
                    />
                )}

                {showTutorial && (
                    <TutorialModal
                        levelNumber={2}
                        isOpen={showTutorial}
                        onClose={() => setShowTutorial(false)}
                    />
                )}
            </div>
        </div>
    );
}
