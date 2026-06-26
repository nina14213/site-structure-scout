import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameNavigation } from '@/hooks/useGameNavigation';
import type { GameState } from '@/hooks/useGameProgress';

const gameState: GameState = {
  playerName: 'Krystian',
  playerId: '123456',
  assistantId: 'octavia',
  currentLevel: 4,
  totalScore: 0,
  badges: [],
  levelsCompleted: [1, 2, 4],
  quizScores: {},
  timePlayed: 0,
  startTime: Date.now(),
  levelScores: {},
  levelProgress: { 1: 100, 2: 100, 4: 100 },
  isDemoSession: false,
};

describe('useGameNavigation', () => {
  it('nie przechodzi automatycznie do BOSS, gdy poziom 5 jest zablokowany', () => {
    const startLevel = vi.fn();
    const { result } = renderHook(() => useGameNavigation({
      startNewGame: vi.fn(),
      startFreshGame: vi.fn(),
      setAssistantId: vi.fn(),
      startLevel,
      completeLevel: vi.fn(),
      updateLeaderboard: vi.fn(),
      saveQuizScore: vi.fn(),
      startLevelTimer: vi.fn(),
      resetProgress: vi.fn(),
      isLevelUnlocked: (level) => level !== 5,
      gameState,
    }));

    act(() => result.current.handleLevelClick(4));
    act(() => result.current.handleLevelComplete(40));
    expect(result.current.currentScreen).toBe('quiz');

    act(() => result.current.handleQuizClose());

    expect(result.current.currentScreen).toBe('start');
    expect(result.current.currentLevel).toBeNull();
    expect(startLevel).not.toHaveBeenCalledWith(5);
  });

  it('po wybraniu startu od nowa wraca do ekranu wyboru asystenta zamiast uruchamiać poziom', () => {
    const resetProgress = vi.fn();
    const startLevel = vi.fn();
    const startLevelTimer = vi.fn();
    const { result } = renderHook(() => useGameNavigation({
      startNewGame: vi.fn(),
      startFreshGame: vi.fn(),
      setAssistantId: vi.fn(),
      startLevel,
      completeLevel: vi.fn(),
      updateLeaderboard: vi.fn(),
      saveQuizScore: vi.fn(),
      startLevelTimer,
      resetProgress,
      isLevelUnlocked: () => true,
      gameState,
    }));

    act(() => result.current.handleLevelClick(2));
    expect(result.current.currentScreen).toBe('playing');
    expect(result.current.currentLevel).toBe(2);

    act(() => result.current.handleStartOver('Krystian', 'octavia'));

    expect(resetProgress).toHaveBeenCalledOnce();
    expect(result.current.currentScreen).toBe('start');
    expect(result.current.currentLevel).toBeNull();
    expect(startLevel).not.toHaveBeenCalledWith(1);
    expect(startLevelTimer).toHaveBeenCalledTimes(1);
  });
});
