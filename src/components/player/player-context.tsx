"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToQueue,
  canGoNext,
  moveQueueItem,
  nextTrack,
  previousTrack,
  removeFromQueue,
} from "@/lib/player-queue";
import { type ProgressPoint } from "@/lib/playback-progress";
import { sleepTimerEnd } from "@/lib/sleep-timer";
import type { PlayerState, PlayerTrack } from "./player-types";
import { STORAGE_KEY } from "./player-storage";
import { usePlayerKeyboard, useMediaSession } from "./use-player-shortcuts";
import { useProgressSync } from "./use-progress-sync";
import { useRestoreSession } from "./use-restore-session";
import { usePlayerPersistence } from "./use-player-persistence";
import { useSleepCountdown } from "./use-sleep-countdown";

export type { PlayerTrack } from "./player-types";
export { PLAYBACK_RATES } from "./player-constants";

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer debe usarse dentro de <PlayerProvider>.");
  }

  return context;
}

export function PlayerProvider({
  children,
  signedIn = false,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoplay = useRef(false);
  const pendingSeek = useRef(0);
  const progressMilestones = useRef<Map<string, Set<number>>>(new Map());
  // Último progreso conocido de la pista actual en este dispositivo.
  const localProgress = useRef<ProgressPoint | null>(null);
  // Se desactiva si el servidor responde 401 (cookie vencida o inválida).
  const syncEnabled = useRef(signedIn);

  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [sleepEndsAt, setSleepEndsAt] = useState<number | null>(null);
  const [sleepRemainingMs, setSleepRemainingMs] = useState<number | null>(null);

  // Restaura la última sesión, la cola y el temporizador (sin autoplay: el
  // navegador lo bloquearía).
  useRestoreSession({
    pendingSeekRef: pendingSeek,
    localProgressRef: localProgress,
    setQueue,
    setSleepEndsAt,
    setSleepRemainingMs,
    setRate,
    setTime,
    setTrack,
  });

  // Carga la pista cuando cambia.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.src = track.src;
    audio.load();

    if (shouldAutoplay.current) {
      shouldAutoplay.current = false;
      void audio.play().catch(() => setPlaying(false));
    }
  }, [track]);

  // Mantiene la velocidad y persiste el estado con un pequeño debounce.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  // Última foto del reproductor: se actualiza sin provocar renders.
  const snapshot = useRef({ track, time, rate });

  useEffect(() => {
    snapshot.current = { track, time, rate };
  }, [track, time, rate]);

  usePlayerPersistence({ snapshotRef: snapshot, queue, sleepEndsAt });

  useSleepCountdown({
    sleepEndsAt,
    audioRef,
    setSleepEndsAt,
    setSleepRemainingMs,
  });

  const counted = useRef<Set<string>>(new Set());

  const recordPlay = useCallback((id: string) => {
    if (counted.current.has(id)) return;
    counted.current.add(id);

    try {
      const key = `podzcash:played:${id}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Modo privado: el set en memoria ya evita duplicados en esta sesión.
    }

    void fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => {
      // El contador es best-effort: no debe interrumpir la reproducción.
    });
  }, []);

  const { syncProgress } = useProgressSync({
    signedIn,
    track,
    audioRef,
    snapshotRef: snapshot,
    pendingSeekRef: pendingSeek,
    localProgressRef: localProgress,
    syncEnabledRef: syncEnabled,
    setTime,
  });

  const startTrack = useCallback(
    (next: PlayerTrack) => {
      // Guarda la posición del episodio que se deja antes de cambiar.
      syncProgress(true);

      recordPlay(next.id);
      shouldAutoplay.current = true;
      pendingSeek.current = 0;
      // Pista nueva: el servidor puede tener una posición más reciente.
      localProgress.current = {
        positionSec: 0,
        durationSec: next.durationSec,
        updatedAt: 0,
      };
      setTime(0);
      setTrack(next);
    },
    [recordPlay, syncProgress],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (audio.paused) {
      recordPlay(track.id);
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [track, recordPlay]);

  const play = useCallback(
    (next: PlayerTrack) => {
      if (track?.id === next.id) {
        toggle();
        return;
      }

      startTrack(next);
    },
    [track, toggle, startTrack],
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const limit = Number.isFinite(audio.duration) ? audio.duration : Infinity;
    const next = Math.max(0, Math.min(seconds, limit));
    audio.currentTime = next;
    setTime(next);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek(audio.currentTime + delta);
    },
    [seek],
  );

  const changeRate = useCallback((next: number) => {
    setRate(next);
  }, []);

  const enqueue = useCallback((next: PlayerTrack) => {
    setQueue((current) => addToQueue(current, next));
  }, []);

  const dequeue = useCallback((id: string) => {
    setQueue((current) => removeFromQueue(current, id));
  }, []);

  const moveQueue = useCallback((id: string, direction: -1 | 1) => {
    setQueue((current) => moveQueueItem(current, id, direction));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    const next = nextTrack(queue, track?.id ?? null);
    if (next) startTrack(next);
  }, [queue, track, startTrack]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;

    // Si ya avanzó, "anterior" reinicia el episodio actual.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setTime(0);
      return;
    }

    const previous = previousTrack(queue, track?.id ?? null);
    if (previous) startTrack(previous);
  }, [queue, track, startTrack]);

  const startSleepTimer = useCallback((minutes: number) => {
    const endsAt = sleepTimerEnd(minutes);
    setSleepEndsAt(endsAt);
    setSleepRemainingMs(minutes * 60_000);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepEndsAt(null);
    setSleepRemainingMs(null);
  }, []);

  const close = useCallback(() => {
    // Guarda la última posición antes de descartar la pista.
    syncProgress(true);

    audioRef.current?.pause();
    setTrack(null);
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setSleepEndsAt(null);
    setSleepRemainingMs(null);
    localProgress.current = null;
    snapshot.current = { track: null, time: 0, rate: 1 };

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Modo privado: nada que limpiar.
    }
  }, [syncProgress]);

  usePlayerKeyboard({ track, toggle, skip });

  useMediaSession({
    track,
    audioRef,
    skip,
    recordPlay,
    playNext,
    playPrevious,
  });

  const value = useMemo<PlayerState>(
    () => ({
      track,
      playing,
      time,
      duration: duration || track?.durationSec || 0,
      rate,
      queue,
      sleepRemainingMs,
      sleepTimerActive: sleepEndsAt != null,
      canGoNext: canGoNext(queue, track?.id ?? null),
      canGoPrevious:
        time > 3 || previousTrack(queue, track?.id ?? null) !== null,
      play,
      toggle,
      seek,
      skip,
      changeRate,
      close,
      enqueue,
      dequeue,
      moveQueue,
      clearQueue,
      playNext,
      playPrevious,
      startSleepTimer,
      cancelSleepTimer,
    }),
    [
      track,
      playing,
      time,
      duration,
      rate,
      queue,
      sleepRemainingMs,
      sleepEndsAt,
      play,
      toggle,
      seek,
      skip,
      changeRate,
      close,
      enqueue,
      dequeue,
      moveQueue,
      clearQueue,
      playNext,
      playPrevious,
      startSleepTimer,
      cancelSleepTimer,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}

      {track && (
        <div className="player-spacer h-36 sm:h-24" aria-hidden="true" />
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          setTime(audio.currentTime);

          if (
            !track ||
            !Number.isFinite(audio.duration) ||
            audio.duration <= 0
          ) {
            return;
          }

          const percent = Math.min(
            100,
            Math.floor((audio.currentTime / audio.duration) * 100),
          );
          const sent =
            progressMilestones.current.get(track.id) ?? new Set<number>();
          progressMilestones.current.set(track.id, sent);

          for (const milestone of [25, 50, 75, 100]) {
            if (percent < milestone || sent.has(milestone)) continue;

            sent.add(milestone);
            void fetch("/api/analytics/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: track.id,
                position: audio.currentTime,
                duration: audio.duration,
              }),
              keepalive: true,
            }).catch(() => {
              // La analítica es best-effort: no interrumpe la reproducción.
            });
          }
        }}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
        }}
        onCanPlay={(event) => {
          // El salto a la posición guardada se aplica cuando el medio ya es
          // buscable; en `loadedmetadata` algunos contenedores lo ignoran.
          if (pendingSeek.current <= 0) return;

          const audio = event.currentTarget;
          const target = pendingSeek.current;
          audio.currentTime = target;
          setTime(target);
          pendingSeek.current = 0;
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          // Guarda al pausar: es el momento típico en que el oyente se va.
          syncProgress(true);
        }}
        onEnded={() => {
          setTime(0);

          const next = nextTrack(queue, track?.id ?? null);

          if (next) startTrack(next);
          else setPlaying(false);
        }}
        className="hidden"
      />
    </PlayerContext.Provider>
  );
}
