"use client";

import { useEffect, type RefObject } from "react";
import { sleepTimerRemaining } from "@/lib/sleep-timer";

/**
 * Cuenta atrás del temporizador. Usa la marca de tiempo para sobrevivir a
 * recargas y a que el navegador ralentice los intervals en segundo plano.
 */
export function useSleepCountdown({
  sleepEndsAt,
  audioRef,
  setSleepEndsAt,
  setSleepRemainingMs,
}: {
  sleepEndsAt: number | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  setSleepEndsAt: (endsAt: number | null) => void;
  setSleepRemainingMs: (remaining: number | null) => void;
}) {
  useEffect(() => {
    if (sleepEndsAt == null) return;

    const tick = () => {
      const remaining = sleepTimerRemaining(sleepEndsAt);

      if (remaining <= 0) {
        audioRef.current?.pause();
        setSleepEndsAt(null);
        setSleepRemainingMs(null);
        return;
      }

      setSleepRemainingMs(remaining);
    };

    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [sleepEndsAt, audioRef, setSleepEndsAt, setSleepRemainingMs]);
}
