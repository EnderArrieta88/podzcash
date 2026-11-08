import Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const RETENTION_DAYS = 90;
const DB_PATH = path.resolve(
  process.cwd(),
  process.env.ANALYTICS_DB_PATH ?? "./.data/analytics.db",
);

type GlobalWithAnalytics = typeof globalThis & {
  podzcashAnalyticsDb?: Database.Database;
  podzcashAnalyticsPruned?: boolean;
};

const globalForAnalytics = globalThis as GlobalWithAnalytics;

const BASE_BOT_PATTERN =
  "bot|crawler|spider|preview|facebookexternalhit|slackbot|twitterbot|discordbot|telegrambot|whatsapp|curl|wget|python-requests|go-http-client|headless|monitoring|uptime|pingdom|statuscake|semrush|ahrefs|mj12bot";

function botPattern(): RegExp {
  const extra = (process.env.ANALYTICS_BOT_PATTERNS ?? "")
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean);

  try {
    return new RegExp([BASE_BOT_PATTERN, ...extra].join("|"), "i");
  } catch {
    return new RegExp(BASE_BOT_PATTERN, "i");
  }
}

export type UserAgentInfo = {
  isBot: boolean;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  app: string;
};

export function classifyUserAgent(userAgent: string | null): UserAgentInfo {
  const ua = (userAgent ?? "").trim();
  const lower = ua.toLowerCase();

  if (!ua || botPattern().test(lower)) {
    return {
      isBot: true,
      device: "unknown",
      app: ua ? "Bot" : "Unknown",
    };
  }

  const device =
    /ipad|tablet/.test(lower)
      ? "tablet"
      : /iphone|ipod|android|mobile/.test(lower)
        ? "mobile"
        : "desktop";

  const app =
    /applecoremedia|itunes/.test(lower)
      ? "Apple Podcasts"
      : /spotify/.test(lower)
        ? "Spotify"
        : /pocketcasts/.test(lower)
          ? "Pocket Casts"
          : /overcast/.test(lower)
            ? "Overcast"
            : /podcastaddict/.test(lower)
              ? "Podcast Addict"
              : /castbox/.test(lower)
                ? "Castbox"
                : /vlc/.test(lower)
                  ? "VLC"
                  : /mozilla|chrome|safari|firefox|edg\//.test(lower)
                    ? "Web"
                    : "Other";

  return { isBot: false, device, app };
}

export function isPrefetchRequest(headers: Headers): boolean {
  const purpose =
    headers.get("purpose") ??
    headers.get("sec-purpose") ??
    headers.get("x-purpose") ??
    headers.get("x-moz") ??
    "";

  return /prefetch|preview/i.test(purpose);
}

function hashValue(value: string, day: string): string {
  const salt =
    process.env.ANALYTICS_SALT ?? process.env.AUTH_SECRET ?? "podzcash-analytics";

  return createHash("sha256")
    .update(`${day}|${value}|${salt}`)
    .digest("hex");
}

function refererHost(referer: string | null): string | null {
  if (!referer) return null;

  try {
    return new URL(referer).host;
  } catch {
    return null;
  }
}

function getDb(): Database.Database {
  if (globalForAnalytics.podzcashAnalyticsDb) {
    return globalForAnalytics.podzcashAnalyticsDb;
  }

  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS media_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId TEXT NOT NULL,
      episodeId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      method TEXT NOT NULL,
      status INTEGER NOT NULL,
      rangeStart INTEGER,
      rangeEnd INTEGER,
      bytes INTEGER NOT NULL DEFAULT 0,
      totalBytes INTEGER NOT NULL DEFAULT 0,
      durationSec INTEGER,
      ipHash TEXT,
      uaHash TEXT,
      userAgent TEXT,
      refererHost TEXT,
      country TEXT,
      device TEXT,
      app TEXT,
      isBot INTEGER NOT NULL DEFAULT 0,
      isPrefetch INTEGER NOT NULL DEFAULT 0,
      day TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS media_events_episode_day
      ON media_events (episodeId, day);
    CREATE INDEX IF NOT EXISTS media_events_client_day
      ON media_events (episodeId, ipHash, uaHash, day);
  `);

  if (!globalForAnalytics.podzcashAnalyticsPruned) {
    globalForAnalytics.podzcashAnalyticsPruned = true;
    const cutoff = new Date(
      Date.now() - RETENTION_DAYS * 86_400_000,
    ).toISOString();
    db.prepare(`DELETE FROM media_events WHERE createdAt < ?`).run(cutoff);
  }

  globalForAnalytics.podzcashAnalyticsDb = db;
  return db;
}

export type MediaEventInput = {
  episodeId: string;
  channelId: string;
  method: string;
  status: number;
  rangeStart: number | null;
  rangeEnd: number | null;
  bytes: number;
  totalBytes: number;
  durationSec: number | null;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  isPrefetch: boolean;
};

export type AnalyticsEvent = {
  requestId: string;
  method: string;
  bytes: number;
  totalBytes: number;
  durationSec: number | null;
  ipHash: string | null;
  uaHash: string | null;
  isBot: number;
  isPrefetch: number;
};

export type EpisodeStats = {
  days: number;
  rawDownloads: number;
  validDownloads: number;
  uniqueClients: number;
  bytes: number;
};

export function summarizeMediaEvents(
  events: AnalyticsEvent[],
): Omit<EpisodeStats, "days"> {
  const downloads = events.filter((event) => event.method === "GET");
  const clients = new Map<
    string,
    {
      bytes: number;
      durationSec: number | null;
      totalBytes: number;
    }
  >();

  for (const event of downloads) {
    if (event.isBot || event.isPrefetch) continue;

    const client = `${event.ipHash ?? event.requestId}|${
      event.uaHash ?? event.requestId
    }`;
    const current = clients.get(client) ?? {
      bytes: 0,
      durationSec: null,
      totalBytes: 0,
    };

    current.bytes += event.bytes;
    current.durationSec = current.durationSec ?? event.durationSec;
    current.totalBytes = current.totalBytes || event.totalBytes;
    clients.set(client, current);
  }

  let validDownloads = 0;

  for (const client of clients.values()) {
    const duration = client.durationSec ?? 0;
    const totalBytes = client.totalBytes ?? 0;

    const thresholdBytes =
      duration > 0 && totalBytes > 0
        ? totalBytes *
          (Math.min(60, Math.max(1, duration * 0.1)) / duration)
        : 1_048_576;

    if (client.bytes >= thresholdBytes) validDownloads += 1;
  }

  return {
    rawDownloads: downloads.length,
    validDownloads,
    uniqueClients: clients.size,
    bytes: downloads.reduce((sum, event) => sum + event.bytes, 0),
  };
}

export function getEpisodeStats(episodeId: string, days = 30): EpisodeStats {
  const db = getDb();
  const cutoff = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const events = db
    .prepare(
      `SELECT requestId, method, bytes, totalBytes, durationSec, ipHash, uaHash, isBot, isPrefetch
       FROM media_events
       WHERE episodeId = ? AND day >= ?`,
    )
    .all(episodeId, cutoff) as AnalyticsEvent[];

  return { days, ...summarizeMediaEvents(events) };
}

export function recordMediaEvent(input: MediaEventInput): void {
  const db = getDb();
  const day = new Date().toISOString().slice(0, 10);
  const ua = input.userAgent ?? "";
  const info = classifyUserAgent(input.userAgent);

  db.prepare(
    `INSERT INTO media_events (
      requestId, episodeId, channelId, method, status,
      rangeStart, rangeEnd, bytes, totalBytes, durationSec,
      ipHash, uaHash, userAgent, refererHost, country, device, app,
      isBot, isPrefetch, day, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    input.episodeId,
    input.channelId,
    input.method,
    input.status,
    input.rangeStart,
    input.rangeEnd,
    input.bytes,
    input.totalBytes,
    input.durationSec,
    input.ip ? hashValue(input.ip, day) : null,
    ua ? hashValue(ua, day) : null,
    ua.slice(0, 400) || null,
    refererHost(input.referer),
    input.country,
    info.device,
    info.app,
    info.isBot ? 1 : 0,
    input.isPrefetch ? 1 : 0,
    day,
    new Date().toISOString(),
  );
}

export const analyticsRetentionDays = RETENTION_DAYS;
