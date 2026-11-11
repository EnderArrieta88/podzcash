/**
 * Lógica pura de la cola de reproducción. El contexto del reproductor la usa
 * con `PlayerTrack`, pero las funciones solo necesitan un `id`, lo que también
 * las hace fáciles de testear.
 */
export type QueueItem = { id: string };

/** Agrega una pista al final si no estaba ya (sin duplicados). */
export function addToQueue<T extends QueueItem>(queue: T[], track: T): T[] {
  return queue.some((item) => item.id === track.id) ? queue : [...queue, track];
}

export function removeFromQueue<T extends QueueItem>(
  queue: T[],
  id: string,
): T[] {
  return queue.filter((item) => item.id !== id);
}

/** Mueve una pista una posición arriba (-1) o abajo (+1). */
export function moveQueueItem<T extends QueueItem>(
  queue: T[],
  id: string,
  direction: -1 | 1,
): T[] {
  const index = queue.findIndex((item) => item.id === id);
  const target = index + direction;

  if (index < 0 || target < 0 || target >= queue.length) return queue;

  const next = [...queue];
  [next[index], next[target]] = [next[target], next[index]];

  return next;
}

/**
 * Siguiente pista. Si la actual no está en la cola, empieza por la primera;
 * si es la última, devuelve null.
 */
export function nextTrack<T extends QueueItem>(
  queue: T[],
  currentId: string | null,
): T | null {
  if (queue.length === 0) return null;
  if (!currentId) return queue[0];

  const index = queue.findIndex((item) => item.id === currentId);

  if (index < 0) return queue[0];

  return queue[index + 1] ?? null;
}

export function previousTrack<T extends QueueItem>(
  queue: T[],
  currentId: string | null,
): T | null {
  if (queue.length === 0 || !currentId) return null;

  const index = queue.findIndex((item) => item.id === currentId);

  if (index <= 0) return null;

  return queue[index - 1] ?? null;
}

export function canGoNext(
  queue: QueueItem[],
  currentId: string | null,
): boolean {
  return nextTrack(queue, currentId) !== null;
}

export type TrackLike = {
  id: string;
  title: string;
  channelName: string;
  channelHandle: string;
  coverUrl: string | null;
  src: string;
  durationSec: number | null;
};

/** Valida una pista restaurada de localStorage antes de usarla. */
export function isTrackLike(value: unknown): value is TrackLike {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<TrackLike>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.channelName === "string" &&
    typeof item.channelHandle === "string" &&
    typeof item.src === "string" &&
    (item.coverUrl === null || typeof item.coverUrl === "string") &&
    (item.durationSec === null || typeof item.durationSec === "number")
  );
}

export function parseQueue(raw: string | null): TrackLike[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isTrackLike) : [];
  } catch {
    return [];
  }
}
