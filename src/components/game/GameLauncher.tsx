import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CoreBuilder from '@/components/game/CoreBuilder';
import ExtensionLinker from '@/components/game/ExtensionLinker';
import MetaGenerator from '@/components/game/MetaGenerator';
import Validator from '@/components/game/Validator';
import SpeciesMatcher from '@/components/game/SpeciesMatcher';
import { GameState } from '@/hooks/useGameProgress';

interface GameLauncherProps {
    levelId: number;
    playerName?: string;
    gameState: GameState;
    onComplete: (score: number, data?: unknown) => void;
    onClose: () => void;
    addScore?: (points: number, reason?: string) => void;
    playSuccess?: () => void;
    playFail?: () => void;
    playDrop?: () => void;
    playLevelComplete?: () => void;
    startLevelTimer?: () => void;
    saveQuizScore?: (levelNumber: number, score: number) => void;
    previousLevelData?: unknown;
}

export default function GameLauncher({ 
    levelId, 
    gameState, 
    onComplete, 
    onClose, 
    addScore, 
    playSuccess, 
    playFail, 
    playDrop, 
    playLevelComplete, 
    startLevelTimer, 
    saveQuizScore, 
    previousLevelData 
}: GameLauncherProps) {
    const levels: Record<number, {
        title: string;
        description: string;
        color: string;
        component: React.ComponentType<any>;
    }> = {
        1: {
            title: 'Kuźnia Rdzenia',
            description: 'Mapuj swoje dane na standard Darwin Core Data Package',
            color: 'from-yellow-500 to-orange-500',
            component: CoreBuilder
        },
        2: {
            title: 'Nexus Rozszerzeń',
            description: 'Połącz extensions i sprawdź integralność danych',
            color: 'from-purple-500 to-indigo-500',
            component: ExtensionLinker
        },
        3: {
            title: 'Pieczęć Pakietu',
            description: 'Generuj meta.xml i datapackage.json',
            color: 'from-teal-500 to-cyan-500',
            component: MetaGenerator
        },
        4: {
            title: 'Łowca Gatunków',
            description: 'Dopasuj nazwy gatunków do GBIF Backbone Taxonomy',
            color: 'from-emerald-500 to-teal-500',
            component: SpeciesMatcher
        },
        5: {
            title: 'BOSS: Walidacja',
            description: 'Przeprowadź walidację danych wg standardu GBIF',
            color: 'from-red-500 to-orange-500',
            component: Validator
        }
    };

    const level = levels[levelId];
    const LevelComponent = level?.component;

    if (!LevelComponent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid level</h2>
                    <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Menu
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-4 left-4 z-50"
            >
                <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className="bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-slate-800/90 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 backdrop-blur"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Menu
                </Button>
            </motion.div>

            {/* Level Component */}
            <LevelComponent
                onComplete={onComplete}
                gameState={gameState}
                addScore={addScore}
                playSuccess={playSuccess}
                playFail={playFail}
                playDrop={playDrop}
                playLevelComplete={playLevelComplete}
                startLevelTimer={startLevelTimer}
                saveQuizScore={saveQuizScore}
                previousLevelData={previousLevelData}
            />
        </div>
    );
}
