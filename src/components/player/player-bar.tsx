"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Music2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Timer,
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
import { formatSleepTimer, SLEEP_TIMER_OPTIONS } from "@/lib/sleep-timer";

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

function QueuePanel({
  labels,
  onClose,
}: {
  labels: PlayerContent;
  onClose: () => void;
}) {
  const { track, queue, play, dequeue, moveQueue, clearQueue } = usePlayer();

  return (
    <div
      role="dialog"
      aria-label={labels.queueTitle}
      className="absolute bottom-full right-0 z-50 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface-2 p-3 shadow-xl"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{labels.queueTitle}</p>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              type="button"
              onClick={clearQueue}
              className="rounded-lg px-2 py-1 text-xs text-subtle transition-colors hover:text-danger"
            >
              {labels.queueClear}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-text"
            aria-label={labels.close}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-border px-3 py-4 text-center">
          <p className="text-xs text-muted">{labels.queueEmpty}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-subtle">
            {labels.queueEmptyHint}
          </p>
        </div>
      ) : (
        <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto">
          {queue.map((item, index) => {
            const current = item.id === track?.id;

            return (
              <li key={item.id} className="flex items-center gap-1 py-2">
                <button
                  type="button"
                  onClick={() => play(item)}
                  aria-label={`${labels.queuePlay}: ${item.title}`}
                  className="min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left transition-colors hover:text-brand"
                >
                  <p
                    className={cn(
                      "truncate text-xs",
                      current ? "font-semibold text-brand" : "text-text",
                    )}
                  >
                    {current ? "▸ " : ""}
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] text-subtle">
                    {item.channelName}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => moveQueue(item.id, -1)}
                  disabled={index === 0}
                  aria-label={labels.queueUp}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveQueue(item.id, 1)}
                  disabled={index === queue.length - 1}
                  aria-label={labels.queueDown}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => dequeue(item.id)}
                  aria-label={labels.queueRemove}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-danger"
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SleepPanel({
  labels,
  onClose,
}: {
  labels: PlayerContent;
  onClose: () => void;
}) {
  const {
    sleepTimerActive,
    sleepRemainingMs,
    startSleepTimer,
    cancelSleepTimer,
  } = usePlayer();

  return (
    <div
      role="dialog"
      aria-label={labels.sleep}
      className="absolute bottom-full right-0 z-50 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface-2 p-3 shadow-xl"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{labels.sleepTitle}</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-7 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-text"
          aria-label={labels.close}
        >
          <X size={14} />
        </button>
      </div>

      {sleepTimerActive && (
        <p className="mt-1 font-mono text-xs text-brand">
          {formatSleepTimer(sleepRemainingMs ?? 0)}
        </p>
      )}

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {SLEEP_TIMER_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => {
              startSleepTimer(minutes);
              onClose();
            }}
            className="rounded-lg border border-border bg-surface px-2 py-2 text-xs text-muted transition-colors hover:border-border-strong hover:text-text"
          >
            {minutes} {labels.sleepMinutes}
          </button>
        ))}
      </div>

      {sleepTimerActive && (
        <button
          type="button"
          onClick={() => {
            cancelSleepTimer();
            onClose();
          }}
          className="mt-2 w-full rounded-lg border border-danger/30 bg-danger/10 px-2 py-2 text-xs text-danger transition-colors hover:bg-danger/20"
        >
          {labels.sleepCancel}
        </button>
      )}
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
    queue,
    sleepTimerActive,
    sleepRemainingMs,
    canGoNext,
    canGoPrevious,
    playNext,
    playPrevious,
  } = usePlayer();

  const labels = playerContent[locale];
  const [panel, setPanel] = useState<"queue" | "sleep" | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;

    function onPointerDown(event: PointerEvent) {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setPanel(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPanel(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

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
              onClick={playPrevious}
              disabled={!canGoPrevious}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              aria-label={labels.previous}
            >
              <SkipBack size={16} />
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
              onClick={playNext}
              disabled={!canGoNext}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              aria-label={labels.next}
            >
              <SkipForward size={16} />
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

          <div
            ref={controlsRef}
            className="relative ml-auto flex shrink-0 items-center gap-1"
          >
            <button
              type="button"
              onClick={() => {
                const index = PLAYBACK_RATES.indexOf(
                  rate as (typeof PLAYBACK_RATES)[number],
                );
                changeRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
              }}
              className="hidden h-8 min-w-11 items-center justify-center rounded-full border border-border px-2 font-mono text-xs tabular text-muted transition-colors hover:border-border-strong hover:text-text sm:inline-flex"
              aria-label={labels.speed}
            >
              {rate}×
            </button>

            <button
              type="button"
              onClick={() => setPanel(panel === "queue" ? null : "queue")}
              aria-expanded={panel === "queue"}
              aria-label={`${labels.queue} (${queue.length})`}
              title={labels.queue}
              className={cn(
                "relative inline-flex size-8 items-center justify-center rounded-full transition-colors",
                panel === "queue"
                  ? "bg-surface-2 text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <ListMusic size={16} />
              {queue.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[9px] font-semibold text-[#17130a]">
                  {queue.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setPanel(panel === "sleep" ? null : "sleep")}
              aria-expanded={panel === "sleep"}
              aria-label={labels.sleep}
              title={labels.sleep}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1 rounded-full px-2 transition-colors",
                sleepTimerActive
                  ? "bg-surface-2 text-brand"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {sleepTimerActive ? (
                <span className="font-mono text-[11px] tabular">
                  {formatSleepTimer(sleepRemainingMs ?? 0)}
                </span>
              ) : (
                <Timer size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={close}
              className="inline-flex size-8 items-center justify-center rounded-full text-subtle transition-colors hover:bg-surface-2 hover:text-text"
              aria-label={labels.close}
            >
              <X size={16} />
            </button>

            {panel === "queue" && (
              <QueuePanel labels={labels} onClose={() => setPanel(null)} />
            )}
            {panel === "sleep" && (
              <SleepPanel labels={labels} onClose={() => setPanel(null)} />
            )}
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
