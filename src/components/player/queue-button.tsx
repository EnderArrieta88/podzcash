"use client";

import { Check, ListPlus } from "lucide-react";
import type { PlayerContent } from "@/lib/i18n/player";
import {
  usePlayer,
  type PlayerTrack,
} from "@/components/player/player-context";

/**
 * Añade o quita un episodio de la cola. La cola persiste en localStorage y se
 * comparte con la barra del reproductor.
 */
export function QueueButton({
  track,
  labels,
}: {
  track: PlayerTrack;
  labels: PlayerContent;
}) {
  const { queue, enqueue, dequeue } = usePlayer();
  const queued = queue.some((item) => item.id === track.id);

  return (
    <button
      type="button"
      onClick={() => {
        if (queued) dequeue(track.id);
        else enqueue(track);
      }}
      aria-pressed={queued}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm text-text transition-colors hover:bg-surface-3"
    >
      {queued ? <Check size={15} /> : <ListPlus size={15} />}
      {queued ? labels.inQueue : labels.addToQueue}
    </button>
  );
}
