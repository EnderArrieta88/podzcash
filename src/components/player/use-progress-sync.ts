"use client";

import { useCallback, useEffect, type RefObject } from "react";
import {
  isResumable,
  isValidProgress,
  pickLatestProgress,
  type ProgressPoint,
} from "@/lib/playback-progress";
import type { PlayerSnapshot, PlayerTrack } from "./player-types";

/**
 * Sincronización del progreso de reproducción con el servidor: reanuda al
 * cargar una pista y guarda cada 10 s y al cerrar la página.
 */
export function useProgressSync({
  signedIn,
  track,
  audioRef,
  snapshotRef,
  pendingSeekRef,
  localProgressRef,
  syncEnabledRef,
  setTime,
}: {
  signedIn: boolean;
  track: PlayerTrack | null;
  audioRef: RefObject<HTMLAudioElement | null>;
  snapshotRef: RefObject<PlayerSnapshot>;
  pendingSeekRef: RefObject<number>;
  localProgressRef: RefObject<ProgressPoint | null>;
  syncEnabledRef: RefObject<boolean>;
  setTime: (value: number) => void;
}) {
  /**
   * Progreso guardado en el servidor para un episodio (solo con sesión).
   * Devuelve null si no hay sesión, no hay datos o la respuesta no es válida.
   */
  const fetchServerProgress = useCallback(
    async (episodeId: string): Promise<ProgressPoint | null> => {
      if (!signedIn) return null;

      try {
        const response = await fetch(
          `/api/progress?episodeId=${encodeURIComponent(episodeId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          if (response.status === 401) syncEnabledRef.current = false;
          return null;
        }

        syncEnabledRef.current = true;

        const data: unknown = await response.json();

        if (!data || typeof data !== "object") return null;

        const record = data as Record<string, unknown>;
        const updatedAt = Date.parse(String(record.updatedAt ?? ""));
        const point: ProgressPoint = {
          positionSec: Number(record.positionSec),
          durationSec:
            record.durationSec == null ? null : Number(record.durationSec),
          updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
        };

        return isValidProgress(point) ? point : null;
      } catch {
        return null;
      }
    },
    [signedIn, syncEnabledRef],
  );

  const applyProgress = useCallback(
    (point: ProgressPoint) => {
      const audio = audioRef.current;
      if (!audio) return;

      // No se interrumpe una reproducción ya avanzada en este dispositivo.
      if (!audio.paused && audio.currentTime > 3) return;

      if (audio.readyState >= 1) {
        audio.currentTime = point.positionSec;
        setTime(point.positionSec);
      } else {
        pendingSeekRef.current = point.positionSec;
        setTime(point.positionSec);
      }

      localProgressRef.current = point;
    },
    [audioRef, localProgressRef, pendingSeekRef, setTime],
  );

  /**
   * Envía la posición actual al servidor. Best-effort: si falla, la
   * reproducción sigue y el próximo guardado lo reintenta.
   */
  const syncProgress = useCallback(
    (force = false) => {
      if (!signedIn || !syncEnabledRef.current) return;

      const audio = audioRef.current;
      const current = snapshotRef.current.track;

      if (!audio || !current) return;

      const position = audio.currentTime;

      if (!Number.isFinite(position) || position < 3) return;
      if (!force && audio.paused) return;

      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.round(audio.duration)
          : current.durationSec;

      void fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: current.id,
          positionSec: Math.round(position),
          durationSec: duration,
        }),
        keepalive: true,
      }).catch(() => {
        // El guardado es best-effort: no interrumpe la reproducción.
      });
    },
    [signedIn, audioRef, snapshotRef, syncEnabledRef],
  );

  // Al cargar una pista con sesión, busca su progreso en el servidor y
  // reanuda si es la posición más reciente.
  useEffect(() => {
    if (!signedIn || !track) return;

    let active = true;

    void fetchServerProgress(track.id).then((remote) => {
      if (!active || !remote) return;

      const { point, source } = pickLatestProgress(
        localProgressRef.current,
        remote,
      );

      if (!point || source !== "remote") return;
      if (
        !isResumable(point.positionSec, point.durationSec ?? track.durationSec)
      ) {
        return;
      }

      applyProgress(point);
    });

    return () => {
      active = false;
    };
  }, [track, signedIn, fetchServerProgress, applyProgress, localProgressRef]);

  // Guarda la posición en el servidor cada 10 s y al cerrar la página.
  useEffect(() => {
    if (!signedIn) return;

    const interval = window.setInterval(() => syncProgress(), 10_000);
    const onHide = () => syncProgress(true);

    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onHide);
    };
  }, [signedIn, syncProgress]);

  return { syncProgress };
}
