import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, Package, Shield, Lock, CheckCircle, Search } from 'lucide-react';
import { GameState } from '@/hooks/useGameProgress';

interface LevelSelectionProps {
    onSelectLevel: (levelId: number) => void;
    gameState: GameState;
    isLevelUnlocked: (levelId: number) => boolean;
}

export default function LevelSelection({ onSelectLevel, gameState, isLevelUnlocked }: LevelSelectionProps) {
    const levels = [
        {
            id: 1,
            title: 'Kuźnia Rdzenia',
            description: 'Mapuj kolumny CSV na termy Darwin Core',
            icon: Zap,
            gradient: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
            darkGradient: 'dark:from-yellow-600 dark:to-orange-600 dark:hover:from-yellow-700 dark:hover:to-orange-700'
        },
        {
            id: 2,
            title: 'Nexus Rozszerzeń',
            description: 'Połącz extensions i sprawdź integralność danych',
            icon: Database,
            gradient: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
            darkGradient: 'dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700'
        },
        {
            id: 3,
            title: 'Pieczęć Pakietu',
            description: 'Generuj meta.xml i datapackage.json',
            icon: Package,
            gradient: 'from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600',
            darkGradient: 'dark:from-teal-600 dark:to-cyan-600 dark:hover:from-teal-700 dark:hover:to-cyan-700'
        },
        {
            id: 4,
            title: 'Łowca Gatunków',
            description: 'Dopasuj nazwy gatunków do GBIF Backbone Taxonomy',
            icon: Search,
            gradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
            darkGradient: 'dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700'
        },
        {
            id: 5,
            title: 'BOSS: Walidacja',
            description: 'Przeprowadź walidację danych wg standardu GBIF',
            icon: Shield,
            gradient: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
            darkGradient: 'dark:from-red-600 dark:to-orange-600 dark:hover:from-red-700 dark:hover:to-orange-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        🎮 Wybierz Misję
                    </h1>
                    <p className="text-gray-600 dark:text-slate-400 text-lg">
                        Witaj, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{gameState?.playerName || 'Data Ranger'}</span>!
                    </p>
                </motion.div>

                {/* Progress Summary */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.totalScore || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">Punkty</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.levelsCompleted?.length || 0}/5</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">Poziomy</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.badges?.length || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">Odznaki</div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Level Buttons */}
                <div className="space-y-4">
                    {levels.map((level, index) => {
                        const Icon = level.icon;
                        const isCompleted = gameState?.levelsCompleted?.includes(level.id);
                        const isUnlocked = isLevelUnlocked ? isLevelUnlocked(level.id) : level.id === 1;
                        const isLocked = !isUnlocked;

                        return (
                            <motion.button
                                key={level.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => isUnlocked && onSelectLevel(level.id)}
                                disabled={isLocked}
                                className={`flex items-center gap-4 w-full p-6 rounded-xl bg-gradient-to-r ${level.gradient} ${level.darkGradient} text-white font-semibold shadow-lg transition-all duration-200 ${
                                    isLocked 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:shadow-xl hover:scale-105 cursor-pointer'
                                }`}
                            >
                                <div className="flex-shrink-0">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="text-xl font-bold">{level.title}</div>
                                    <div className="text-sm opacity-90">{level.description}</div>
                                </div>
                                <div className="flex-shrink-0">
                                    {isCompleted && (
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Ukończono
                                        </Badge>
                                    )}
                                    {isLocked && (
                                        <Badge className="bg-black/20 text-white border-white/30">
                                            <Lock className="w-3 h-3 mr-1" />
                                            Zablokowane
                                        </Badge>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
