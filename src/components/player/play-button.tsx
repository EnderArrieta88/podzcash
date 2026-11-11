"use client";

import { Pause, Play } from "lucide-react";
import {
  usePlayer,
  type PlayerTrack,
} from "@/components/player/player-context";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { sharedLabels } from "@/lib/i18n/shared";

type PlayButtonProps = {
  track: PlayerTrack;
  locale: Locale;
  size?: "sm" | "lg";
  label?: boolean;
  className?: string;
};

export function PlayButton({
  track,
  locale,
  size = "sm",
  label = false,
  className,
}: PlayButtonProps) {
  const { track: current, playing, play, toggle } = usePlayer();
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;
  const text = sharedLabels[locale];

  const iconSize = size === "lg" ? 22 : 16;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (isCurrent) toggle();
        else play(track);
      }}
      aria-label={
        isPlaying ? text.pauseAria(track.title) : text.playAria(track.title)
      }
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-brand text-[#17130a] transition-colors hover:bg-brand-strong",
        size === "lg"
          ? "h-12 rounded-full px-6 text-sm font-medium"
          : "size-10 rounded-full",
        isPlaying && "glow-playing",
        className,
      )}
    >
      {isPlaying ? (
        <Pause size={iconSize} fill="currentColor" />
      ) : (
        <Play
          size={iconSize}
          fill="currentColor"
          className={size === "lg" ? "ml-0.5" : "ml-0.5"}
        />
      )}
      {label && (isPlaying ? text.pause : text.play)}
    </button>
  );
}
