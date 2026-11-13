"use client";

import { useEffect, type RefObject } from "react";
import { parseQueue } from "@/lib/player-queue";
import { isSleepTimerDone, sleepTimerRemaining } from "@/lib/sleep-timer";
import type { ProgressPoint } from "@/lib/playback-progress";
import { PLAYBACK_RATES } from "./player-constants";
import { QUEUE_KEY, SLEEP_KEY, STORAGE_KEY } from "./player-storage";
import type { PlayerTrack } from "./player-types";

/**
 * Restaura la última sesión, la cola y el temporizador (sin autoplay: el
 * navegador lo bloquearía).
 */
export function useRestoreSession({
  pendingSeekRef,
  localProgressRef,
  setQueue,
  setSleepEndsAt,
  setSleepRemainingMs,
  setRate,
  setTime,
  setTrack,
}: {
  pendingSeekRef: RefObject<number>;
  localProgressRef: RefObject<ProgressPoint | null>;
  setQueue: (queue: PlayerTrack[]) => void;
  setSleepEndsAt: (endsAt: number | null) => void;
  setSleepRemainingMs: (remaining: number | null) => void;
  setRate: (rate: number) => void;
  setTime: (time: number) => void;
  setTrack: (track: PlayerTrack | null) => void;
}) {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const savedQueue = parseQueue(window.localStorage.getItem(QUEUE_KEY));
      const rawSleep = window.localStorage.getItem(SLEEP_KEY);

      let savedTrack: PlayerTrack | undefined;
      let savedTime = 0;
      let savedRate = 1;
      let savedAt = 0;

      if (raw) {
        const saved = JSON.parse(raw) as {
          track?: PlayerTrack;
          time?: number;
          rate?: number;
          savedAt?: number;
        };

        if (saved.track?.src) {
          savedTrack = saved.track;
          savedTime = saved.time ?? 0;
          savedRate = saved.rate ?? 1;
          savedAt = saved.savedAt ?? 0;
        }
      }

      if (savedTrack) {
        localProgressRef.current = {
          positionSec: savedTime,
          durationSec: savedTrack.durationSec,
          updatedAt: savedAt,
        };
      }

      let savedSleep: number | null = null;

      if (rawSleep) {
        const parsed = JSON.parse(rawSleep) as { endsAt?: number };

        if (
          typeof parsed.endsAt === "number" &&
          !isSleepTimerDone(parsed.endsAt)
        ) {
          savedSleep = parsed.endsAt;
        } else {
          window.localStorage.removeItem(SLEEP_KEY);
        }
      }

      // Se aplica en un microtask: leer localStorage al montar es una
      // sincronización con un sistema externo y así no provoca un render
      // en cascada dentro del efecto.
      queueMicrotask(() => {
        if (savedQueue.length > 0) setQueue(savedQueue as PlayerTrack[]);

        if (savedSleep) {
          setSleepEndsAt(savedSleep);
          setSleepRemainingMs(sleepTimerRemaining(savedSleep));
        }

        if (savedTrack) {
          pendingSeekRef.current = savedTime;

          if (PLAYBACK_RATES.includes(savedRate as never)) {
            setRate(savedRate);
          }

          setTime(savedTime);
          setTrack(savedTrack);
        }
      });
    } catch {
      // Sesión corrupta: se ignora.
    }
  }, [
    localProgressRef,
    pendingSeekRef,
    setQueue,
    setRate,
    setSleepEndsAt,
    setSleepRemainingMs,
    setTime,
    setTrack,
  ]);
}
