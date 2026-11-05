import { useEffect, useState } from "react";

interface CountdownResult {
  minutes: number;
  seconds: number;
  display: string;
  isExpired: boolean;
  totalRemainingSeconds: number;
}

export const usePriceFreezeCountdown = (
  expiresAt: string | null | undefined,
  initialRemainingSeconds?: number
): CountdownResult => {
  const calculateRemaining = (): number => {
    if (!expiresAt) {
      return initialRemainingSeconds && initialRemainingSeconds > 0 ? initialRemainingSeconds : 0;
    }
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);

  useEffect(() => {
    setRemainingSeconds(calculateRemaining());
  }, [expiresAt, initialRemainingSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return {
    minutes: mins,
    seconds: secs,
    display,
    isExpired: remainingSeconds <= 0,
    totalRemainingSeconds: remainingSeconds,
  };
};

