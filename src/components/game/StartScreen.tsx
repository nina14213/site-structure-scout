import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    BookOpen,
    Trophy,
    Zap,
    Link as LinkIcon,
    Package,
    Shield,
    Volume2,
    VolumeX,
    Sun,
    Moon,
    Gamepad2,
    ExternalLink,
    HelpCircle,
    Database
} from 'lucide-react';
import { GameState, LeaderboardEntry } from '@/hooks/useGameProgress';

const levels = [
    {
        id: 1,
        name: 'Core Forge',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        description: 'Mapuj kolumny CSV na termy Darwin Core'
    },
    {
        id: 2,
        name: 'Extension Nexus',
        icon: LinkIcon,
        color: 'from-purple-500 to-indigo-500',
        description: 'Połącz extensions i sprawdź integralność'
    },
    {
        id: 3,
        name: 'Package Seal',
        icon: Package,
        color: 'from-teal-500 to-cyan-500',
        description: 'Generuj meta.xml i datapackage.json'
    },
    {
        id: 4,
        name: 'BOSS: Validate',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        description: 'Przejdź walidację GBIF'
    },
    {
        id: 5,
        name: 'Stwórz swoją Data Package',
        icon: Database,
        color: 'from-emerald-500 to-cyan-500',
        description: 'Importuj własne dane CSV/XLSX'
    }
];

interface StartScreenProps {
    onStart: (playerName: string) => void;
    gameState: GameState;
    leaderboard: LeaderboardEntry[];
    soundEnabled?: boolean;
    toggleSound?: () => void;
    darkMode?: boolean;
    toggleDarkMode?: () => void;
    onLevelClick?: (levelId: number) => void;
    isLevelUnlocked?: (levelId: number) => boolean;
    onDataImport?: () => void;
}

export default function StartScreen({
    onStart,
    gameState,
    leaderboard,
    soundEnabled,
    toggleSound,
    darkMode,
    toggleDarkMode,
    onLevelClick,
    isLevelUnlocked,
    onDataImport
}: StartScreenProps) {
    const [playerName, setPlayerName] = useState(gameState?.playerName || '');
    const [showTutorial, setShowTutorial] = useState(false);

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName.trim());
            onLevelClick?.(1); // Go directly to Core Forge
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with settings */}
                <div className="flex justify-end gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSound}
                        className="text-slate-400 hover:text-white"
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                        className="text-slate-400 hover:text-white"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-6xl md:text-8xl mb-4"
                    >
                        🦎
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 mb-4">
                        DwC Data Quest
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Zostań Data Rangerem i uratuj dane z kolekcji AMUNATCOLL przed Chaos Validator GBIF!
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">
                            <Database className="w-3 h-3 mr-1" />
                            Darwin Core
                        </Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/50">
                            GBIF
                        </Badge>
                        <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                            DwC-DP
                        </Badge>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Start Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Gamepad2 className="w-6 h-6 text-green-400" />
                                    Rozpocznij Misję
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-300">Twoje imię (Data Ranger)</Label>
                                    <Input
                                        id="name"
                                        placeholder="Wpisz swoje imię..."
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                                        className="bg-slate-700/50 border-slate-600 text-white text-lg py-6"
                                    />
                                </div>

                                <Button
                                    onClick={handleStart}
                                    disabled={!playerName.trim()}
                                    size="lg"
                                    className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                    <Play className="w-6 h-6 mr-2" />
                                    Rozpocznij Grę
                                </Button>

                                {/* Levels preview */}
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    {levels.filter(l => l.id <= 4).map((level, idx) => {
                                        const unlocked = isLevelUnlocked ? isLevelUnlocked(level.id) : level.id === 1;
                                        const LevelIcon = level.icon;
                                        return (
                                            <motion.button
                                                key={level.id}
                                                layoutId={`level-${level.id}`}
                                                onClick={() => onLevelClick?.(level.id)}
                                                disabled={!unlocked || !playerName.trim()}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.1 }}
                                                whileHover={unlocked && playerName.trim() ? { scale: 1.05 } : {}}
                                                whileTap={unlocked && playerName.trim() ? { scale: 0.98 } : {}}
                                                className={`p-4 rounded-xl bg-gradient-to-br ${level.color} bg-opacity-10 border border-slate-600/50 hover:border-slate-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left ${
                                                    !unlocked ? 'opacity-30' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <LevelIcon className="w-5 h-5 text-white" />
                                                    <span className="font-semibold text-white text-sm">{level.name}</span>
                                                    {!unlocked && <span className="text-xs text-slate-400 ml-auto">🔒</span>}
                                                </div>
                                                <p className="text-xs text-slate-300">{level.description}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Custom Data Package Option */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onDataImport}
                                    className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 hover:border-emerald-400 transition-colors cursor-pointer text-left"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Database className="w-5 h-5 text-emerald-400" />
                                        <span className="font-semibold text-white">Stwórz swoją Data Package</span>
                                    </div>
                                    <p className="text-xs text-slate-300">Importuj własne dane CSV/XLSX i przekształć je w Darwin Core</p>
                                </motion.button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Side Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Leaderboard */}
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <Trophy className="w-5 h-5 text-yellow-400" />
                                    Top Rangers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {leaderboard.length > 0 ? (
                                    <div className="space-y-2">
                                        {leaderboard.slice(0, 5).map((entry, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                                        idx === 0 ? 'bg-yellow-500 text-black' :
                                                        idx === 1 ? 'bg-slate-400 text-slate-900' :
                                                        idx === 2 ? 'bg-orange-600 text-white' :
                                                        'bg-slate-600 text-white'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm text-white truncate max-w-[100px]">
                                                        {entry.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-yellow-400 font-mono">
                                                    {entry.score}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">
                                        Bądź pierwszy na liście!
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Links */}
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                    Nauka
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <a
                                    href="https://dwc.tdwg.org/terms/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="text-sm">Darwin Core Terms</span>
                                </a>
                                <a
                                    href="https://www.gbif.org/ipt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="text-sm">GBIF IPT</span>
                                </a>
                                <a
                                    href="https://www.gbif.org/tools/data-validator"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="text-sm">GBIF Validator</span>
                                </a>
                            </CardContent>
                        </Card>

                        {/* How to Play */}
                        <Button
                            variant="outline"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => setShowTutorial(!showTutorial)}
                        >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Jak grać?
                        </Button>

                        {showTutorial && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700"
                            >
                                <h4 className="font-semibold text-white mb-2">Instrukcja:</h4>
                                <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                                    <li>Wgraj plik CSV lub użyj przykładowych danych</li>
                                    <li>Przeciągaj kolumny na odpowiednie termy DwC</li>
                                    <li>Połącz extensions z core</li>
                                    <li>Wygeneruj pliki metadanych</li>
                                    <li>Przejdź walidację GBIF!</li>
                                </ol>
                                <p className="text-xs text-slate-500 mt-3">
                                    Czas na poziom: 5 minut. Zbieraj punkty i odznaki!
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12 text-slate-500 text-sm"
                >
                    <p>
                        🎓 Projekt edukacyjny AMUNATCOLL · Adam Mickiewicz University
                    </p>
                    <p className="mt-1">
                        Ucz się standardu GBIF Darwin Core poprzez zabawę!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
