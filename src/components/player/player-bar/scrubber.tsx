"use client";

import { useRef, useState } from "react";
import { usePlayer } from "@/components/player/player-context";
import { cn } from "@/lib/utils";
import type { PlayerContent } from "@/lib/i18n/player";
import { formatClock, SEGMENTS } from "./format";

export function Scrubber({ labels }: { labels: PlayerContent }) {
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
