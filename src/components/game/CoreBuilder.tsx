import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileSpreadsheet, CheckCircle, AlertCircle, Lightbulb, Timer, Zap, BookOpen, Database, Upload, X } from 'lucide-react';
import { sampleEventsCSV, dwcTerms } from './DwCTerms';
import DraggableColumn from './DraggableColumn';
import DropZone from './DropZone';
import TutorialModal from './TutorialModal';
import ImportPanel from './schema-mapper/ImportPanel';
import { useValidator } from '@/hooks/useValidator';
import { GameState } from '@/hooks/useGameProgress';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAccessibility } from '@/components/accessibility/AccessibilityContext';

// Required DwC terms for Event Core - only eventID is strictly required per DwC-DP
const requiredTerms = ['eventID'];
const optionalTerms = ['parentEventID', 'eventDate', 'recordedBy', 'scientificName', 'decimalLatitude', 'decimalLongitude', 'geodeticDatum', 'countryCode', 'basisOfRecord', 'organismQuantity', 'organismQuantityType', 'verbatimLocality', 'habitat'];

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
    const { t, language } = useLanguage();
    const { announce } = useAccessibility();
    const pick = useCallback((pl: string, en: string, fr: string, de: string) => {
        if (language === 'en') return en;
        if (language === 'fr') return fr;
        if (language === 'de') return de;
        return pl;
    }, [language]);

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
    const sampleDataSet = useMemo(() => parseCSV(sampleEventsCSV), [parseCSV]);
    const initialColumns = sampleDataSet.headers;
    const initialData = sampleDataSet.data;
    
    const [csvData, setCsvData] = useState<Record<string, string>[]>(initialData);
    const [columns, setColumns] = useState<string[]>(initialColumns);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [showDataSourceDialog, setShowDataSourceDialog] = useState(true);
    const [dataSourceDialogMode, setDataSourceDialogMode] = useState<'choice' | 'import'>('choice');
    const [usesSampleData, setUsesSampleData] = useState(true);
    const [showTutorial, setShowTutorial] = useState(true);
    const [levelScore, setLevelScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [mappingErrors, setMappingErrors] = useState<Record<string, string>>({});
    const levelTimerStartedRef = useRef(false);

    const dataSourceCopy = useMemo(() => {
        if (language === 'fr') {
            return {
                title: 'Choisissez les donnees pour le mappage',
                description: 'Vous pouvez commencer avec les donnees d exemple GBIF ou importer votre propre fichier CSV, TXT ou XLSX.',
                sampleTitle: 'Utiliser les donnees d exemple',
                sampleDescription: 'Chargez le jeu de test integre et commencez directement le glisser-deposer.',
                importTitle: 'Importer vos propres donnees',
                importDescription: 'Ouvrez l importeur de "Create Your Data Package" et travaillez sur votre propre fichier.',
                backToChoice: 'Retour au choix',
            };
        }
        if (language === 'de') {
            return {
                title: 'Daten fuer das Mapping auswaehlen',
                description: 'Sie koennen mit den integrierten GBIF-Beispieldaten starten oder Ihre eigene CSV-, TXT- oder XLSX-Datei importieren.',
                sampleTitle: 'Beispieldaten verwenden',
                sampleDescription: 'Laden Sie den eingebauten Testsatz und starten Sie sofort mit dem Drag-and-Drop.',
                importTitle: 'Eigene Daten importieren',
                importDescription: 'Oeffnen Sie den Importer aus "Create Your Data Package" und arbeiten Sie mit Ihrer eigenen Datei.',
                backToChoice: 'Zurueck zur Auswahl',
            };
        }
        if (language === 'en') {
            return {
                title: 'Choose data for mapping',
                description: 'You can start with built-in GBIF sample data or import your own CSV, TXT, or XLSX file.',
                sampleTitle: 'Use sample data',
                sampleDescription: 'Load the built-in test dataset and start dragging columns right away.',
                importTitle: 'Import your own data',
                importDescription: 'Open the importer from "Create Your Data Package" and work on your own file.',
                backToChoice: 'Back to choices',
            };
        }
        return {
            title: 'Wybierz dane do mapowania',
            description: 'Możesz zacząć od wbudowanych danych GBIF albo zaimportować własny plik CSV, TXT lub XLSX.',
            sampleTitle: 'Użyj danych przykładowych',
            sampleDescription: 'Załaduj wbudowany zestaw testowy.',
            importTitle: 'Zaimportuj własne dane',
            importDescription: 'Otwórz importer i pracuj na swoim pliku.',
            backToChoice: 'Wróć do wyboru',
        };
    }, [language]);

    const coreUiCopy = useMemo(() => ({
        title: pick('Misja 1: Mapowanie kolumn', 'Mission 1: Core Forge', 'Mission 1 : Core Forge', 'Mission 1: Core Forge'),
        tutorialButton: pick('Samouczek', 'Tutorial', 'Tutoriel', 'Tutorial'),
        pointsUnit: pick('pkt', 'pts', 'pts', 'Pkt.'),
        sourceColumnsTitle: pick('Kolumny CSV', 'CSV Columns', 'Colonnes CSV', 'CSV-Spalten'),
        rowsLabel: pick('wierszy', 'rows', 'lignes', 'Zeilen'),
        targetTermsTitle: pick('Nazwy terminów Darwin Core', 'Darwin Core Terms', 'Termes Darwin Core', 'Darwin Core-Begriffe'),
        cancelSelection: pick('Anuluj wybór kolumny', 'Cancel column selection', 'Annuler la sélection de la colonne', 'Spaltenauswahl abbrechen'),
        completeReason: pick('Ukończono mapowanie kolumn', 'Core Forge Complete!', 'Core Forge terminé', 'Core Forge abgeschlossen!'),
        mappingAnnouncement: pick(
            'Kolumna {column} została zmapowana do {term}.',
            'Column {column} was mapped to {term}.',
            'La colonne {column} a été associée à {term}.',
            'Die Spalte {column} wurde {term} zugeordnet.'
        ),
        mappingRemovedAnnouncement: pick(
            'Usunięto mapowanie pola {term}.',
            'Removed mapping for field {term}.',
            'Le mappage du champ {term} a été supprimé.',
            'Die Zuordnung für das Feld {term} wurde entfernt.'
        ),
        columnSelectedAnnouncement: pick(
            'Wybrano kolumnę {column}. Wybierz pole Darwin Core, aby ją zmapować.',
            'Selected column {column}. Choose a Darwin Core field to map it.',
            'Colonne {column} sélectionnée. Choisissez un champ Darwin Core pour l’associer.',
            'Spalte {column} ausgewählt. Wähle ein Darwin Core-Feld, um sie zuzuordnen.'
        ),
        columnDeselectedAnnouncement: pick(
            'Odznaczono kolumnę {column}.',
            'Deselected column {column}.',
            'La colonne {column} a été désélectionnée.',
            'Die Spalte {column} wurde abgewählt.'
        ),
        restrictionErrors: {
            decimalLatitude: pick(
                'Błąd: kolumna Latitude może być zmapowana tylko do pola decimalLatitude.',
                'Error: Latitude column must be mapped to decimalLatitude.',
                'Erreur : la colonne Latitude doit être associée à decimalLatitude.',
                'Fehler: Die Spalte Latitude muss decimalLatitude zugeordnet werden.'
            ),
            decimalLongitude: pick(
                'Błąd: kolumna Longitude może być zmapowana tylko do pola decimalLongitude.',
                'Error: Longitude column must be mapped to decimalLongitude.',
                'Erreur : la colonne Longitude doit être associée à decimalLongitude.',
                'Fehler: Die Spalte Longitude muss decimalLongitude zugeordnet werden.'
            ),
            eventID: pick(
                'Błąd: kolumna Id może być zmapowana tylko do pola eventID.',
                'Error: Id column must be mapped to eventID.',
                'Erreur : la colonne Id doit être associée à eventID.',
                'Fehler: Die Spalte Id muss eventID zugeordnet werden.'
            ),
            scientificName: pick(
                'Błąd: kolumna Specimen może być zmapowana tylko do pola scientificName.',
                'Error: Specimen column must be mapped to scientificName.',
                'Erreur : la colonne Specimen doit être associée à scientificName.',
                'Fehler: Die Spalte Specimen muss scientificName zugeordnet werden.'
            ),
        },
    }), [pick]);

    const applyDataSet = useCallback((nextColumns: string[], nextData: Record<string, string>[], useSampleData: boolean) => {
        setColumns(nextColumns);
        setCsvData(nextData);
        setMappings({});
        setDraggedColumn(null);
        setSelectedColumn(null);
        setMappingErrors({});
        setShowHint(false);
        setUsesSampleData(useSampleData);
    }, []);

    const handleUseSampleData = useCallback(() => {
        applyDataSet(initialColumns, initialData, true);
        setDataSourceDialogMode('choice');
        setShowDataSourceDialog(false);
    }, [applyDataSet, initialColumns, initialData]);

    const handleImportComplete = useCallback((importData: Record<string, string>[], importColumns: string[]) => {
        applyDataSet(importColumns, importData, false);
        setDataSourceDialogMode('choice');
        setShowDataSourceDialog(false);
    }, [applyDataSet]);

    // Start timer after setup overlays are closed
    useEffect(() => {
        if (showDataSourceDialog || showTutorial) {
            setIsTimerRunning(false);
            return;
        }

        if (!levelTimerStartedRef.current) {
            levelTimerStartedRef.current = true;
            startLevelTimer?.();
        }

        if (timeLeft > 0) {
            setIsTimerRunning(true);
        }
    }, [showDataSourceDialog, showTutorial, startLevelTimer, timeLeft]);

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
            decimalLatitude: { only: 'Latitude', error: coreUiCopy.restrictionErrors.decimalLatitude },
            decimalLongitude: { only: 'Longitude', error: coreUiCopy.restrictionErrors.decimalLongitude },
            eventID: { only: 'Id', error: coreUiCopy.restrictionErrors.eventID },
            scientificName: { only: 'Specimen', error: coreUiCopy.restrictionErrors.scientificName }
        };

        if (usesSampleData && restrictions[termName] && columnName !== restrictions[termName].only) {
            setMappingErrors(prev => ({ ...prev, [termName]: restrictions[termName].error }));
            playFail?.();
            announce(restrictions[termName].error);
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
        announce(
            coreUiCopy.mappingAnnouncement
                .replace('{column}', columnName)
                .replace('{term}', termName)
        );
    }, [playDrop, playFail, announce, usesSampleData, coreUiCopy]);

    // Remove mapping
    const handleRemoveMapping = useCallback((termName: string) => {
        setMappings(prev => {
            const newMappings = { ...prev };
            delete newMappings[termName];
            return newMappings;
        });
        announce(coreUiCopy.mappingRemovedAnnouncement.replace('{term}', termName));
    }, [announce, coreUiCopy]);

    // Tap-to-assign: select a column
    const handleTapSelect = useCallback((column: string) => {
        setSelectedColumn(prev => {
            const next = prev === column ? null : column;
            announce(
                next
                    ? coreUiCopy.columnSelectedAnnouncement.replace('{column}', column)
                    : coreUiCopy.columnDeselectedAnnouncement.replace('{column}', column)
            );
            return next;
        });
    }, [announce, coreUiCopy]);

    // Tap-to-assign: assign selected column to a term
    const handleTapAssign = useCallback((termName: string) => {
        if (!selectedColumn) return;
        handleDrop(termName, selectedColumn);
        setSelectedColumn(null);
    }, [selectedColumn, handleDrop]);

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
        const finalScore = levelScore;
        addScore?.(finalScore, coreUiCopy.completeReason);
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
                                {coreUiCopy.title}
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">{t('core.subtitle')}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTutorial(true)}
                                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500/40 dark:text-yellow-300 dark:hover:bg-yellow-500/10"
                            >
                                <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                                {coreUiCopy.tutorialButton}
                            </Button>
                            <div role="timer" aria-live={timeLeft < 60 ? "polite" : "off"} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} aria-hidden="true" />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400">
                                {levelScore} {coreUiCopy.pointsUnit}
                            </Badge>
                        </div>
                    </div>
                    <Progress value={progress} aria-label={`${Math.round(progress)}% ${t('core.complete')}`} className="h-3 bg-gray-200 dark:bg-slate-700" />
                    <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-slate-400">
                        <span>{Math.round(progress)}% {t('core.complete')}</span>
                        <span>{requiredTerms.filter(t => mappings[t]).length}/{requiredTerms.length} {t('core.required')}</span>
                    </div>
                </motion.div>

                {/* Mobile tap-to-assign hint */}
                {selectedColumn && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 md:hidden p-3 rounded-lg bg-indigo-500/20 border border-indigo-500/50 text-indigo-800 dark:text-indigo-200 text-sm flex items-center gap-2"
                    >
                        <span className="text-lg" aria-hidden="true">👆</span>
                        {t('core.selectedColumn', { column: selectedColumn })}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedColumn(null)} aria-label={coreUiCopy.cancelSelection} className="ml-auto h-6 px-2 text-indigo-700 dark:text-indigo-300">
                            <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </motion.div>
                )}

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
                                        {coreUiCopy.sourceColumnsTitle} ({columns.length})
                                    </span>
                                    <Badge variant="secondary" className="bg-gray-700 text-white">{csvData.length} {coreUiCopy.rowsLabel}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 max-h-[60vh] overflow-y-auto space-y-2">
                                {/* Mobile hint */}
                                <p className="text-xs text-muted-foreground md:hidden mb-2 flex items-center gap-1">
                                    👆 {t('core.tapToSelect')}
                                </p>
                                <AnimatePresence>
                                    {columns.map((column, idx) => (
                                        <DraggableColumn
                                            key={column}
                                            column={column}
                                            index={idx}
                                            isDragging={draggedColumn === column}
                                            isSelected={selectedColumn === column}
                                            mappedTo={getColumnMapping(column)}
                                            validationStatus={getColumnMapping(column) ? validateMapping(getColumnMapping(column)!) : null}
                                            onDragStart={(col) => setDraggedColumn(col)}
                                            onDragEnd={() => setDraggedColumn(null)}
                                            onTapSelect={handleTapSelect}
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
                                        {coreUiCopy.targetTermsTitle}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowHint(!showHint)}
                                        aria-expanded={showHint}
                                        aria-controls="core-hint"
                                        className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-800"
                                    >
                                        <Lightbulb className="w-4 h-4 mr-1" aria-hidden="true" />
                                        {t('common.hint')}
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
                                            <Alert id="core-hint" className="mb-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30">
                                                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                                                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                                    {t('core.hintText')} <Badge variant="destructive" className="text-xs mx-1">{t('core.hintRequired')}</Badge> {t('core.hintEnd')}
                                                </AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Tabs defaultValue="required" className="w-full">
                                    <TabsList className="w-full bg-gray-100 dark:bg-slate-700/50 mb-4">
                                        <TabsTrigger value="required" className="flex-1">{t('core.requiredTab')} ({requiredTerms.length})</TabsTrigger>
                                        <TabsTrigger value="optional" className="flex-1">{t('core.optionalTab')} ({optionalTerms.length})</TabsTrigger>
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
                                                    onTapAssign={handleTapAssign}
                                                    hasSelectedColumn={!!selectedColumn}
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
                                                onTapAssign={handleTapAssign}
                                                hasSelectedColumn={!!selectedColumn}
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
                                        <><CheckCircle className="w-5 h-5 mr-2" /> {t('core.completeLevel')}</>
                                    ) : (
                                        <><AlertCircle className="w-5 h-5 mr-2" /> {t('core.mapAllRequired')}</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                <Dialog
                    open={showDataSourceDialog}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            handleUseSampleData();
                            return;
                        }
                        setShowDataSourceDialog(isOpen);
                    }}
                >
                    <DialogContent className={dataSourceDialogMode === 'import' ? 'max-w-6xl max-h-[90vh] overflow-y-auto' : 'max-w-3xl'}>
                        <DialogHeader>
                            <DialogTitle>{dataSourceCopy.title}</DialogTitle>
                            <DialogDescription>{dataSourceCopy.description}</DialogDescription>
                        </DialogHeader>

                        {dataSourceDialogMode === 'choice' ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={handleUseSampleData}
                                    className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:bg-primary/5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                        <Database className="h-6 w-6 text-primary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{dataSourceCopy.sampleTitle}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{dataSourceCopy.sampleDescription}</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDataSourceDialogMode('import')}
                                    className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 text-center transition-all hover:border-secondary hover:bg-secondary/5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 transition-colors group-hover:bg-secondary/20">
                                        <Upload className="h-6 w-6 text-secondary" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{dataSourceCopy.importTitle}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{dataSourceCopy.importDescription}</p>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDataSourceDialogMode('choice')}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    {dataSourceCopy.backToChoice}
                                </Button>
                                <ImportPanel onImportComplete={handleImportComplete} />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Tutorial Modal */}
                <TutorialModal
                    levelNumber={1}
                    isOpen={!showDataSourceDialog && showTutorial}
                    onClose={() => setShowTutorial(false)}
                />

            </div>
        </div>
    );
}
