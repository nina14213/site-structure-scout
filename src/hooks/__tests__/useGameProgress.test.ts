/**
 * @file useGameProgress.test.ts
 * @description Testy hooka useGameProgress — weryfikacja zarządzania postępem gry.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
    expect(result.current.gameState.startTime).not.toBeNull();
  });

  it('addScore zwiększa wynik', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.addScore(100));
    expect(result.current.gameState.totalScore).toBe(100);
    act(() => result.current.addScore(50));
    expect(result.current.gameState.totalScore).toBe(150);
  });

  it('completeLevel dodaje poziom do ukończonych', () => {
    const { result } = renderHook(() => useGameProgress());
    act(() => result.current.startNewGame('Gracz'));
    act(() => result.current.startLevelTimer());
    act(() => result.current.completeLevel(1, 200));
    expect(result.current.gameState.levelsCompleted).toContain(1);
    expect(result.current.gameState.totalScore).toBe(200);
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
  });
});
