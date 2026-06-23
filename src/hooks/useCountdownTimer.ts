import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

interface UseCountdownTimerOptions {
  isRunning: boolean;
  timeLeft: number;
  setTimeLeft: Dispatch<SetStateAction<number>>;
  onExpire?: () => void;
  intervalMs?: number;
}

// PL: Hermetyzuje odliczanie, aby poziomy gry mialy tylko stan i reakcje na koniec czasu.
// EN: Encapsulates countdown behavior so game levels keep only state and expiry reactions.
export function useCountdownTimer({
  isRunning,
  timeLeft,
  setTimeLeft,
  onExpire,
  intervalMs = 1000,
}: UseCountdownTimerOptions) {
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          onExpire?.();
          return 0;
        }

        return previous - 1;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isRunning, timeLeft, setTimeLeft, onExpire, intervalMs]);
}
