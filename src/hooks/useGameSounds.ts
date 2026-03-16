/**
 * @file useGameSounds.ts
 * @description Hook obsługujący efekty dźwiękowe gry (Web Audio API).
 *
 * Generuje krótkie sygnały dźwiękowe (beepy) dla różnych zdarzeń:
 * - success: poprawna odpowiedź
 * - fail: błędna odpowiedź
 * - drop: upuszczenie elementu (drag & drop)
 * - levelComplete: ukończenie poziomu
 * - badgeUnlock: odblokowanie odznaki
 */

import { useState, useCallback } from 'react';

type SoundType = 'success' | 'fail' | 'drop' | 'levelComplete' | 'badgeUnlock';

const SOUND_CONFIGS: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  success: { freq: 880, duration: 0.1, type: 'sine' },
  fail: { freq: 220, duration: 0.2, type: 'square' },
  drop: { freq: 440, duration: 0.05, type: 'sine' },
  levelComplete: { freq: 660, duration: 0.3, type: 'triangle' },
  badgeUnlock: { freq: 1000, duration: 0.4, type: 'sine' },
};

export function useGameSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const config = SOUND_CONFIGS[type];
    oscillator.frequency.value = config.freq;
    oscillator.type = config.type;
    gainNode.gain.value = 0.1;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, config.duration * 1000);
  }, [soundEnabled]);

  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playFail = useCallback(() => playSound('fail'), [playSound]);
  const playDrop = useCallback(() => playSound('drop'), [playSound]);
  const playLevelComplete = useCallback(() => playSound('levelComplete'), [playSound]);
  const playBadgeUnlock = useCallback(() => playSound('badgeUnlock'), [playSound]);

  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);

  return {
    soundEnabled,
    toggleSound,
    playSuccess,
    playFail,
    playDrop,
    playLevelComplete,
    playBadgeUnlock,
  };
}
