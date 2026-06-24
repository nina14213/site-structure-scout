/**
 * @file useGameNavigation.ts
 * @description Hook zarządzający nawigacją między ekranami gry.
 *
 * Obsługuje:
 * - Przejścia między ekranami (start → playing → quiz → complete)
 * - Logikę ukończenia poziomu i quizu
 * - Import danych i Schema Mapper
 * - Dark mode z persystencją w localStorage
 * - Ochronę przed podwójnym przejściem (transitioning ref guard)
 */

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import type { GameState } from '@/hooks/useGameProgress';
import type { AssistantId } from '@/lib/assistants';

export type GameScreen = 'start' | 'playing' | 'complete' | 'schemaMapper' | 'quiz';

/** Nazwy poziomów indeksowane numerem */
const LEVEL_NAME_KEYS: Record<number, string> = {
  1: 'level.1.name',
  2: 'level.2.name',
  3: 'level.3.name',
  4: 'level.4.name',
  5: 'level.5.name',
};

/** Maksymalny numer poziomu — po nim gra jest ukończona */
const MAX_LEVEL = 5;

interface UseGameNavigationOptions {
  startNewGame: (name: string, assistantId?: AssistantId) => void;
  startFreshGame: (name: string, assistantId?: AssistantId) => void;
  setAssistantId: (assistantId: AssistantId) => void;
  startLevel: (level: number) => void;
  completeLevel: (level: number, score: number) => void;
  updateLeaderboard: () => void;
  saveQuizScore: (level: number, score: number) => void;
  startLevelTimer: () => void;
  resetProgress: () => void;
  isLevelUnlocked: (level: number) => boolean;
  gameState: GameState;
}

export function useGameNavigation({
  startNewGame,
  startFreshGame,
  setAssistantId,
  startLevel,
  completeLevel,
  updateLeaderboard,
  saveQuizScore,
  startLevelTimer,
  resetProgress,
  isLevelUnlocked,
  gameState,
}: UseGameNavigationOptions) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [levelData, setLevelData] = useState<Record<number | string, unknown>>({});
  const [quizLevel, setQuizLevel] = useState<number | null>(null);
  const [pendingScore, setPendingScore] = useState<number>(0);
  const transitioning = useRef(false);

  // ─── Dark mode ────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('dwc-dark-mode');
      if (saved === 'false') {
        document.documentElement.classList.remove('dark');
        return false;
      }
    } catch {
      // localStorage can be unavailable in restricted browser modes.
    }
    document.documentElement.classList.add('dark');
    return true;
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem('dwc-dark-mode', String(next));
      } catch {
        // localStorage can be unavailable in restricted browser modes.
      }
      return next;
    });
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────
  const getLevelName = useCallback((level: number) => {
    return t(LEVEL_NAME_KEYS[level] || `level.${level}.name`);
  }, [t]);

  // ─── Game start ───────────────────────────────────────────────────
  const handleStartGame = useCallback((playerName: string, targetLevel = 1, assistantId?: AssistantId) => {
    const normalizedLevel = Math.min(Math.max(targetLevel, 1), MAX_LEVEL);
    const samePlayer = Boolean(gameState.playerId) && gameState.playerName === playerName;
    const canOpenLevel = samePlayer ? isLevelUnlocked(normalizedLevel) : normalizedLevel !== MAX_LEVEL;
    const levelToOpen = canOpenLevel ? normalizedLevel : 1;

    if (!samePlayer) {
      startNewGame(playerName, assistantId);
    } else if (assistantId) {
      setAssistantId(assistantId);
    }

    startLevel(levelToOpen);
    setCurrentLevel(levelToOpen);
    setCurrentScreen('playing');
    startLevelTimer();

    toast({
      title: t('toast.welcome', { name: playerName }),
      description: t('toast.welcomeDesc'),
    });
  }, [gameState.playerId, gameState.playerName, isLevelUnlocked, setAssistantId, startLevel, startLevelTimer, startNewGame, toast, t]);

  const handleStartOver = useCallback((playerName: string, assistantId?: AssistantId) => {
    const cleanName = playerName.trim();
    if (!cleanName) return;

    transitioning.current = false;
    startFreshGame(cleanName, assistantId);
    startLevel(1);
    setCurrentLevel(1);
    setCurrentScreen('playing');
    setLevelData({});
    setQuizLevel(null);
    setPendingScore(0);
    startLevelTimer();

    toast({
      title: t('toast.startOver', { name: cleanName }),
      description: t('toast.startOverDesc'),
    });
  }, [startFreshGame, startLevel, startLevelTimer, toast, t]);

  // ─── Level selection ──────────────────────────────────────────────
  const handleLevelClick = useCallback((levelId: number) => {
    if (isLevelUnlocked(levelId) && gameState.playerName) {
      startLevel(levelId);
      setCurrentLevel(levelId);
      setCurrentScreen('playing');
      startLevelTimer();
    }
  }, [isLevelUnlocked, gameState.playerName, startLevel, startLevelTimer]);

  // ─── Level completion → quiz ──────────────────────────────────────
  const handleLevelComplete = useCallback((score: number, data?: unknown) => {
    if (currentLevel === null || transitioning.current) return;
    transitioning.current = true;

    if (data) {
      setLevelData(prev => ({ ...prev, [currentLevel]: data }));
    }

    completeLevel(currentLevel, score);
    updateLeaderboard();

    setPendingScore(score);
    setQuizLevel(currentLevel);
    setCurrentScreen('quiz');
  }, [currentLevel, completeLevel, updateLeaderboard]);

  // ─── Quiz handlers ────────────────────────────────────────────────
  const handleQuizComplete = useCallback((quizScore: number) => {
    if (quizLevel === null) return;
    saveQuizScore(quizLevel, quizScore);
  }, [quizLevel, saveQuizScore]);

  const handleQuizClose = useCallback(() => {
    if (quizLevel === null) return;
    transitioning.current = false;
    const nextLevel = quizLevel + 1;

    if (quizLevel >= MAX_LEVEL) {
      toast({
        title: t('toast.allComplete', { level: getLevelName(quizLevel) }),
        description: t('toast.allCompleteDesc'),
      });
      setCurrentScreen('complete');
    } else if (!isLevelUnlocked(nextLevel)) {
      toast({
        title: t('toast.levelComplete', { level: getLevelName(quizLevel) }),
        description: t('toast.nextLevelLocked', { next: getLevelName(nextLevel) }),
      });
      setCurrentLevel(null);
      setCurrentScreen('start');
    } else {
      toast({
        title: t('toast.levelComplete', { level: getLevelName(quizLevel) }),
        description: t('toast.nextLevel', { next: getLevelName(nextLevel) }),
      });
      startLevel(nextLevel);
      setCurrentLevel(nextLevel);
      setCurrentScreen('playing');
      startLevelTimer();
    }
    setQuizLevel(null);
  }, [quizLevel, toast, startLevel, startLevelTimer, isLevelUnlocked, t, getLevelName]);

  // ─── Navigation ───────────────────────────────────────────────────
  const handleBackToMenu = useCallback(() => {
    setCurrentScreen('start');
    setCurrentLevel(null);
  }, []);

  const handleRestart = useCallback(() => {
    resetProgress();
    setCurrentScreen('start');
    setCurrentLevel(null);
    setLevelData({});
    setQuizLevel(null);
  }, [resetProgress]);

  // ─── Data import flow ─────────────────────────────────────────────
  const handleDataImport = useCallback(() => {
    setCurrentScreen('schemaMapper');
  }, []);

  const handleImportComplete = useCallback((data: unknown[], columns: string[], fileName: string) => {
    setLevelData(prev => ({ ...prev, customImport: { data, columns, fileName } }));
    toast({
      title: t('toast.dataImported'),
      description: t('toast.dataImportedDesc', { count: String(data.length), file: fileName }),
    });
    setCurrentScreen('schemaMapper');
  }, [toast, t]);

  const handleSchemaMappingComplete = useCallback((mappings: Record<string, string>, schema: string) => {
    setLevelData(prev => ({ ...prev, schemaMappings: mappings, selectedSchema: schema }));
    toast({
      title: t('toast.mappingComplete'),
      description: t('toast.mappingCompleteDesc', { schema }),
    });
  }, [toast, t]);

  const handleBackToDataImport = useCallback(() => {
    setCurrentScreen('schemaMapper');
  }, []);

  return {
    currentScreen,
    currentLevel,
    levelData,
    quizLevel,
    darkMode,
    toggleDarkMode,
    handleStartGame,
    handleStartOver,
    handleLevelClick,
    handleLevelComplete,
    handleQuizComplete,
    handleQuizClose,
    handleBackToMenu,
    handleRestart,
    handleDataImport,
    handleImportComplete,
    handleSchemaMappingComplete,
    handleBackToDataImport,
  };
}
