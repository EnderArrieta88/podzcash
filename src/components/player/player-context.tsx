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
  parseQueue,
  previousTrack,
  removeFromQueue,
} from "@/lib/player-queue";
import {
  isResumable,
  isValidProgress,
  pickLatestProgress,
  type ProgressPoint,
} from "@/lib/playback-progress";
import {
  isSleepTimerDone,
  sleepTimerEnd,
  sleepTimerRemaining,
} from "@/lib/sleep-timer";

export type PlayerTrack = {
  id: string;
  title: string;
  channelName: string;
  channelHandle: string;
  coverUrl: string | null;
  src: string;
  durationSec: number | null;
};

type PlayerState = {
  track: PlayerTrack | null;
  playing: boolean;
  time: number;
  duration: number;
  rate: number;
  queue: PlayerTrack[];
  sleepRemainingMs: number | null;
  sleepTimerActive: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  changeRate: (rate: number) => void;
  close: () => void;
  enqueue: (track: PlayerTrack) => void;
  dequeue: (id: string) => void;
  moveQueue: (id: string, direction: -1 | 1) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const STORAGE_KEY = "podzcash:player";
const QUEUE_KEY = "podzcash:queue";
const SLEEP_KEY = "podzcash:sleep";
export const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.8] as const;

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
        localProgress.current = {
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
          pendingSeek.current = savedTime;

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
  }, []);

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

  // Cuenta atrás del temporizador. Usa la marca de tiempo para sobrevivir a
  // recargas y a que el navegador ralentice los intervals en segundo plano.
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
  }, [sleepEndsAt]);

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
          if (response.status === 401) syncEnabled.current = false;
          return null;
        }

        syncEnabled.current = true;

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
    [signedIn],
  );

  const applyProgress = useCallback((point: ProgressPoint) => {
    const audio = audioRef.current;
    if (!audio) return;

    // No se interrumpe una reproducción ya avanzada en este dispositivo.
    if (!audio.paused && audio.currentTime > 3) return;

    if (audio.readyState >= 1) {
      audio.currentTime = point.positionSec;
      setTime(point.positionSec);
    } else {
      pendingSeek.current = point.positionSec;
      setTime(point.positionSec);
    }

    localProgress.current = point;
  }, []);

  /**
   * Envía la posición actual al servidor. Best-effort: si falla, la
   * reproducción sigue y el próximo guardado lo reintenta.
   */
  const syncProgress = useCallback(
    (force = false) => {
      if (!signedIn || !syncEnabled.current) return;

      const audio = audioRef.current;
      const current = snapshot.current.track;

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
    [signedIn],
  );

  // Guarda cada 2 s y al cerrar la página. No se puede usar un debounce por
  // `time`: mientras suena, el tiempo cambia más rápido que el debounce y el
  // temporizador nunca llegaría a dispararse.
  useEffect(() => {
    function persist() {
      const current = snapshot.current;

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
  }, []);

  // Al cargar una pista con sesión, busca su progreso en el servidor y
  // reanuda si es la posición más reciente.
  useEffect(() => {
    if (!signedIn || !track) return;

    let active = true;

    void fetchServerProgress(track.id).then((remote) => {
      if (!active || !remote) return;

      const { point, source } = pickLatestProgress(
        localProgress.current,
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
  }, [track, signedIn, fetchServerProgress, applyProgress]);

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

  // Atajos de teclado globales (se ignoran al escribir en un formulario).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!track) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        skip(15);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        skip(-15);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [track, toggle, skip]);

  // Integración con los controles del sistema operativo.
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.channelName,
      album: "PodZcash",
      artwork: track.coverUrl ? [{ src: track.coverUrl }] : [],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      if (track) recordPlay(track.id);
      void audioRef.current?.play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(15));

    try {
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        playPrevious(),
      );
    } catch {
      // El navegador puede no soportar estas acciones.
    }
  }, [track, skip, recordPlay, playNext, playPrevious]);

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
