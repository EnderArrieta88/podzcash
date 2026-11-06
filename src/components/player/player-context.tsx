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
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  changeRate: (rate: number) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const STORAGE_KEY = "podzcash:player";
export const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.8] as const;

export function usePlayer(): PlayerState {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer debe usarse dentro de <PlayerProvider>.");
  }

  return context;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoplay = useRef(false);
  const pendingSeek = useRef(0);

  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  // Restaura la última sesión (sin autoplay: el navegador lo bloquearía).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        track?: PlayerTrack;
        time?: number;
        rate?: number;
      };

      if (saved.track?.src) {
        pendingSeek.current = saved.time ?? 0;

        // Se aplica en un microtask: leer localStorage al montar es una
        // sincronización con un sistema externo y así no provoca un render
        // en cascada dentro del efecto.
        queueMicrotask(() => {
          if (saved.rate && PLAYBACK_RATES.includes(saved.rate as never)) {
            setRate(saved.rate);
          }
          setTime(saved.time ?? 0);
          setTrack(saved.track ?? null);
        });
      }
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

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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

      recordPlay(next.id);
      shouldAutoplay.current = true;
      pendingSeek.current = 0;
      setTime(0);
      setTrack(next);
    },
    [track, toggle, recordPlay],
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

  const close = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setPlaying(false);
    setTime(0);
    setDuration(0);
    snapshot.current = { track: null, time: 0, rate: 1 };

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Modo privado: nada que limpiar.
    }
  }, []);

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
  }, [track, skip, recordPlay]);

  const value = useMemo<PlayerState>(
    () => ({
      track,
      playing,
      time,
      duration: duration || track?.durationSec || 0,
      rate,
      play,
      toggle,
      seek,
      skip,
      changeRate,
      close,
    }),
    [
      track,
      playing,
      time,
      duration,
      rate,
      play,
      toggle,
      seek,
      skip,
      changeRate,
      close,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}

      {track && <div className="player-spacer h-24" aria-hidden="true" />}

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
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
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        className="hidden"
      />
    </PlayerContext.Provider>
  );
}
