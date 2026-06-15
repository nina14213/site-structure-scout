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
    Search,
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
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';

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
    const { t } = useLanguage();
    const [playerName, setPlayerName] = useState(gameState?.playerName || '');
    const [showTutorial, setShowTutorial] = useState(false);

    const levels = [
        { id: 1, nameKey: 'level.1.name', icon: Zap, color: 'from-amber-700 via-orange-700 to-orange-800', descKey: 'level.1.desc' },
        { id: 2, nameKey: 'level.2.name', icon: LinkIcon, color: 'from-violet-700 via-purple-700 to-indigo-800', descKey: 'level.2.desc' },
        { id: 3, nameKey: 'level.3.name', icon: Package, color: 'from-teal-700 via-cyan-700 to-sky-800', descKey: 'level.3.desc' },
        { id: 4, nameKey: 'level.4.name', icon: Search, color: 'from-emerald-700 via-teal-700 to-cyan-800', descKey: 'level.4.desc' },
        { id: 5, nameKey: 'level.5.name', icon: Shield, color: 'from-red-700 via-orange-700 to-orange-800', descKey: 'level.5.desc' },
    ];

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName.trim());
            onLevelClick?.(1);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-background dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
            <div className="max-w-6xl mx-auto">
                {/* Header with settings */}
                <div className="flex justify-end gap-4 mb-8" role="toolbar" aria-label="Ustawienia gry">
                    <LanguageToggle />
                    <AccessibilityPanel />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSound}
                        aria-label={soundEnabled ? "Wylacz dzwiek" : "Wlacz dzwiek"}
                        aria-pressed={!!soundEnabled}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" aria-hidden="true" /> : <VolumeX className="w-5 h-5" aria-hidden="true" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                        aria-label={darkMode ? "Wlacz jasny motyw" : "Wlacz ciemny motyw"}
                        aria-pressed={!!darkMode}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {darkMode ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
                    </Button>
                </div>

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl md:text-8xl mb-4" aria-hidden="true">
                        🦎
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-4">
                        DwC Data Quest
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('start.tagline')}
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <Badge variant="outline" className="text-secondary border-secondary/50">
                            <Database className="w-3 h-3 mr-1" aria-hidden="true" /> Darwin Core
                        </Badge>
                        <Badge variant="outline" className="text-primary border-primary/50">GBIF</Badge>
                        <Badge variant="outline" className="text-accent border-accent/50">DwC-DP</Badge>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Start Panel */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                        <Card className="bg-card/50 border-border backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <Gamepad2 className="w-6 h-6 text-primary" aria-hidden="true" />
                                    {t('start.startMission')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-muted-foreground">{t('start.playerNameLabel')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={t('start.playerNamePlaceholder')}
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                                        className="bg-muted/50 border-border text-foreground text-lg py-6"
                                    />
                                </div>

                                <Button onClick={handleStart} disabled={!playerName.trim()} size="lg" className="w-full py-6 text-lg bg-gradient-to-r from-emerald-700 to-cyan-800 text-white hover:brightness-110 focus-visible:ring-white/80">
                                    <Play className="w-6 h-6 mr-2" aria-hidden="true" />
                                    {t('start.startGame')}
                                </Button>

                                {/* Levels preview */}
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    {levels.map((level, idx) => {
                                        const unlocked = isLevelUnlocked ? isLevelUnlocked(level.id) : level.id === 1;
                                        const LevelIcon = level.icon;
                                        return (
                                            <motion.button
                                                key={level.id}
                                                type="button"
                                                layoutId={`level-${level.id}`}
                                                onClick={() => onLevelClick?.(level.id)}
                                                disabled={!unlocked || !playerName.trim()}
                                                aria-label={`${t(level.nameKey)}. ${t(level.descKey)}. ${unlocked ? t('start.startGame') : t('levelSelect.locked')}`}
                                                aria-describedby={`start-level-${level.id}-desc`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.1 }}
                                                whileHover={unlocked && playerName.trim() ? { scale: 1.05 } : {}}
                                                whileTap={unlocked && playerName.trim() ? { scale: 0.98 } : {}}
                                                data-task-button
                                                className={`p-4 rounded-xl bg-gradient-to-br ${level.color} border border-white/25 shadow-lg shadow-black/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left hover:border-white/60 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${!unlocked ? 'opacity-60 grayscale-[0.15]' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <LevelIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                                    <span className="font-bold text-white text-sm">{t(level.nameKey)}</span>
                                                    {!unlocked && <span className="text-xs text-white/70 ml-auto">🔒</span>}
                                                </div>
                                                <p id={`start-level-${level.id}-desc`} className="text-xs font-semibold text-white/95">{t(level.descKey)}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Custom Data Package Option */}
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={onDataImport}
                                    aria-label={`${t('start.createDataPackage')}. ${t('start.importOwnData')}`}
                                    className="w-full p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50 hover:border-primary transition-colors cursor-pointer text-left"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                                        <span className="font-semibold text-foreground">{t('start.createDataPackage')}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('start.importOwnData')}</p>
                                </motion.button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Side Panel */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                        {/* Leaderboard */}
                        <Card className="bg-card/50 border-border backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                                    <Trophy className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                                    {t('start.topRangers')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {leaderboard.length > 0 ? (
                                    <div className="space-y-2">
                                        {leaderboard.slice(0, 5).map((entry, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-400 text-slate-900' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-foreground'}`}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm text-foreground truncate max-w-[100px]">{entry.name}</span>
                                                </div>
                                                <span className="text-sm text-yellow-500 font-mono">{entry.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">{t('start.beFirst')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Links */}
                        <Card className="bg-card/50 border-border backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                                    <BookOpen className="w-5 h-5 text-accent" aria-hidden="true" />
                                    {t('start.learning')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { href: 'https://dwc.tdwg.org/terms/', label: 'Darwin Core Terms' },
                                    { href: 'https://www.gbif.org/ipt', label: 'GBIF IPT' },
                                    { href: 'https://www.gbif.org/tools/data-validator', label: 'GBIF Validator' },
                                ].map((link) => (
                                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                                        <span className="text-sm">{link.label}</span>
                                    </a>
                                ))}
                            </CardContent>
                        </Card>

                        {/* How to Play */}
                        <Button
                            variant="outline"
                            className="w-full border-border text-muted-foreground hover:bg-muted"
                            onClick={() => setShowTutorial(!showTutorial)}
                            aria-expanded={showTutorial}
                            aria-controls="start-tutorial-panel"
                        >
                            <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                            {t('start.howToPlay')}
                        </Button>

                        {showTutorial && (
                            <motion.div id="start-tutorial-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-card/80 border border-border">
                                <h4 className="font-semibold text-foreground mb-2">{t('start.tutorial.title')}</h4>
                                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                    <li>{t('start.tutorial.1')}</li>
                                    <li>{t('start.tutorial.2')}</li>
                                    <li>{t('start.tutorial.3')}</li>
                                    <li>{t('start.tutorial.4')}</li>
                                    <li>{t('start.tutorial.5')}</li>
                                </ol>
                                <p className="text-xs text-muted-foreground mt-3">{t('start.tutorial.time')}</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12 text-muted-foreground text-sm">
                    <p>🎓 {t('start.footer.project')}</p>
                    <p className="mt-1">{t('start.footer.learn')}</p>
                </motion.div>
            </div>
        </div>
    );
}
