"use client";

import { useRef } from "react";
import { Music2, Pause, Play } from "lucide-react";
import {
  usePlayer,
  type PlayerTrack,
} from "@/components/player/player-context";
import { formatDuration } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { embedContent } from "@/lib/i18n/embed";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  return formatDuration(Math.round(seconds));
}

export function EmbedPlayer({
  track,
  coverUrl,
  href,
  locale,
}: {
  track: PlayerTrack;
  coverUrl: string | null;
  href: string;
  locale: Locale;
}) {
  const {
    track: current,
    playing,
    time,
    duration,
    play,
    toggle,
    seek,
  } = usePlayer();
  const rail = useRef<HTMLDivElement>(null);
  const text = embedContent[locale];

  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && playing;
  const total = isCurrent && duration > 0 ? duration : (track.durationSec ?? 0);
  const elapsed = isCurrent ? time : 0;
  const progress = total > 0 ? Math.min(1, elapsed / total) : 0;

  function seekTo(clientX: number) {
    const element = rail.current;
    if (!element || total <= 0) return;

    const rect = element.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    seek(ratio * total);
  }

  return (
    <div className="w-full rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <Music2 size={18} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold">
            {track.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {track.channelName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => (isCurrent ? toggle() : play(track))}
          aria-label={isPlaying ? text.pause : text.play}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-[#17130a] transition-colors hover:bg-brand-strong"
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular text-subtle">
          {clock(elapsed)}
        </span>

        <div
          ref={rail}
          role="slider"
          tabIndex={0}
          aria-label={text.progress}
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(elapsed)}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            seekTo(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.buttons === 1) seekTo(event.clientX);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") seek(elapsed + 5);
            if (event.key === "ArrowLeft") seek(elapsed - 5);
          }}
          className="group flex h-5 flex-1 cursor-pointer items-center"
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <span className="w-9 shrink-0 font-mono text-[10px] tabular text-subtle">
          {clock(total)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[11px] text-brand hover:underline"
        >
          {text.listenOn}
        </a>
        <span className="font-mono text-[10px] text-subtle">PodZcash</span>
      </div>
    </div>
  );
}
