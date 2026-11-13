"use client";

import { useEffect, type RefObject } from "react";
import { QUEUE_KEY, SLEEP_KEY, STORAGE_KEY } from "./player-storage";
import type { PlayerSnapshot, PlayerTrack } from "./player-types";

/**
 * Persiste la sesión de reproducción, la cola y el temporizador en
 * localStorage.
 */
export function usePlayerPersistence({
  snapshotRef,
  queue,
  sleepEndsAt,
}: {
  snapshotRef: RefObject<PlayerSnapshot>;
  queue: PlayerTrack[];
  sleepEndsAt: number | null;
}) {
  // Guarda cada 2 s y al cerrar la página. No se puede usar un debounce por
  // `time`: mientras suena, el tiempo cambia más rápido que el debounce y el
  // temporizador nunca llegaría a dispararse.
  useEffect(() => {
    function persist() {
      const current = snapshotRef.current;

      try {
        if (!current.track) {
          window.localStorage.removeItem(STORAGE_KEY);
          return;
        }

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...current, savedAt: Date.now() }),
        );
      } catch {
        // Sin espacio o modo privado: no es crítico.
      }
    }

    const interval = window.setInterval(persist, 2000);
    window.addEventListener("pagehide", persist);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", persist);
    };
  }, [snapshotRef]);

  // La cola y el temporizador se guardan aparte del estado de reproducción.
  useEffect(() => {
    try {
      if (queue.length === 0) window.localStorage.removeItem(QUEUE_KEY);
      else window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // Modo privado o sin espacio: la cola sigue en memoria.
    }
  }, [queue]);

  useEffect(() => {
    try {
      if (sleepEndsAt == null) window.localStorage.removeItem(SLEEP_KEY);
      else
        window.localStorage.setItem(
          SLEEP_KEY,
          JSON.stringify({ endsAt: sleepEndsAt }),
        );
    } catch {
      // Modo privado o sin espacio: el temporizador sigue en memoria.
    }
  }, [sleepEndsAt]);
}
