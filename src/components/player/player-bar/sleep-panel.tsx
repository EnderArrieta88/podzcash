"use client";

import { X } from "lucide-react";
import { usePlayer } from "@/components/player/player-context";
import type { PlayerContent } from "@/lib/i18n/player";
import { formatSleepTimer, SLEEP_TIMER_OPTIONS } from "@/lib/sleep-timer";

export function SleepPanel({
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
      className="absolute bottom-full right-2 z-50 mb-2 w-64 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-surface-2 p-3 shadow-xl sm:right-4"
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
