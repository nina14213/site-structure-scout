/**
 * @file useGameSounds.test.ts
 * @description Testy hooka useGameSounds — weryfikacja toggle'a i konfiguracji dźwięków.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSounds } from '@/hooks/useGameSounds';

// Mock Web Audio API
const mockOscillator = {
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: { value: 0 },
  type: 'sine' as OscillatorType,
};

const mockGainNode = {
  connect: vi.fn(),
  gain: { value: 0 },
};

const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  close: vi.fn(),
};

beforeEach(() => {
  vi.useFakeTimers();
  // Must use function() constructor form for `new` to work
  (window as any).AudioContext = function() { return mockAudioContext; };
  vi.clearAllMocks();
});

describe('useGameSounds', () => {
  it('domyślnie dźwięk jest włączony', () => {
    const { result } = renderHook(() => useGameSounds());
    expect(result.current.soundEnabled).toBe(true);
  });

  it('toggleSound przełącza stan dźwięku', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(false);
    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(true);
  });

  it('playSuccess tworzy AudioContext gdy dźwięk jest włączony', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => result.current.playSuccess());
    expect(mockOscillator.start).toHaveBeenCalledOnce();
  });

  it('playSuccess nie tworzy AudioContext gdy dźwięk jest wyłączony', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => result.current.toggleSound()); // disable
    act(() => result.current.playSuccess());
    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  it('oscillator jest zatrzymywany po upływie czasu', () => {
    const { result } = renderHook(() => useGameSounds());
    act(() => result.current.playSuccess());
    act(() => vi.advanceTimersByTime(200));
    expect(mockOscillator.stop).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });
});
