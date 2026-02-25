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
        { id: 1, nameKey: 'level.1.name', icon: Zap, color: 'from-yellow-500 to-orange-500', descKey: 'level.1.desc' },
        { id: 2, nameKey: 'level.2.name', icon: LinkIcon, color: 'from-purple-500 to-indigo-500', descKey: 'level.2.desc' },
        { id: 3, nameKey: 'level.3.name', icon: Package, color: 'from-teal-500 to-cyan-500', descKey: 'level.3.desc' },
        { id: 4, nameKey: 'level.4.name', icon: Search, color: 'from-emerald-500 to-teal-500', descKey: 'level.4.desc' },
        { id: 5, nameKey: 'level.5.name', icon: Shield, color: 'from-red-500 to-orange-500', descKey: 'level.5.desc' },
    ];

    const handleStart = () => {
        if (playerName.trim()) {
            onStart(playerName.trim());
            onLevelClick?.(1);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with settings */}
                <div className="flex justify-end gap-4 mb-8">
                    <LanguageToggle />
                    <Button variant="ghost" size="icon" onClick={toggleSound} className="text-muted-foreground hover:text-foreground">
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-muted-foreground hover:text-foreground">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl md:text-8xl mb-4">
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
                            <Database className="w-3 h-3 mr-1" /> Darwin Core
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
                                    <Gamepad2 className="w-6 h-6 text-primary" />
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
                                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                                        className="bg-muted/50 border-border text-foreground text-lg py-6"
                                    />
                                </div>

                                <Button onClick={handleStart} disabled={!playerName.trim()} size="lg" className="w-full py-6 text-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90">
                                    <Play className="w-6 h-6 mr-2" />
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
                                                layoutId={`level-${level.id}`}
                                                onClick={() => onLevelClick?.(level.id)}
                                                disabled={!unlocked || !playerName.trim()}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.1 }}
                                                whileHover={unlocked && playerName.trim() ? { scale: 1.05 } : {}}
                                                whileTap={unlocked && playerName.trim() ? { scale: 0.98 } : {}}
                                                className={`p-4 rounded-xl bg-gradient-to-br ${level.color} bg-opacity-10 border border-border/50 hover:border-border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left ${!unlocked ? 'opacity-30' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <LevelIcon className="w-5 h-5 text-white" />
                                                    <span className="font-semibold text-white text-sm">{t(level.nameKey)}</span>
                                                    {!unlocked && <span className="text-xs text-white/60 ml-auto">🔒</span>}
                                                </div>
                                                <p className="text-xs text-white/80">{t(level.descKey)}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Custom Data Package Option */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={onDataImport}
                                    className="w-full p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50 hover:border-primary transition-colors cursor-pointer text-left"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Database className="w-5 h-5 text-primary" />
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
                                    <Trophy className="w-5 h-5 text-yellow-500" />
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
                                    <BookOpen className="w-5 h-5 text-accent" />
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
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-sm">{link.label}</span>
                                    </a>
                                ))}
                            </CardContent>
                        </Card>

                        {/* How to Play */}
                        <Button variant="outline" className="w-full border-border text-muted-foreground hover:bg-muted" onClick={() => setShowTutorial(!showTutorial)}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            {t('start.howToPlay')}
                        </Button>

                        {showTutorial && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-card/80 border border-border">
                                <h4 className="font-semibold text-foreground mb-2">{t('start.tutorial.title')}</h4>
                                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                    <li>{t('start.tutorial.1')}</li>
                                    <li>{t('start.tutorial.2')}</li>
                                    <li>{t('start.tutorial.3')}</li>
                                    <li>{t('start.tutorial.4')}</li>
                                    <li>{t('start.tutorial.5')}</li>
                                </ol>
                                <p className="text-xs text-muted-foreground/70 mt-3">{t('start.tutorial.time')}</p>
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
