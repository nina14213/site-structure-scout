import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Database, Package, Shield, Lock, CheckCircle, Search } from 'lucide-react';
import { GameState } from '@/hooks/useGameProgress';
import { useLanguage } from '@/i18n/LanguageContext';

interface LevelSelectionProps {
    onSelectLevel: (levelId: number) => void;
    gameState: GameState;
    isLevelUnlocked: (levelId: number) => boolean;
}

export default function LevelSelection({ onSelectLevel, gameState, isLevelUnlocked }: LevelSelectionProps) {
    const { t } = useLanguage();

    const levels = [
        {
            id: 1,
            title: t('level.1.name'),
            description: t('level.1.desc'),
            icon: Zap,
            gradient: 'from-rose-100 via-pink-100 to-fuchsia-100 hover:from-rose-200 hover:via-pink-200 hover:to-fuchsia-200',
            darkGradient: 'dark:from-[#97356a] dark:via-[#772551] dark:to-[#56173a] dark:hover:from-[#872d5e] dark:hover:via-[#691f48] dark:hover:to-[#4b1332]',
            textClass: 'text-slate-900 dark:text-white',
            completedBadgeClass: 'bg-white/80 text-slate-900 border-slate-700/20 dark:bg-black/20 dark:text-white dark:border-white/25',
            lockedBadgeClass: 'bg-white/80 text-slate-900 border-slate-700/20 dark:bg-black/20 dark:text-white dark:border-white/25'
        },
        { id: 2, title: t('level.2.name'), description: t('level.2.desc'), icon: Database, gradient: 'from-violet-100 via-purple-100 to-indigo-100 hover:from-violet-200 hover:via-purple-200 hover:to-indigo-200', darkGradient: 'dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700', textClass: 'text-slate-900 dark:text-white' },
        { id: 3, title: t('level.3.name'), description: t('level.3.desc'), icon: Package, gradient: 'from-teal-100 via-cyan-100 to-sky-100 hover:from-teal-200 hover:via-cyan-200 hover:to-sky-200', darkGradient: 'dark:from-teal-600 dark:to-cyan-600 dark:hover:from-teal-700 dark:hover:to-cyan-700', textClass: 'text-slate-900 dark:text-white' },
        { id: 4, title: t('level.4.name'), description: t('level.4.desc'), icon: Search, gradient: 'from-emerald-100 via-teal-100 to-cyan-100 hover:from-emerald-200 hover:via-teal-200 hover:to-cyan-200', darkGradient: 'dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700', textClass: 'text-slate-900 dark:text-white' },
        { id: 5, title: t('level.5.name'), description: t('level.5.desc'), icon: Shield, gradient: 'from-rose-100 via-orange-100 to-amber-100 hover:from-rose-200 hover:via-orange-200 hover:to-amber-200', darkGradient: 'dark:from-red-600 dark:to-orange-600 dark:hover:from-red-700 dark:hover:to-orange-700', textClass: 'text-slate-900 dark:text-white' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-6">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('levelSelect.title')}</h1>
                    <p className="text-gray-600 dark:text-slate-400 text-lg">
                        {t('levelSelect.welcome')} <span className="font-semibold text-indigo-600 dark:text-indigo-400">{gameState?.playerName || 'Data Ranger'}</span>!
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.totalScore || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('levelSelect.points')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.levelsCompleted?.length || 0}/5</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('levelSelect.levels')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{gameState?.badges?.length || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('levelSelect.badges')}</div>
                        </CardContent>
                    </Card>
                </motion.div>

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
                                className={`flex items-center gap-4 w-full p-6 rounded-xl bg-gradient-to-r ${level.gradient} ${level.darkGradient} ${level.textClass ?? 'text-slate-900 dark:text-white'} border border-slate-700/15 font-semibold shadow-lg shadow-primary/10 transition-all duration-200 dark:border-white/25 dark:shadow-black/25 ${
                                    isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105 cursor-pointer'
                                }`}
                            >
                                <div className="flex-shrink-0"><Icon className="w-8 h-8" /></div>
                                <div className="text-left flex-1">
                                    <div className="text-xl font-bold">{level.title}</div>
                                    <div className="text-sm opacity-90">{level.description}</div>
                                </div>
                                <div className="flex-shrink-0">
                                    {isCompleted && (
                                        <Badge className={level.completedBadgeClass ?? 'bg-white/80 text-slate-900 border-slate-700/20 dark:bg-white/20 dark:text-white dark:border-white/30'}>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {t('levelSelect.completed')}
                                        </Badge>
                                    )}
                                    {isLocked && (
                                        <Badge className={level.lockedBadgeClass ?? 'bg-white/80 text-slate-900 border-slate-700/20 dark:bg-black/20 dark:text-white dark:border-white/30'}>
                                            <Lock className="w-3 h-3 mr-1" />
                                            {t('levelSelect.locked')}
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
