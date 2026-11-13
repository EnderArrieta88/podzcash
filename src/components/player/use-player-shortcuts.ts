"use client";

import { useEffect } from "react";
import type { PlayerTrack } from "./player-types";

/**
 * Atajos globales del reproductor: espacio para reproducir y flechas para
 * avanzar o retroceder. Se ignoran al escribir en un formulario.
 */
export function usePlayerKeyboard({
  track,
  toggle,
  skip,
}: {
  track: PlayerTrack | null;
  toggle: () => void;
  skip: (delta: number) => void;
}) {
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
}

/**
 * Integración con los controles multimedia del sistema operativo.
 */
export function useMediaSession({
  track,
  audioRef,
  skip,
  recordPlay,
  playNext,
  playPrevious,
}: {
  track: PlayerTrack | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  skip: (delta: number) => void;
  recordPlay: (id: string) => void;
  playNext: () => void;
  playPrevious: () => void;
}) {
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
  }, [track, audioRef, skip, recordPlay, playNext, playPrevious]);
}
