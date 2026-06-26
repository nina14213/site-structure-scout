/**
 * @file useGameProgress.test.ts
 * @description Testy hooka useGameProgress — weryfikacja zarządzania postępem gry.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameProgress } from '@/hooks/useGameProgress';

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.clearAllMocks();
});

describe('useGameProgress', () => {
  it('inicjalizuje z pustym stanem', () => {
    const { result } = renderHook(() => useGameProgress());
    expect(result.current.gameState.playerName).toBe('');
    expect(result.current.gameState.assistantId).toBe('octavia');
    expect(result.current.gameState.totalScore).toBe(0);
    expect(result.current.gameState.levelsCompleted).toEqual([]);
  });

  it('startNewGame ustawia nazwę gracza', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Testowy Gracz'));
    expect(result.current.gameState.playerName).toBe('Testowy Gracz');
    expect(result.current.gameState.playerId).toMatch(/^\d{6}$/);
    expect(result.current.gameState.assistantId).toBe('octavia');
    expect(result.current.gameState.startTime).not.toBeNull();
  });

  it('zapisuje wybranego asystenta gracza', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Testowy Gracz', 'liliana'));
    expect(result.current.gameState.assistantId).toBe('liliana');
    act(() => result.current.setAssistantId('borys'));
    expect(result.current.gameState.assistantId).toBe('borys');
  });

  it('startLevel zapisuje aktualny poziom i postęp modułu', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.startLevel(2));
    expect(result.current.gameState.currentLevel).toBe(2);
    expect(result.current.gameState.levelProgress[2]).toBe(10);
    expect(result.current.getLevelProgress(2)).toBe(10);
  });

  it('addScore zwiększa wynik', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.addScore(100));
    expect(result.current.gameState.totalScore).toBe(100);
    act(() => result.current.addScore(50));
    expect(result.current.gameState.totalScore).toBe(150);
  });

  it('wpisuje aktualny wynik gracza na leaderboard', async () => {
    const { result } = renderHook(() => useGameProgress());

    act(() => result.current.startNewGame('Krystian'));
    await waitFor(() => {
      expect(result.current.leaderboard[0]?.score).toBe(0);
    });

    act(() => result.current.addScore(125));
    await waitFor(() => {
      const entry = result.current.leaderboard.find(item => item.playerId === result.current.gameState.playerId);
      expect(entry?.name).toBe('Krystian');
      expect(entry?.score).toBe(125);
    });

    const savedLeaderboard = JSON.parse(localStorage.getItem('dwc-data-quest-leaderboard') || '[]');
    expect(savedLeaderboard[0].score).toBe(125);
  });

  it('does not write demo session scores to leaderboard', async () => {
    window.history.replaceState({}, '', '/?demo=1');
    const { result } = renderHook(() => useGameProgress());

    act(() => result.current.startNewGame('Demo GBIF'));
    expect(result.current.gameState.isDemoSession).toBe(true);

    act(() => result.current.addScore(125));
    act(() => result.current.updateLeaderboard());

    await waitFor(() => {
      expect(result.current.leaderboard).toEqual([]);
    });
    expect(localStorage.getItem('dwc-data-quest-leaderboard')).toBeNull();
  });

  it('completeLevel dodaje poziom do ukończonych', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.startLevelTimer());
    act(() => result.current.completeLevel(1, 200));
    expect(result.current.gameState.levelsCompleted).toContain(1);
    expect(result.current.gameState.totalScore).toBe(200);
    expect(result.current.gameState.levelScores[1]).toBe(200);
    expect(result.current.gameState.levelProgress[1]).toBe(100);
  });

  it('completeLevel nie dodaje duplikatów', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.startLevelTimer());
    act(() => result.current.completeLevel(1, 100));
    act(() => result.current.startLevelTimer());
    act(() => result.current.completeLevel(1, 50));
    expect(result.current.gameState.levelsCompleted.filter(l => l === 1)).toHaveLength(1);
  });

  it('saveQuizScore zapisuje wynik quizu', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.saveQuizScore(1, 100));
    expect(result.current.gameState.quizScores[1]).toBe(100);
  });

  it('resetProgress czyści stan gry i bieżący wpis rankingu', async () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    const playerId = result.current.gameState.playerId;
    act(() => result.current.addScore(500));

    await waitFor(() => {
      expect(result.current.leaderboard.find(item => item.playerId === playerId)?.score).toBe(500);
    });

    act(() => result.current.resetProgress());
    expect(result.current.gameState.playerName).toBe('');
    expect(result.current.gameState.totalScore).toBe(0);

    await waitFor(() => {
      expect(result.current.leaderboard.find(item => item.playerId === playerId)).toBeUndefined();
    });
  });

  it('startFreshGame zeruje wynik aktualnego gracza i odświeża leaderboard', async () => {
    const { result } = renderHook(() => useGameProgress());

    act(() => result.current.startNewGame('Krystian'));
    const previousPlayerId = result.current.gameState.playerId;
    act(() => result.current.addScore(500));

    await waitFor(() => {
      const entry = result.current.leaderboard.find(item => item.playerId === previousPlayerId);
      expect(entry?.score).toBe(500);
    });

    act(() => result.current.startFreshGame('Krystian', 'borys'));

    expect(result.current.gameState.playerName).toBe('Krystian');
    expect(result.current.gameState.playerId).not.toBe(previousPlayerId);
    expect(result.current.gameState.assistantId).toBe('borys');
    expect(result.current.gameState.totalScore).toBe(0);
    expect(result.current.gameState.levelsCompleted).toEqual([]);

    await waitFor(() => {
      const oldEntry = result.current.leaderboard.find(item => item.playerId === previousPlayerId);
      const newEntry = result.current.leaderboard.find(item => item.playerId === result.current.gameState.playerId);
      expect(oldEntry).toBeUndefined();
      expect(newEntry?.score).toBe(0);
    });
  });

  it('blokuje BOSS level do czasu ukończenia poziomów 1-4', () => {
    const { result } = renderHook(() => useGameProgress());
    expect(result.current.isLevelUnlocked(1)).toBe(true);
    expect(result.current.isLevelUnlocked(5)).toBe(false);

    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.completeLevel(1));
    act(() => result.current.completeLevel(2));
    act(() => result.current.completeLevel(3));
    act(() => result.current.completeLevel(4));

    expect(result.current.isLevelUnlocked(5)).toBe(true);
  });

  it('persystuje stan w localStorage', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Persistent'));
    const saved = JSON.parse(localStorage.getItem('dwc-data-quest-progress') || '{}');
    expect(saved.playerName).toBe('Persistent');
    expect(saved.playerId).toMatch(/^\d{6}$/);
  });

  it('uzupełnia postęp dla starszego zapisu bez nowych pól', () => {
    localStorage.setItem('dwc-data-quest-progress', JSON.stringify({
      playerName: 'Legacy',
      currentLevel: 2,
      totalScore: 100,
      badges: [],
      levelsCompleted: [1],
      quizScores: {},
      timePlayed: 0,
      startTime: Date.now()
    }));

    const { result } = renderHook(() => useGameProgress());
    expect(result.current.gameState.playerName).toBe('Legacy');
    expect(result.current.gameState.playerId).toMatch(/^\d{6}$/);
    expect(result.current.gameState.assistantId).toBe('octavia');
    expect(result.current.gameState.levelProgress[1]).toBe(100);
    expect(result.current.getRecommendedLevel()).toBe(2);
  });
});
