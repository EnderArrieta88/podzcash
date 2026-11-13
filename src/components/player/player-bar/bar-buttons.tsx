"use client";

import { ListMusic, Timer, X } from "lucide-react";
import { usePlayer } from "@/components/player/player-context";
import { cn } from "@/lib/utils";
import type { PlayerContent } from "@/lib/i18n/player";
import { formatSleepTimer } from "@/lib/sleep-timer";

export function QueueButton({
  labels,
  open,
  onToggle,
}: {
  labels: PlayerContent;
  open: boolean;
  onToggle: () => void;
}) {
  const { queue } = usePlayer();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${labels.queue} (${queue.length})`}
      title={labels.queue}
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-full transition-colors",
        open
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
  );
}

export function SleepButton({
  labels,
  open,
  onToggle,
}: {
  labels: PlayerContent;
  open: boolean;
  onToggle: () => void;
}) {
  const { sleepTimerActive, sleepRemainingMs } = usePlayer();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={labels.sleep}
      title={labels.sleep}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1 rounded-full px-2 transition-colors",
        sleepTimerActive || open
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
  );
}

export function CloseButton({ labels }: { labels: PlayerContent }) {
  const { close } = usePlayer();

  return (
    <button
      type="button"
      onClick={close}
      className="inline-flex size-8 items-center justify-center rounded-full text-subtle transition-colors hover:bg-surface-2 hover:text-text"
      aria-label={labels.close}
    >
      <X size={16} />
    </button>
  );
}
