import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dwc-data-quest-progress';
const LEADERBOARD_KEY = 'dwc-data-quest-leaderboard';

export interface GameState {
    playerName: string;
    currentLevel: number;
    totalScore: number;
    badges: string[];
    levelsCompleted: number[];
    quizScores: Record<number, number>;
    timePlayed: number;
    startTime: number | null;
    levelScores?: Record<number, number>;
}

export interface LeaderboardEntry {
    name: string;
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
    currentLevel: 1,
    totalScore: 0,
    badges: [],
    levelsCompleted: [],
    quizScores: {},
    timePlayed: 0,
    startTime: null
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
                const parsed = JSON.parse(saved);
                setGameState(prev => ({ ...prev, ...parsed }));
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

    // Save to localStorage
    const saveProgress = useCallback((state: GameState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, []);

    // Start new game
    const startNewGame = useCallback((playerName: string) => {
        const newState: GameState = {
            ...initialState,
            playerName,
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
                currentLevel: Math.max(prev.currentLevel, levelNumber + 1),
                totalScore: prev.totalScore + levelScore
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

        const entry: LeaderboardEntry = {
            name: gameState.playerName,
            score: gameState.totalScore,
            badges: gameState.badges.length,
            levelsCompleted: gameState.levelsCompleted.length,
            date: new Date().toISOString()
        };

        setLeaderboard(prev => {
            // Remove existing entry for this player
            const filtered = prev.filter(e => e.name !== gameState.playerName);
            // Add new entry and sort
            const newLeaderboard = [...filtered, entry]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10); // Top 10

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

    // Check if level is unlocked
    const isLevelUnlocked = useCallback((levelNumber: number) => {
        if (levelNumber === 1) return true;
        return gameState.levelsCompleted.includes(levelNumber - 1);
    }, [gameState.levelsCompleted]);

    // Get progress percentage
    const getProgressPercentage = useCallback(() => {
        return (gameState.levelsCompleted.length / 4) * 100;
    }, [gameState.levelsCompleted]);

    return {
        gameState,
        leaderboard,
        badges: BADGES,
        startNewGame,
        setPlayerName,
        addScore,
        completeLevel,
        startLevelTimer,
        saveQuizScore,
        awardBadge,
        updateLeaderboard,
        resetProgress,
        getBadgeInfo,
        isLevelUnlocked,
        getProgressPercentage
    };
}

export default useGameProgress;
