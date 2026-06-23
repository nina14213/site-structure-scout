export interface EscapePuzzleScoreInput {
  usedHint: boolean;
  usedClue: boolean;
  attempts: number;
}

export interface TimeBonusWindow {
  aboveSeconds: number;
  bonus: number;
}

export const DEFAULT_LEVEL_TIME_BONUSES: TimeBonusWindow[] = [
  { aboveSeconds: 240, bonus: 50 },
  { aboveSeconds: 180, bonus: 30 },
  { aboveSeconds: 60, bonus: 10 },
];

// PL: Wspolny format MM:SS dla licznikow poziomow.
// EN: Shared MM:SS formatting for level countdown timers.
export function formatCountdownTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// PL: Jedna definicja bonusu czasowego, uzywana przez poziomy z timerem.
// EN: Single time-bonus rule used by timed levels.
export function calculateTimeBonus(
  secondsLeft: number,
  windows: TimeBonusWindow[] = DEFAULT_LEVEL_TIME_BONUSES,
): number {
  return windows.find(({ aboveSeconds }) => secondsLeft > aboveSeconds)?.bonus ?? 0;
}

// PL: Normalizacja odpowiedzi gracza przed porownaniem z rozwiazaniem.
// EN: Normalizes a player answer before comparing it with the expected solution.
export function normalizeAnswerText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\.\s*/g, ". ")
    .replace(/\s*\.\s*/g, ". ")
    .trimEnd();
}

// PL: Punktacja pojedynczej zagadki w Escape Roomie z karami za podpowiedzi i proby.
// EN: Escape Room puzzle scoring with penalties for hints, clues, and attempts.
export function calculateEscapePuzzleScore({
  usedHint,
  usedClue,
  attempts,
}: EscapePuzzleScoreInput): number {
  const hintPenalty = usedHint ? 25 : 0;
  const cluePenalty = usedClue ? 25 : 0;
  const attemptPenalty = attempts * 10;

  return Math.max(10, 100 - hintPenalty - cluePenalty - attemptPenalty);
}
