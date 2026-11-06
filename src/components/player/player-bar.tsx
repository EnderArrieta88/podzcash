"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Music2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import {
  PLAYBACK_RATES,
  usePlayer,
} from "@/components/player/player-context";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { playerContent, type PlayerContent } from "@/lib/i18n/player";
import { channelPath } from "@/lib/routes";

const SEGMENTS = 64;

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${rest}`;
  }

  return `${minutes}:${rest}`;
}

function Scrubber({ labels }: { labels: PlayerContent }) {
  const { time, duration, seek } = usePlayer();
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const progress = duration > 0 ? Math.min(1, time / duration) : 0;

  function seekFromClientX(clientX: number) {
    const rail = railRef.current;
    if (!rail || duration <= 0) return;

    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seek(ratio * duration);
  }

  return (
    <div
      ref={railRef}
      role="slider"
      tabIndex={0}
      aria-label={labels.progress}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${formatClock(time)} ${labels.of} ${formatClock(duration)}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        seekFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging) seekFromClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        setDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          seek(time + 5);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          seek(time - 5);
        }
      }}
      className="group flex h-6 flex-1 cursor-pointer items-center gap-[2px]"
    >
      {Array.from({ length: SEGMENTS }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            index / SEGMENTS < progress
              ? "bg-brand"
              : "bg-border group-hover:bg-border-strong",
          )}
        />
      ))}
    </div>
  );
}

export function PlayerBar({ locale }: { locale: Locale }) {
  const {
    track,
    playing,
    time,
    duration,
    rate,
    toggle,
    skip,
    changeRate,
    close,
  } = usePlayer();

  const labels = playerContent[locale];

  if (!track) return null;

  return (
    <div className="player-bar fixed bottom-0 right-0 z-40 border-t border-border-strong bg-surface-3/95 backdrop-blur-md transition-[left] duration-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
            {track.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.coverUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-subtle">
                <Music2 size={16} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{track.title}</p>
            <Link
              href={channelPath(track.channelHandle)}
              className="truncate text-xs text-subtle transition-colors hover:text-muted"
            >
              {track.channelName}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => skip(-15)}
              className="hidden size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text sm:inline-flex"
              aria-label={labels.back}
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={toggle}
              className="inline-flex size-11 items-center justify-center rounded-full bg-brand text-[#17130a] transition-colors hover:bg-brand-strong"
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
              onClick={() => skip(15)}
              className="hidden size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text sm:inline-flex"
              aria-label={labels.forward}
            >
              <RotateCw size={16} />
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const index = PLAYBACK_RATES.indexOf(
                  rate as (typeof PLAYBACK_RATES)[number],
                );
                changeRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
              }}
              className="inline-flex h-8 min-w-11 items-center justify-center rounded-full border border-border px-2 font-mono text-xs tabular text-muted transition-colors hover:border-border-strong hover:text-text"
              aria-label={labels.speed}
            >
              {rate}×
            </button>

            <button
              type="button"
              onClick={close}
              className="inline-flex size-8 items-center justify-center rounded-full text-subtle transition-colors hover:bg-surface-2 hover:text-text"
              aria-label={labels.close}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular text-subtle">
            {formatClock(time)}
          </span>

          <Scrubber labels={labels} />

          <span className="w-10 shrink-0 font-mono text-[11px] tabular text-subtle">
            {formatClock(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
