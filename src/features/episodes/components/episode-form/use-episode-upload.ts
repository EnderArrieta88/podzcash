"use client";

import { useRef, useState } from "react";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeFormValues } from "../../types";
import {
  MAX_AUDIO_BYTES,
  MAX_COVER_BYTES,
  readDuration,
  uploadWithProgress,
} from "./upload";

type EpisodeFormLabels = StudioEpisodesContent["form"];

export type EpisodeAudio = {
  key: string;
  size: number;
  mimeType: string;
  name: string;
};

export type EpisodeCover = { key: string; url: string };

/**
 * Estado y acciones de subida del formulario de episodio: audio con duración,
 * portada, progreso y validaciones previas.
 */
export function useEpisodeUpload(
  episode: EpisodeFormValues | null,
  labels: EpisodeFormLabels,
) {
  const [audio, setAudio] = useState<EpisodeAudio | null>(
    episode
      ? {
          key: episode.audio.key,
          size: episode.audio.size ?? 0,
          mimeType: episode.audio.mimeType ?? "",
          name: episode.audio.name,
        }
      : null,
  );

  const [cover, setCover] = useState<EpisodeCover | null>(
    episode?.coverKey && episode.coverUrl
      ? { key: episode.coverKey, url: episode.coverUrl }
      : null,
  );

  const [duration, setDuration] = useState<number | null>(
    episode?.audio.durationSec ?? null,
  );

  const [uploading, setUploading] = useState<"audio" | "cover" | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const audioInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  async function handleAudio(file: File) {
    if (!file.type.startsWith("audio/")) {
      setUploadError(labels.errors.notAudio);
      return;
    }

    if (file.size > MAX_AUDIO_BYTES) {
      setUploadError(labels.errors.audioTooLarge);
      return;
    }

    setUploadError(null);
    setUploading("audio");
    setAudioProgress(0);

    const detected = await readDuration(file);
    if (detected) setDuration(detected);

    const { result, error } = await uploadWithProgress(
      "audio",
      file,
      setAudioProgress,
      labels.errors,
    );

    setUploading(null);

    if (error) {
      setUploadError(error);
      return;
    }

    if (result) {
      setAudio({
        key: result.key,
        size: result.size,
        mimeType: result.mimeType,
        name: file.name,
      });
      setAudioProgress(100);
    }
  }

  async function handleCover(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError(labels.errors.notImage);
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setUploadError(labels.errors.coverTooLarge);
      return;
    }

    setUploadError(null);
    setUploading("cover");
    setCoverProgress(0);

    const { result, error } = await uploadWithProgress(
      "image",
      file,
      setCoverProgress,
      labels.errors,
      "cover",
    );

    setUploading(null);

    if (error) {
      setUploadError(error);
      return;
    }

    if (result) {
      setCover({ key: result.key, url: `/media/${result.key}` });
      setCoverProgress(100);
    }
  }

  function removeAudio() {
    setAudio(null);
    setDuration(null);
    if (audioInput.current) audioInput.current.value = "";
  }

  return {
    audio,
    cover,
    duration,
    uploading,
    audioProgress,
    coverProgress,
    uploadError,
    dragging,
    audioInput,
    coverInput,
    handleAudio,
    handleCover,
    removeAudio,
    setDragging,
  };
}
