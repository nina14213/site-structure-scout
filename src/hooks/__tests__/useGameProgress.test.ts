/**
 * @file useGameProgress.test.ts
 * @description Testy hooka useGameProgress — weryfikacja zarządzania postępem gry.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameProgress } from '@/hooks/useGameProgress';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useGameProgress', () => {
  it('inicjalizuje z pustym stanem', () => {
    const { result } = renderHook(() => useGameProgress());
    expect(result.current.gameState.playerName).toBe('');
    expect(result.current.gameState.totalScore).toBe(0);
    expect(result.current.gameState.levelsCompleted).toEqual([]);
  });

  it('startNewGame ustawia nazwę gracza', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Testowy Gracz'));
    expect(result.current.gameState.playerName).toBe('Testowy Gracz');
    expect(result.current.gameState.playerId).toMatch(/^\d{6}$/);
    expect(result.current.gameState.startTime).not.toBeNull();
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

  it('resetProgress czyści stan gry', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.addScore(500));
    act(() => result.current.resetProgress());
    expect(result.current.gameState.playerName).toBe('');
    expect(result.current.gameState.totalScore).toBe(0);
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
    expect(result.current.gameState.levelProgress[1]).toBe(100);
    expect(result.current.getRecommendedLevel()).toBe(2);
  });
});
