"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Music2 } from "lucide-react";
import { PLAYBACK_RATES, usePlayer } from "@/components/player/player-context";
import { channelPath } from "@/lib/routes";
import type { Locale } from "@/lib/i18n/config";
import { playerContent } from "@/lib/i18n/player";
import {
  CloseButton,
  QueueButton,
  SleepButton,
} from "./player-bar/bar-buttons";
import { formatClock } from "./player-bar/format";
import { MarqueeText } from "./player-bar/marquee-text";
import { QueuePanel } from "./player-bar/queue-panel";
import { Scrubber } from "./player-bar/scrubber";
import { SleepPanel } from "./player-bar/sleep-panel";
import { TransportControls } from "./player-bar/transport-controls";

export function PlayerBar({ locale }: { locale: Locale }) {
  const { track, time, duration, rate, changeRate } = usePlayer();

  const labels = playerContent[locale];
  const [panel, setPanel] = useState<"queue" | "sleep" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;

    function onPointerDown(event: PointerEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
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
    <div
      ref={barRef}
      className="player-bar fixed bottom-0 right-0 z-40 border-t border-border-strong bg-surface-3/95 backdrop-blur-md transition-[left] duration-200"
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-3 sm:gap-y-1.5">
          <div className="col-start-1 row-start-1 size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
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

          <div className="col-start-2 row-start-1 min-w-0">
            <p
              data-testid="player-track-title"
              className="text-sm font-medium"
              title={track.title}
            >
              <MarqueeText text={track.title} />
            </p>
            <Link
              href={channelPath(track.channelHandle)}
              data-testid="player-track-channel"
              title={track.channelName}
              className="block truncate text-xs text-subtle transition-colors hover:text-muted"
            >
              {track.channelName}
            </Link>
          </div>

          <div className="col-start-3 row-start-1 sm:hidden">
            <CloseButton labels={labels} />
          </div>

          <div className="col-span-3 col-start-1 row-start-2 flex min-w-0 items-center justify-center gap-1 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:justify-end">
            <TransportControls labels={labels} />

            <button
              type="button"
              onClick={() => {
                const index = PLAYBACK_RATES.indexOf(
                  rate as (typeof PLAYBACK_RATES)[number],
                );
                changeRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
              }}
              className="ml-1 hidden h-8 min-w-11 items-center justify-center rounded-full border border-border px-2 font-mono text-xs tabular text-muted transition-colors hover:border-border-strong hover:text-text sm:inline-flex"
              aria-label={labels.speed}
            >
              {rate}×
            </button>

            <QueueButton
              labels={labels}
              open={panel === "queue"}
              onToggle={() => setPanel(panel === "queue" ? null : "queue")}
            />

            <SleepButton
              labels={labels}
              open={panel === "sleep"}
              onToggle={() => setPanel(panel === "sleep" ? null : "sleep")}
            />
          </div>

          <div className="col-start-4 row-start-1 hidden sm:block">
            <CloseButton labels={labels} />
          </div>

          <div className="col-span-3 col-start-1 row-start-3 flex items-center gap-2 sm:col-span-4 sm:col-start-1 sm:row-start-2">
            <span className="w-9 shrink-0 text-right font-mono text-[11px] tabular text-subtle sm:w-10">
              {formatClock(time)}
            </span>

            <Scrubber labels={labels} />

            <span className="w-9 shrink-0 font-mono text-[11px] tabular text-subtle sm:w-10">
              {formatClock(duration)}
            </span>
          </div>
        </div>
      </div>

      {panel === "queue" && (
        <QueuePanel labels={labels} onClose={() => setPanel(null)} />
      )}
      {panel === "sleep" && (
        <SleepPanel labels={labels} onClose={() => setPanel(null)} />
      )}
    </div>
  );
}
