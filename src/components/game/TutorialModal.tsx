import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, Target, Award } from 'lucide-react';

interface Tutorial {
    title: string;
    emoji: string;
    objective: string;
    steps: string[];
    tips: string[];
    scoring: string;
}

const tutorials: Record<number, Tutorial> = {
    1: {
        title: "Core Forge - Mapowanie CSV",
        emoji: "⚡",
        objective: "Zmapuj wszystkie wymagane kolumny CSV na termy Darwin Core",
        steps: [
            "1. Wgraj swój CSV lub użyj przykładowych danych",
            "2. Przeciągnij kolumny z lewej na odpowiednie termy po prawej",
            "3. Zacznij od wymaganych pól (czerwone obramowanie)",
            "4. Sprawdź podpowiedzi - najedź na term aby zobaczyć opis",
            "5. Zmapuj wszystkie wymagane pola aby przejść dalej"
        ],
        tips: [
            "💡 Wymagane pola: eventID, decimalLatitude, decimalLongitude, geodeticDatum, countryCode, eventDate, basisOfRecord, scientificName",
            "🎯 Każda kolumna może być zmapowana tylko raz",
            "⏱️ Im szybciej - tym więcej punktów!"
        ],
        scoring: "+50 pkt za każde poprawne mapowanie, +100 bonus za 100% poprawność"
    },
    2: {
        title: "Extension Nexus - Łączenie Danych",
        emoji: "🔗",
        objective: "Połącz pliki extension z core i sprawdź referential integrity",
        steps: [
            "1. Zobacz jakie ID są w core (event.txt)",
            "2. Kliknij 'Sprawdź Referential Integrity' dla taxon.txt",
            "3. Kliknij 'Sprawdź Referential Integrity' dla multimedia.txt",
            "4. Jeśli są błędy - usuń nieprawidłowe rekordy przyciskiem 'Usuń'",
            "5. Upewnij się że wszystkie extensions są połączone bez błędów"
        ],
        tips: [
            "💡 Taxon extension automatycznie przechodzi (brak foreign key do core)",
            "🎯 Multimedia musi mieć eventID istniejące w core",
            "⚠️ Nieprawidłowe ID można usunąć jednym kliknięciem"
        ],
        scoring: "+100 pkt za każdy połączony extension, +25 pkt za sprawdzenie integrity"
    },
    3: {
        title: "Package Seal - Generowanie Metadanych",
        emoji: "📦",
        objective: "Wygeneruj meta.xml i datapackage.json dla Darwin Core Archive",
        steps: [
            "1. Wypełnij metadane datasetu (tytuł, opis, autor, licencja)",
            "2. Kliknij 'Generuj meta.xml' - plik opisujący strukturę",
            "3. Kliknij 'Generuj datapackage.json' - metadane Frictionless",
            "4. Możesz podejrzeć wygenerowane pliki w zakładkach",
            "5. Pobierz meta.xml jeśli chcesz zobaczyć plik lokalnie"
        ],
        tips: [
            "💡 meta.xml jest wymagany przez GBIF do publikacji danych",
            "🎯 datapackage.json to standard Frictionless Data",
            "📄 Oba pliki automatycznie zawierają strukturę z poprzednich poziomów"
        ],
        scoring: "+150 pkt za meta.xml, +150 pkt za datapackage.json, +bonus za czas"
    },
    4: {
        title: "Species Matcher - Taxonomic Laboratory",
        emoji: "🧬",
        objective: "Dopasuj nazwy gatunków do oficjalnej taksonomii GBIF Backbone. Wykrywaj literówki, synonimy i przypisuj królestwa!",
        steps: [
            "1. Runda 1: Popraw literówki w nazwach naukowych",
            "2. Runda 2: Rozpoznaj synonimy i znajdź akceptowane nazwy",
            "3. Runda 3: Przypisz poprawne królestwo (Kingdom) do gatunków",
            "4. Uważaj na pułapki — niektóre nazwy są poprawne!"
        ],
        tips: [
            "🧬 GBIF Backbone Taxonomy łączy ponad 2 mln nazw gatunków",
            "🔍 Synonimy to stare nazwy uznane za równoznaczne z nowymi",
            "⚠️ Nie każda nazwa zawiera błąd — niektóre są poprawne!"
        ],
        scoring: "+20 pkt za literówkę, +30 pkt za synonim, +10 pkt za królestwo, -5 pkt za błąd"
    },
    5: {
        title: "BOSS: GBIF Validator",
        emoji: "👹",
        objective: "Pokonaj Chaos Validator - przejdź walidację GBIF bez błędów",
        steps: [
            "1. Kliknij 'Uruchom Walidację GBIF'",
            "2. Obserwuj 6 kroków walidacji (UTF-8, wymagane pola, ID, formaty, współrzędne, integrity)",
            "3. Każdy krok musi przejść (zielona ikona ✓)",
            "4. Jeśli jest błąd - wróć do poprzednich poziomów i napraw dane",
            "5. Po pomyślnej walidacji - ukończ misję!"
        ],
        tips: [
            "💡 Walidacja symuluje prawdziwy GBIF Data Validator",
            "🎯 Sprawdza: kodowanie UTF-8, wymagane pola, unikalność ID, formaty dat i współrzędnych",
            "⚠️ Błędy krytyczne (czerwone ✗) blokują publikację"
        ],
        scoring: "+50 pkt za każdy krok walidacji, +200 bonus za perfekcyjne przejście"
    }
};

interface TutorialModalProps {
    levelNumber: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialModal({ levelNumber, isOpen, onClose }: TutorialModalProps) {
    if (!isOpen || !tutorials[levelNumber]) return null;

    const tutorial = tutorials[levelNumber];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                onClick={onClose}
                style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-slate-700 overflow-hidden relative z-[10000] mx-auto"
                    style={{ zIndex: 10000 }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 p-6 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <div className="flex flex-col items-center gap-4 text-center">
                            <span className="text-6xl">{tutorial.emoji}</span>
                            <div className="flex flex-col items-center">
                                <Badge className="mb-2 bg-white/20 text-white">
                                    Poziom {levelNumber}
                                </Badge>
                                <h2 className="text-2xl font-bold text-white">
                                    {tutorial.title}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto text-center">
                        {/* Objective */}
                        <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30">
                            <CardContent className="pt-4">
                                <div className="flex flex-col items-center gap-3">
                                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Cel misji:</h3>
                                        <p className="text-gray-700 dark:text-slate-300">{tutorial.objective}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Steps */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                                📋 Kroki do wykonania:
                            </h3>
                            <div className="space-y-2">
                                {tutorial.steps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-slate-700/30 dark:border-slate-600/50"
                                    >
                                        <span className="text-gray-700 dark:text-slate-300 text-center">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                                Wskazówki:
                            </h3>
                            <div className="space-y-2">
                                {tutorial.tips.map((tip, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200 text-sm text-center"
                                    >
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scoring */}
                        <Card className="bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30">
                            <CardContent className="pt-4">
                                <div className="flex flex-col items-center gap-3">
                                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Punktacja:</h3>
                                        <p className="text-gray-700 dark:text-slate-300 text-sm">{tutorial.scoring}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <Button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            size="lg"
                        >
                            Zaczynamy! 🚀
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
