"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { usePlayer } from "@/components/player/player-context";
import { cn } from "@/lib/utils";
import type { PlayerContent } from "@/lib/i18n/player";

export function QueuePanel({
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
      className="absolute bottom-full right-2 z-50 mb-2 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-surface-2 p-3 shadow-xl sm:right-4"
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
