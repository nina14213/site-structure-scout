import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Download, Share2, RotateCcw, Sparkles, Award, Target, BookOpen, CheckCircle } from 'lucide-react';
import { GameState, Badge as BadgeType } from '@/hooks/useGameProgress';
import { useLanguage } from '@/i18n/LanguageContext';

interface GameCompleteProps {
    gameState: GameState;
    leaderboard?: unknown[];
    badges: Record<string, BadgeType>;
    onRestart: () => void;
    playBadgeUnlock?: () => void;
}

export default function GameComplete({ gameState, badges, onRestart, playBadgeUnlock }: GameCompleteProps) {
    const { t } = useLanguage();
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setAnimationPhase(1), 500),
            setTimeout(() => setAnimationPhase(2), 1500),
            setTimeout(() => setAnimationPhase(3), 2500),
            setTimeout(() => {
                setAnimationPhase(4);
                playBadgeUnlock?.();
            }, 3500)
        ];
        return () => timers.forEach(clearTimeout);
    }, [playBadgeUnlock]);

    const getBadgeInfo = (badgeId: string) => {
        return Object.values(badges).find(b => b.id === badgeId);
    };

    const generateCertificate = () => {
        const certHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>DwC Data Quest Certificate</title>
    <style>
        body { font-family: 'Georgia', serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .certificate { background: white; padding: 60px; border: 10px solid gold; max-width: 800px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { font-size: 48px; color: #4338ca; margin-bottom: 20px; }
        .name { font-size: 36px; font-weight: bold; color: #1e40af; margin: 30px 0; }
        .score { font-size: 24px; color: #059669; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>🏆 Certificate of Mastery 🏆</h1>
        <p style="font-size: 20px;">This certifies that</p>
        <div class="name">${gameState?.playerName || 'Data Ranger'}</div>
        <p style="font-size: 18px;">has successfully completed all missions and demonstrated mastery of</p>
        <h2 style="color: #4338ca;">GBIF Darwin Core Data Package (DwC-DP)</h2>
        <div class="score">
            <strong>Total Score:</strong> ${gameState?.totalScore || 0} points
        </div>
        <div style="margin-top: 40px; font-size: 14px; color: #666;">
            Completed: ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>
        `;
        
        const blob = new Blob([certHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dwc-certificate.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 p-4 md:p-6 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                {/* Confetti Animation */}
                <AnimatePresence>
                    {animationPhase >= 1 && (
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 pointer-events-none z-50">
                            {[...Array(50)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ top: '50%', left: '50%', x: 0, y: 0 }}
                                    animate={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, x: (Math.random() - 0.5) * 1000, y: (Math.random() - 0.5) * 1000, rotate: Math.random() * 720 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="absolute w-3 h-3 rounded-full"
                                    style={{ backgroundColor: ['#fbbf24', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'][i % 5] }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="inline-block mb-4">
                        <Trophy className="w-24 h-24 text-yellow-500 dark:text-yellow-400 mx-auto" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('complete.congrats')} {gameState?.playerName || 'Data Ranger'}!
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-slate-400">{t('complete.allMissions')}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white/90 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{gameState?.totalScore || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('complete.points')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <Target className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{gameState?.levelsCompleted?.length || 0}/4</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('complete.levels')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur">
                        <CardContent className="pt-6 text-center">
                            <Award className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{gameState?.badges?.length || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">{t('complete.badges')}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className="mb-8 bg-white/90 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                                {t('complete.yourBadges')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gameState?.badges?.map((badgeId, idx) => {
                                    const badge = getBadgeInfo(badgeId);
                                    return (
                                        <motion.div key={badgeId} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + (idx * 0.2) }} className="text-center">
                                            <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-3xl">{badge?.icon || '🏆'}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{badge?.name || 'Badge'}</div>
                                            <div className="text-xs text-gray-600 dark:text-slate-400">{badge?.description || ''}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                    <Card className="mb-8 bg-white/90 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                {t('complete.missionSummary')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { id: 1, name: t('level.1.name'), icon: '⚡' },
                                    { id: 2, name: t('level.2.name'), icon: '🔗' },
                                    { id: 3, name: t('level.3.name'), icon: '📦' },
                                    { id: 4, name: t('level.4.name'), icon: '🧬' },
                                    { id: 5, name: t('level.5.name'), icon: '👹' }
                                ].map((level) => (
                                    <div key={level.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600">
                                        <span className="text-2xl">{level.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-white">{level.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400">{gameState?.levelScores?.[level.id] || 0} points</div>
                                        </div>
                                        <Badge className="bg-green-500 dark:bg-green-600 text-white">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {t('levelSelect.completed')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={generateCertificate} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        {t('complete.downloadCert')}
                    </Button>
                    <Button
                        onClick={() => {
                            const text = t('complete.shareText', { score: String(gameState?.totalScore || 0) });
                            navigator.clipboard.writeText(text);
                        }}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        size="lg"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('complete.share')}
                    </Button>
                    <Button onClick={onRestart} variant="outline" className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-500/10" size="lg">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('complete.playAgain')}
                    </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center mt-8">
                    <p className="text-sm text-gray-600 dark:text-slate-400">{t('complete.thanks')}</p>
                </motion.div>
            </div>
        </div>
    );
}
