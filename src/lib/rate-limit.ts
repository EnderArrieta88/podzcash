import Database from "better-sqlite3";
import { createHmac } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Rate limiting persistente en SQLite.
 *
 * - Las claves se guardan como HMAC-SHA256: nunca se almacena la IP, el email
 *   ni el id de usuario en claro.
 * - `busy_timeout` + transacción `IMMEDIATE` permiten usarlo con más de un
 *   proceso (Passenger puede levantar varias instancias).
 * - Si la base falla, cae a un contador en memoria por 60 segundos para no
 *   dejar el sitio sin protección.
 * - Los límites alcanzados se agregan por día y se muestran en administración.
 */
const DEFAULT_DB_PATH = "./.data/rate-limit.db";
const METRICS_RETENTION_DAYS = 90;
const DEGRADED_MS = 60_000;
const PRUNE_INTERVAL_MS = 60 * 60 * 1000;
const MEMORY_MAX_ENTRIES = 2000;
const DAY_MS = 86_400_000;

export type RateLimitMetrics = {
  blockedToday: number;
  persistent: boolean;
};

export type RateLimitStore = {
  take(key: string, limit: number, windowMs: number): boolean;
  clear(key: string): void;
  metrics(): RateLimitMetrics;
  close(): void;
};

export type RateLimitStoreOptions = {
  path?: string;
  salt?: string;
  now?: () => number;
  log?: (message: string, error?: unknown) => void;
};

type Bucket = { count: number; resetAt: number };

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function createRateLimitStore(
  options: RateLimitStoreOptions = {},
): RateLimitStore {
  const dbPath = path.resolve(
    process.cwd(),
    options.path ?? process.env.RATE_LIMIT_DB_PATH ?? DEFAULT_DB_PATH,
  );
  const salt =
    options.salt?.trim() ||
    process.env.RATE_LIMIT_SALT?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "podzcash-rate-limit";
  const now = options.now ?? (() => Date.now());
  const log =
    options.log ??
    ((message: string, error?: unknown) => console.error(message, error));

  let db: Database.Database | null = null;
  let degradedUntil = 0;
  let lastPrune = 0;

  const memory = new Map<string, Bucket>();
  let memoryDay = "";
  let memoryBlockedToday = 0;

  function hash(key: string): string {
    return createHmac("sha256", salt).update(key).digest("hex");
  }

  function open(): Database.Database {
    if (db) return db;

    mkdirSync(path.dirname(dbPath), { recursive: true });

    const instance = new Database(dbPath);
    instance.pragma("journal_mode = WAL");
    instance.pragma("busy_timeout = 5000");
    instance.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        reset_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS rate_limits_reset_at
        ON rate_limits (reset_at);

      CREATE TABLE IF NOT EXISTS rate_limit_daily (
        day TEXT PRIMARY KEY,
        blocked INTEGER NOT NULL DEFAULT 0
      );
    `);

    db = instance;
    return instance;
  }

  function prune(instance: Database.Database, ms: number): void {
    if (ms - lastPrune < PRUNE_INTERVAL_MS) return;

    lastPrune = ms;
    instance.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(ms);
    instance
      .prepare("DELETE FROM rate_limit_daily WHERE day < ?")
      .run(dayKey(ms - METRICS_RETENTION_DAYS * DAY_MS));
  }

  function persistentTake(
    hashed: string,
    limit: number,
    windowMs: number,
    ms: number,
  ): boolean {
    const instance = open();
    prune(instance, ms);

    const transaction = instance.transaction(() => {
      const row = instance
        .prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?")
        .get(hashed) as { count: number; reset_at: number } | undefined;

      if (!row || row.reset_at <= ms) {
        instance
          .prepare(
            `INSERT INTO rate_limits (key, count, reset_at, updated_at)
             VALUES (?, 1, ?, ?)
             ON CONFLICT(key) DO UPDATE SET
               count = 1,
               reset_at = excluded.reset_at,
               updated_at = excluded.updated_at`,
          )
          .run(hashed, ms + windowMs, ms);

        return true;
      }

      const count = row.count + 1;
      instance
        .prepare("UPDATE rate_limits SET count = ?, updated_at = ? WHERE key = ?")
        .run(count, ms, hashed);

      const allowed = count <= limit;

      if (!allowed) {
        instance
          .prepare(
            `INSERT INTO rate_limit_daily (day, blocked) VALUES (?, 1)
             ON CONFLICT(day) DO UPDATE SET blocked = blocked + 1`,
          )
          .run(dayKey(ms));
      }

      return allowed;
    });

    return transaction.immediate();
  }

  function memoryTake(
    hashed: string,
    limit: number,
    windowMs: number,
    ms: number,
  ): boolean {
    if (memory.size >= MEMORY_MAX_ENTRIES) {
      for (const [key, bucket] of memory) {
        if (bucket.resetAt <= ms) memory.delete(key);
      }
    }

    const bucket = memory.get(hashed);
    let allowed: boolean;

    if (!bucket || bucket.resetAt <= ms) {
      memory.set(hashed, { count: 1, resetAt: ms + windowMs });
      allowed = true;
    } else {
      bucket.count += 1;
      allowed = bucket.count <= limit;
    }

    if (!allowed) {
      const day = dayKey(ms);
      if (memoryDay !== day) {
        memoryDay = day;
        memoryBlockedToday = 0;
      }
      memoryBlockedToday += 1;
    }

    return allowed;
  }

  function take(key: string, limit: number, windowMs: number): boolean {
    const ms = now();
    const hashed = hash(key);

    if (ms >= degradedUntil) {
      try {
        return persistentTake(hashed, limit, windowMs, ms);
      } catch (error) {
        degradedUntil = ms + DEGRADED_MS;
        log(
          "[rate-limit] almacén no disponible; usando memoria por 60 s",
          error,
        );
      }
    }

    return memoryTake(hashed, limit, windowMs, ms);
  }

  function clear(key: string): void {
    const hashed = hash(key);
    memory.delete(hashed);

    // Se intenta siempre: si el login fue válido, conviene limpiar el
    // contador persistente aunque el almacén esté degradado.
    try {
      open().prepare("DELETE FROM rate_limits WHERE key = ?").run(hashed);
    } catch (error) {
      degradedUntil = now() + DEGRADED_MS;
      log("[rate-limit] no se pudo limpiar el límite persistente", error);
    }
  }

  function metrics(): RateLimitMetrics {
    const ms = now();

    if (ms >= degradedUntil) {
      try {
        const row = open()
          .prepare("SELECT blocked FROM rate_limit_daily WHERE day = ?")
          .get(dayKey(ms)) as { blocked: number } | undefined;

        return { blockedToday: row?.blocked ?? 0, persistent: true };
      } catch (error) {
        degradedUntil = ms + DEGRADED_MS;
        log("[rate-limit] no se pudieron leer las métricas", error);
      }
    }

    return { blockedToday: memoryBlockedToday, persistent: false };
  }

  function close(): void {
    db?.close();
    db = null;
    lastPrune = 0;
    memory.clear();
    memoryDay = "";
    memoryBlockedToday = 0;
  }

  return { take, clear, metrics, close };
}

let store: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (!store) store = createRateLimitStore();
  return store;
}

/**
 * Devuelve `true` si la acción está permitida. Si el almacén persistente no
 * está disponible, usa memoria y lo registra.
 */
export function take(key: string, limit: number, windowMs: number): boolean {
  return getStore().take(key, limit, windowMs);
}

export function clearLimit(key: string): void {
  getStore().clear(key);
}

export function getRateLimitMetrics(): RateLimitMetrics {
  return getStore().metrics();
}
