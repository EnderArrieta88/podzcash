"use client";

import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayer } from "@/components/player/player-context";
import type { PlayerContent } from "@/lib/i18n/player";

export function TransportControls({ labels }: { labels: PlayerContent }) {
  const {
    playing,
    toggle,
    skip,
    canGoNext,
    canGoPrevious,
    playNext,
    playPrevious,
  } = usePlayer();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={() => skip(-15)}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text sm:size-9"
        aria-label={labels.back}
      >
        <RotateCcw size={16} />
      </button>

      <button
        type="button"
        onClick={playPrevious}
        disabled={!canGoPrevious}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent sm:size-9"
        aria-label={labels.previous}
      >
        <SkipBack size={16} />
      </button>

      <button
        type="button"
        onClick={toggle}
        className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-[#17130a] transition-colors hover:bg-brand-strong sm:size-11"
        aria-label={playing ? labels.pause : labels.play}
      >
        {playing ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <button
        type="button"
        onClick={playNext}
        disabled={!canGoNext}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent sm:size-9"
        aria-label={labels.next}
      >
        <SkipForward size={16} />
      </button>

      <button
        type="button"
        onClick={() => skip(15)}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text sm:size-9"
        aria-label={labels.forward}
      >
        <RotateCw size={16} />
      </button>
    </div>
  );
}
