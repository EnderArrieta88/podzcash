type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_ENTRIES = 2000;

function prune(now: number) {
  if (buckets.size < MAX_ENTRIES) return;

  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Límite simple en memoria. Alcanza para un prototipo con un solo proceso:
 * frena fuerza bruta y spam de reportes. Se reinicia al reiniciar la app.
 */
export function take(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);

  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
}

export function clearLimit(key: string): void {
  buckets.delete(key);
}
