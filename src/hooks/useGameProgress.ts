import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dwc-data-quest-progress';
const LEADERBOARD_KEY = 'dwc-data-quest-leaderboard';
const TOTAL_LEVELS = 5;
const INITIAL_LEVEL_PROGRESS = 10;

export interface GameState {
    playerName: string;
    playerId: string;
    currentLevel: number;
    totalScore: number;
    badges: string[];
    levelsCompleted: number[];
    quizScores: Record<number, number>;
    timePlayed: number;
    startTime: number | null;
    levelScores: Record<number, number>;
    levelProgress: Record<number, number>;
}

export interface LeaderboardEntry {
    name: string;
    playerId?: string;
    score: number;
    badges: number;
    levelsCompleted: number;
    date: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (state: GameState, levelTime?: number) => boolean;
}

const initialState: GameState = {
    playerName: '',
    playerId: '',
    currentLevel: 1,
    totalScore: 0,
    badges: [],
    levelsCompleted: [],
    quizScores: {},
    timePlayed: 0,
    startTime: null,
    levelScores: {},
    levelProgress: {}
};

const generatePlayerId = () => Math.floor(100000 + Math.random() * 900000).toString();

const clampProgress = (progress: number) => Math.max(0, Math.min(100, Math.round(progress)));

const createLeaderboardEntry = (state: GameState): LeaderboardEntry => ({
    name: state.playerName,
    playerId: state.playerId,
    score: state.totalScore,
    badges: state.badges.length,
    levelsCompleted: state.levelsCompleted.length,
    date: new Date().toISOString()
});

const upsertLeaderboardEntry = (entries: LeaderboardEntry[], state: GameState) => {
    const entry = createLeaderboardEntry(state);
    const filtered = entries.filter(existing => {
        if (!state.playerId) return existing.name !== state.playerName;
        return existing.playerId
            ? existing.playerId !== state.playerId
            : existing.name !== state.playerName;
    });

    return [...filtered, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
};

const normalizeGameState = (saved: Partial<GameState>): GameState => {
    const levelsCompleted = Array.isArray(saved.levelsCompleted) ? saved.levelsCompleted : [];
    const levelProgress = { ...(saved.levelProgress ?? {}) };

    levelsCompleted.forEach(level => {
        levelProgress[level] = 100;
    });

    return {
        ...initialState,
        ...saved,
        playerId: saved.playerId || (saved.playerName ? generatePlayerId() : ''),
        badges: Array.isArray(saved.badges) ? saved.badges : [],
        levelsCompleted,
        quizScores: saved.quizScores ?? {},
        levelScores: saved.levelScores ?? {},
        levelProgress
    };
};

export const BADGES: Record<string, Badge> = {
    CORE_MASTER: {
        id: 'core_master',
        name: 'Core Master',
        description: 'Ukończ Core Forge z wynikiem 100%',
        icon: '🏆',
        condition: (state) => state.levelsCompleted.includes(1) && state.quizScores[1] >= 100
    },
    LINK_RANGER: {
        id: 'link_ranger',
        name: 'Link Ranger',
        description: 'Poprawnie połącz wszystkie extensions',
        icon: '🔗',
        condition: (state) => state.levelsCompleted.includes(2)
    },
    VALIDATOR_PRO: {
        id: 'validator_pro',
        name: 'Validator Pro',
        description: 'Przejdź walidację GBIF bez błędów',
        icon: '✅',
        condition: (state) => state.levelsCompleted.includes(4)
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Ukończ poziom w mniej niż 3 minuty',
        icon: '⚡',
        condition: (state, levelTime) => (levelTime ?? 999) < 180
    },
    COMPLETIONIST: {
        id: 'completionist',
        name: 'Completionist',
        description: 'Ukończ wszystkie 4 misje',
        icon: '🎖️',
        condition: (state) => state.levelsCompleted.length >= 4
    },
    QUIZ_MASTER: {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Odpowiedz poprawnie na wszystkie pytania quizowe',
        icon: '🧠',
        condition: (state) => Object.values(state.quizScores).every(s => s === 100)
    },
    DATA_RANGER: {
        id: 'data_ranger',
        name: 'Data Ranger Elite',
        description: 'Zdobądź ponad 1000 punktów',
        icon: '🦸',
        condition: (state) => state.totalScore >= 1000
    }
};

export function useGameProgress() {
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [levelStartTime, setLevelStartTime] = useState<number | null>(null);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = normalizeGameState(JSON.parse(saved));
                setGameState(parsed);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch (e) {
                console.error('Failed to parse saved progress:', e);
            }
        }

        const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
        if (savedLeaderboard) {
            try {
                setLeaderboard(JSON.parse(savedLeaderboard));
            } catch (e) {
                console.error('Failed to parse leaderboard:', e);
            }
        }
    }, []);

    // Keep leaderboard in sync with the current player's live score.
    useEffect(() => {
        if (!gameState.playerName) return;

        setLeaderboard(prev => {
            const newLeaderboard = upsertLeaderboardEntry(prev, gameState);
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
            return newLeaderboard;
        });
    }, [gameState]);

    // Save to localStorage
    const saveProgress = useCallback((state: GameState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, []);

    // Start new game
    const startNewGame = useCallback((playerName: string) => {
        const newState: GameState = {
            ...initialState,
            playerName,
            playerId: generatePlayerId(),
            levelProgress: {},
            levelScores: {},
            currentLevel: 1,
            startTime: Date.now()
        };
        setGameState(newState);
        saveProgress(newState);
    }, [saveProgress]);

    // Update player name
    const setPlayerName = useCallback((name: string) => {
        setGameState(prev => {
            const newState = { ...prev, playerName: name };
            saveProgress(newState);
            return newState;
        });
    }, [saveProgress]);

    // Add score
    const addScore = useCallback((points: number, _reason = '') => {
        setGameState(prev => {
            const newScore = prev.totalScore + points;
            const newState = { ...prev, totalScore: newScore };
            saveProgress(newState);
            return newState;
        });
    }, [saveProgress]);

    // Mark a level as started or resumed
    const startLevel = useCallback((levelNumber: number) => {
        setGameState(prev => {
            const existingProgress = prev.levelProgress[levelNumber] ?? 0;
            const levelProgress = prev.levelsCompleted.includes(levelNumber)
                ? 100
                : Math.max(existingProgress, INITIAL_LEVEL_PROGRESS);

            const newState: GameState = {
                ...prev,
                currentLevel: levelNumber,
                levelProgress: {
                    ...prev.levelProgress,
                    [levelNumber]: clampProgress(levelProgress)
                }
            };

            saveProgress(newState);
            return newState;
        });
    }, [saveProgress]);

    // Complete level
    const completeLevel = useCallback((levelNumber: number, levelScore = 0) => {
        const levelTime = levelStartTime ? (Date.now() - levelStartTime) / 1000 : 0;

        setGameState(prev => {
            const newCompleted = prev.levelsCompleted.includes(levelNumber)
                ? prev.levelsCompleted
                : [...prev.levelsCompleted, levelNumber];

            const newState: GameState = {
                ...prev,
                levelsCompleted: newCompleted,
                currentLevel: Math.min(Math.max(prev.currentLevel, levelNumber + 1), TOTAL_LEVELS),
                totalScore: prev.totalScore + levelScore,
                levelScores: {
                    ...prev.levelScores,
                    [levelNumber]: Math.max(prev.levelScores[levelNumber] ?? 0, levelScore)
                },
                levelProgress: {
                    ...prev.levelProgress,
                    [levelNumber]: 100
                }
            };

            // Check for new badges
            const newBadges = [...prev.badges];
            Object.values(BADGES).forEach(badge => {
                if (!newBadges.includes(badge.id) && badge.condition(newState, levelTime)) {
                    newBadges.push(badge.id);
                }
            });
            newState.badges = newBadges;

            saveProgress(newState);
            return newState;
        });

        setLevelStartTime(null);
    }, [saveProgress, levelStartTime]);

    // Start level timer
    const startLevelTimer = useCallback(() => {
        setLevelStartTime(Date.now());
    }, []);

    // Save quiz score
    const saveQuizScore = useCallback((levelNumber: number, score: number) => {
        setGameState(prev => {
            const newQuizScores = { ...prev.quizScores, [levelNumber]: score };
            const newState: GameState = { ...prev, quizScores: newQuizScores };

            // Check quiz master badge
            if (!prev.badges.includes('quiz_master') && BADGES.QUIZ_MASTER.condition(newState)) {
                newState.badges = [...prev.badges, 'quiz_master'];
            }

            saveProgress(newState);
            return newState;
        });
    }, [saveProgress]);

    // Award badge manually
    const awardBadge = useCallback((badgeId: string) => {
        setGameState(prev => {
            if (prev.badges.includes(badgeId)) return prev;
            const newState = { ...prev, badges: [...prev.badges, badgeId] };
            saveProgress(newState);
            return newState;
        });
    }, [saveProgress]);

    // Update leaderboard
    const updateLeaderboard = useCallback(() => {
        if (!gameState.playerName) return;

        setLeaderboard(prev => {
            const newLeaderboard = upsertLeaderboardEntry(prev, gameState);
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
            return newLeaderboard;
        });
    }, [gameState]);

    // Reset progress
    const resetProgress = useCallback(() => {
        setGameState(initialState);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Get badge info
    const getBadgeInfo = useCallback((badgeId: string) => {
        return Object.values(BADGES).find(b => b.id === badgeId);
    }, []);

    // Get saved progress for a specific level
    const getLevelProgress = useCallback((levelNumber: number) => {
        if (gameState.levelsCompleted.includes(levelNumber)) return 100;
        return clampProgress(gameState.levelProgress[levelNumber] ?? 0);
    }, [gameState.levelProgress, gameState.levelsCompleted]);

    // Check if level is unlocked
    const isLevelUnlocked = useCallback((levelNumber: number) => {
        if (levelNumber !== 5) return true;
        return [1, 2, 3, 4].every(level => gameState.levelsCompleted.includes(level));
    }, [gameState.levelsCompleted]);

    // Get the best level to continue from the menu
    const getRecommendedLevel = useCallback(() => {
        const savedCurrentLevel = Math.min(Math.max(gameState.currentLevel || 1, 1), TOTAL_LEVELS);

        if (isLevelUnlocked(savedCurrentLevel) && !gameState.levelsCompleted.includes(savedCurrentLevel)) {
            return savedCurrentLevel;
        }

        const inProgressLevel = [1, 2, 3, 4, 5].find(level => {
            const progress = getLevelProgress(level);
            return progress > 0 && progress < 100 && isLevelUnlocked(level);
        });

        if (inProgressLevel) return inProgressLevel;

        return [1, 2, 3, 4, 5].find(level => !gameState.levelsCompleted.includes(level) && isLevelUnlocked(level)) ?? TOTAL_LEVELS;
    }, [gameState.currentLevel, gameState.levelsCompleted, getLevelProgress, isLevelUnlocked]);

    // Get progress percentage
    const getProgressPercentage = useCallback(() => {
        return (gameState.levelsCompleted.length / TOTAL_LEVELS) * 100;
    }, [gameState.levelsCompleted]);

    return {
        gameState,
        leaderboard,
        badges: BADGES,
        startNewGame,
        setPlayerName,
        addScore,
        startLevel,
        completeLevel,
        startLevelTimer,
        saveQuizScore,
        awardBadge,
        updateLeaderboard,
        resetProgress,
        getBadgeInfo,
        getLevelProgress,
        isLevelUnlocked,
        getRecommendedLevel,
        getProgressPercentage
    };
}

export default useGameProgress;
