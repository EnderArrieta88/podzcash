import Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const RETENTION_DAYS = 90;
const DB_PATH = path.resolve(
  process.cwd(),
  process.env.ANALYTICS_DB_PATH ?? "./.data/analytics.db",
);
const DAY_MS = 86_400_000;

type GlobalWithAnalytics = typeof globalThis & {
  podzcashAnalyticsDb?: Database.Database;
  podzcashAnalyticsPruned?: boolean;
  podzcashAnalyticsRebuilt?: Map<string, number>;
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

/**
 * Día de analítica en la zona configurada. Se usa para agrupar eventos y
 * agregados; por defecto UTC.
 */
export function analyticsDay(date = new Date()): string {
  const timeZone = process.env.ANALYTICS_TIMEZONE?.trim() || "UTC";

  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function dayRange(days: number): string[] {
  const result: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    result.push(analyticsDay(new Date(Date.now() - index * DAY_MS)));
  }

  return result;
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

function clientKey(event: AnalyticsEvent | ListenEvent): string {
  return `${event.ipHash ?? event.requestId}|${event.uaHash ?? event.requestId}`;
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

    CREATE TABLE IF NOT EXISTS listen_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId TEXT NOT NULL,
      episodeId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      ipHash TEXT,
      uaHash TEXT,
      device TEXT,
      app TEXT,
      country TEXT,
      isBot INTEGER NOT NULL DEFAULT 0,
      day TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS listen_events_episode_day
      ON listen_events (episodeId, day);

    CREATE TABLE IF NOT EXISTS progress_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requestId TEXT NOT NULL,
      episodeId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      percent INTEGER NOT NULL,
      ipHash TEXT,
      uaHash TEXT,
      device TEXT,
      app TEXT,
      country TEXT,
      isBot INTEGER NOT NULL DEFAULT 0,
      day TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS progress_events_episode_day
      ON progress_events (episodeId, day);

    CREATE TABLE IF NOT EXISTS daily_stats (
      day TEXT NOT NULL,
      episodeId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      rawDownloads INTEGER NOT NULL DEFAULT 0,
      validDownloads INTEGER NOT NULL DEFAULT 0,
      starts INTEGER NOT NULL DEFAULT 0,
      verifiedListens INTEGER NOT NULL DEFAULT 0,
      uniqueClients INTEGER NOT NULL DEFAULT 0,
      bytes INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL,
      PRIMARY KEY (day, episodeId)
    );
    CREATE INDEX IF NOT EXISTS daily_stats_episode_day
      ON daily_stats (episodeId, day);
  `);

  const listenColumns = db
    .prepare(`PRAGMA table_info("listen_events")`)
    .all() as Array<{ name: string }>;

  if (!listenColumns.some((column) => column.name === "country")) {
    db.exec(`ALTER TABLE "listen_events" ADD COLUMN "country" TEXT;`);
  }

  if (!globalForAnalytics.podzcashAnalyticsPruned) {
    globalForAnalytics.podzcashAnalyticsPruned = true;
    const cutoff = new Date(
      Date.now() - RETENTION_DAYS * DAY_MS,
    ).toISOString();
    db.prepare(`DELETE FROM media_events WHERE createdAt < ?`).run(cutoff);
    db.prepare(`DELETE FROM listen_events WHERE createdAt < ?`).run(cutoff);
    db.prepare(`DELETE FROM progress_events WHERE createdAt < ?`).run(cutoff);
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

export type ListenEventInput = {
  episodeId: string;
  channelId: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
};

export type ProgressEventInput = {
  episodeId: string;
  channelId: string;
  percent: number;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
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

export type ListenEvent = {
  requestId: string;
  episodeId: string;
  channelId: string;
  ipHash: string | null;
  uaHash: string | null;
  isBot: number;
  day?: string;
};

export type ProgressEvent = ListenEvent & {
  percent: number;
  device: string | null;
  app: string | null;
  country: string | null;
};

export type EpisodeStats = {
  days: number;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type DailyStats = {
  day: string;
  episodeId: string;
  channelId: string;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

type MediaAnalysis = {
  rawDownloads: number;
  validDownloads: number;
  uniqueClients: number;
  bytes: number;
  validClients: Set<string>;
};

function analyzeMedia(events: AnalyticsEvent[]): MediaAnalysis {
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

    const key = clientKey(event);
    const current = clients.get(key) ?? {
      bytes: 0,
      durationSec: null,
      totalBytes: 0,
    };

    current.bytes += event.bytes;
    current.durationSec = current.durationSec ?? event.durationSec;
    current.totalBytes = current.totalBytes || event.totalBytes;
    clients.set(key, current);
  }

  const validClients = new Set<string>();

  for (const [key, client] of clients) {
    const duration = client.durationSec ?? 0;
    const totalBytes = client.totalBytes ?? 0;

    const thresholdBytes =
      duration > 0 && totalBytes > 0
        ? totalBytes *
          (Math.min(60, Math.max(1, duration * 0.1)) / duration)
        : 1_048_576;

    if (client.bytes >= thresholdBytes) validClients.add(key);
  }

  return {
    rawDownloads: downloads.length,
    validDownloads: validClients.size,
    uniqueClients: clients.size,
    bytes: downloads.reduce((sum, event) => sum + event.bytes, 0),
    validClients,
  };
}

export function summarizeMediaEvents(
  events: AnalyticsEvent[],
): Omit<EpisodeStats, "days" | "starts" | "verifiedListens"> {
  const analysis = analyzeMedia(events);

  return {
    rawDownloads: analysis.rawDownloads,
    validDownloads: analysis.validDownloads,
    uniqueClients: analysis.uniqueClients,
    bytes: analysis.bytes,
  };
}

export function aggregateDay(
  day: string,
  mediaEvents: Array<AnalyticsEvent & { episodeId: string; channelId: string }>,
  listenEvents: ListenEvent[],
): DailyStats[] {
  const mediaByEpisode = new Map<string, (AnalyticsEvent & { episodeId: string; channelId: string })[]>();
  const listenByEpisode = new Map<string, ListenEvent[]>();

  for (const event of mediaEvents) {
    const list = mediaByEpisode.get(event.episodeId) ?? [];
    list.push(event);
    mediaByEpisode.set(event.episodeId, list);
  }

  for (const event of listenEvents) {
    const list = listenByEpisode.get(event.episodeId) ?? [];
    list.push(event);
    listenByEpisode.set(event.episodeId, list);
  }

  const episodes = new Set([
    ...mediaByEpisode.keys(),
    ...listenByEpisode.keys(),
  ]);
  const rows: DailyStats[] = [];

  for (const episodeId of episodes) {
    const media = mediaByEpisode.get(episodeId) ?? [];
    const listens = listenByEpisode.get(episodeId) ?? [];
    const analysis = analyzeMedia(media);
    const starts = new Set(
      listens
        .filter((event) => !event.isBot)
        .map((event) => clientKey(event)),
    );
    const verifiedListens = [...starts].filter((key) =>
      analysis.validClients.has(key),
    ).length;

    rows.push({
      day,
      episodeId,
      channelId: media[0]?.channelId ?? listens[0]?.channelId ?? "",
      rawDownloads: analysis.rawDownloads,
      validDownloads: analysis.validDownloads,
      starts: starts.size,
      verifiedListens,
      uniqueClients: analysis.uniqueClients,
      bytes: analysis.bytes,
    });
  }

  return rows;
}

function loadDay(day: string): {
  media: Array<AnalyticsEvent & { episodeId: string; channelId: string }>;
  listens: ListenEvent[];
} {
  const db = getDb();

  const media = db
    .prepare(
      `SELECT requestId, episodeId, channelId, method, bytes, totalBytes,
              durationSec, ipHash, uaHash, isBot, isPrefetch
       FROM media_events WHERE day = ?`,
    )
    .all(day) as Array<
    AnalyticsEvent & { episodeId: string; channelId: string }
  >;

  const listens = db
    .prepare(
      `SELECT requestId, episodeId, channelId, ipHash, uaHash, isBot
       FROM listen_events WHERE day = ?`,
    )
    .all(day) as ListenEvent[];

  return { media, listens };
}

export function rebuildDay(day: string): DailyStats[] {
  const db = getDb();
  const { media, listens } = loadDay(day);
  const rows = aggregateDay(day, media, listens);

  const transaction = db.transaction(() => {
    db.prepare(`DELETE FROM daily_stats WHERE day = ?`).run(day);
    const insert = db.prepare(
      `INSERT INTO daily_stats (
        day, episodeId, channelId, rawDownloads, validDownloads,
        starts, verifiedListens, uniqueClients, bytes, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const row of rows) {
      insert.run(
        row.day,
        row.episodeId,
        row.channelId,
        row.rawDownloads,
        row.validDownloads,
        row.starts,
        row.verifiedListens,
        row.uniqueClients,
        row.bytes,
        new Date().toISOString(),
      );
    }
  });

  transaction();

  const rebuilt = globalForAnalytics.podzcashAnalyticsRebuilt ?? new Map();
  rebuilt.set(day, Date.now());
  globalForAnalytics.podzcashAnalyticsRebuilt = rebuilt;

  return rows;
}

function ensureDay(day: string): void {
  const rebuilt = globalForAnalytics.podzcashAnalyticsRebuilt ?? new Map();
  const last = rebuilt.get(day) ?? 0;
  const isToday = day === analyticsDay();

  if (isToday || Date.now() - last > 5 * 60_000) {
    rebuildDay(day);
  }
}

export function reconcileDay(day: string): Array<{
  episodeId: string;
  field: string;
  expected: number;
  actual: number;
}> {
  const db = getDb();
  const { media, listens } = loadDay(day);
  const expected = aggregateDay(day, media, listens);
  const actual = db
    .prepare(`SELECT * FROM daily_stats WHERE day = ?`)
    .all(day) as Array<DailyStats & Record<string, unknown>>;

  const differences: Array<{
    episodeId: string;
    field: string;
    expected: number;
    actual: number;
  }> = [];
  const fields: Array<keyof DailyStats> = [
    "rawDownloads",
    "validDownloads",
    "starts",
    "verifiedListens",
    "uniqueClients",
    "bytes",
  ];

  for (const row of expected) {
    const stored = actual.find((item) => item.episodeId === row.episodeId);

    for (const field of fields) {
      const expectedValue = Number(row[field]);
      const actualValue = Number(stored?.[field] ?? 0);

      if (expectedValue !== actualValue) {
        differences.push({
          episodeId: row.episodeId,
          field,
          expected: expectedValue,
          actual: actualValue,
        });
      }
    }
  }

  return differences;
}

export function getEpisodeStats(episodeId: string, days = 30): EpisodeStats {
  const db = getDb();
  const daysList = dayRange(days);

  for (const day of daysList) ensureDay(day);

  const stats = db
    .prepare(
      `SELECT
        COALESCE(SUM(rawDownloads), 0) AS rawDownloads,
        COALESCE(SUM(validDownloads), 0) AS validDownloads,
        COALESCE(SUM(starts), 0) AS starts,
        COALESCE(SUM(verifiedListens), 0) AS verifiedListens,
        COALESCE(SUM(bytes), 0) AS bytes
       FROM daily_stats
       WHERE episodeId = ? AND day >= ?`,
    )
    .get(episodeId, daysList[0]) as {
    rawDownloads: number;
    validDownloads: number;
    starts: number;
    verifiedListens: number;
    bytes: number;
  };

  const unique = db
    .prepare(
      `SELECT COUNT(DISTINCT COALESCE(ipHash, requestId) || '|' || COALESCE(uaHash, requestId)) AS total
       FROM media_events
       WHERE episodeId = ? AND day >= ? AND method = 'GET'
         AND isBot = 0 AND isPrefetch = 0`,
    )
    .get(episodeId, daysList[0]) as { total: number };

  return {
    days,
    rawDownloads: stats.rawDownloads,
    validDownloads: stats.validDownloads,
    starts: stats.starts,
    verifiedListens: stats.verifiedListens,
    uniqueClients: unique.total,
    bytes: stats.bytes,
  };
}

export type AnalyticsFilters = {
  episodeId: string;
  from: string;
  to: string;
  country?: string;
  device?: string;
  app?: string;
};

export type AnalyticsSummary = {
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type DailyPoint = {
  day: string;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type BreakdownItem = {
  label: string;
  requests: number;
  clients: number;
  bytes: number;
};

export type RetentionPoint = {
  percent: number;
  clients: number;
};

export type DashboardData = {
  summary: AnalyticsSummary;
  daily: DailyPoint[];
  countries: BreakdownItem[];
  devices: BreakdownItem[];
  apps: BreakdownItem[];
  retention: RetentionPoint[];
  filterOptions: {
    countries: string[];
    devices: string[];
    apps: string[];
  };
};

function dayListBetween(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return dayRange(30);
  }

  const days: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end && days.length < 120) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days.length > 0 ? days : dayRange(30);
}

function filterWhere(
  filters: AnalyticsFilters,
): { clause: string; params: Array<string> } {
  const clause = [`episodeId = ?`, `day >= ?`, `day <= ?`];
  const params = [filters.episodeId, filters.from, filters.to];

  for (const [column, value] of [
    ["country", filters.country],
    ["device", filters.device],
    ["app", filters.app],
  ] as const) {
    if (!value) continue;

    if (value === "__unknown__") {
      clause.push(`${column} IS NULL`);
    } else {
      clause.push(`${column} = ?`);
      params.push(value);
    }
  }

  return { clause: clause.join(" AND "), params };
}

function breakdown(
  events: Array<
    AnalyticsEvent & {
      episodeId: string;
      channelId: string;
      country: string | null;
      device: string | null;
      app: string | null;
    }
  >,
  field: "country" | "device" | "app",
): BreakdownItem[] {
  const groups = new Map<
    string,
    { requests: number; clients: Set<string>; bytes: number }
  >();

  for (const event of events) {
    if (event.method !== "GET" || event.isBot || event.isPrefetch) continue;

    const label = event[field] || "Desconocido";
    const group = groups.get(label) ?? {
      requests: 0,
      clients: new Set<string>(),
      bytes: 0,
    };

    group.requests += 1;
    group.clients.add(clientKey(event));
    group.bytes += event.bytes;
    groups.set(label, group);
  }

  return [...groups.entries()]
    .map(([label, group]) => ({
      label,
      requests: group.requests,
      clients: group.clients.size,
      bytes: group.bytes,
    }))
    .sort((a, b) => b.clients - a.clients || b.requests - a.requests)
    .slice(0, 10);
}

export function getDashboardData(filters: AnalyticsFilters): DashboardData {
  const db = getDb();
  const where = filterWhere(filters);

  const media = db
    .prepare(
      `SELECT requestId, episodeId, channelId, method, bytes, totalBytes,
              durationSec, ipHash, uaHash, isBot, isPrefetch, day,
              country, device, app
       FROM media_events WHERE ${where.clause}`,
    )
    .all(...where.params) as Array<
    AnalyticsEvent & {
      episodeId: string;
      channelId: string;
      day: string;
      country: string | null;
      device: string | null;
      app: string | null;
    }
  >;

  const listens = db
    .prepare(
      `SELECT requestId, episodeId, channelId, ipHash, uaHash, isBot, day
       FROM listen_events WHERE ${where.clause}`,
    )
    .all(...where.params) as ListenEvent[];

  const progress = db
    .prepare(
      `SELECT requestId, episodeId, channelId, percent, ipHash, uaHash,
              device, app, country, isBot
       FROM progress_events WHERE ${where.clause}`,
    )
    .all(...where.params) as ProgressEvent[];

  const analysis = analyzeMedia(media);
  const starts = new Set(
    listens.filter((event) => !event.isBot).map((event) => clientKey(event)),
  );
  const verifiedListens = [...starts].filter((key) =>
    analysis.validClients.has(key),
  ).length;

  const daily: DailyPoint[] = [];

  for (const day of dayListBetween(filters.from, filters.to)) {
    const dayMedia = media.filter((event) => event.day === day);
    const dayListens = listens.filter((event) => event.day === day);

    if (dayMedia.length === 0 && dayListens.length === 0) {
      daily.push({
        day,
        rawDownloads: 0,
        validDownloads: 0,
        starts: 0,
        verifiedListens: 0,
        uniqueClients: 0,
        bytes: 0,
      });
      continue;
    }

    const [row] = aggregateDay(day, dayMedia, dayListens);
    daily.push({
      day,
      rawDownloads: row?.rawDownloads ?? 0,
      validDownloads: row?.validDownloads ?? 0,
      starts: row?.starts ?? 0,
      verifiedListens: row?.verifiedListens ?? 0,
      uniqueClients: row?.uniqueClients ?? 0,
      bytes: row?.bytes ?? 0,
    });
  }

  const progressByClient = new Map<string, number>();

  for (const event of progress) {
    if (event.isBot) continue;
    const key = clientKey(event);
    progressByClient.set(
      key,
      Math.max(progressByClient.get(key) ?? 0, event.percent),
    );
  }

  const retention = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
    (percent) => ({
      percent,
      clients: [...progressByClient.values()].filter(
        (value) => value >= percent,
      ).length,
    }),
  );

  const distinct = (field: "country" | "device" | "app") =>
    (
      db
        .prepare(
          `SELECT DISTINCT ${field} AS value FROM media_events
           WHERE episodeId = ? AND ${field} IS NOT NULL ORDER BY value`,
        )
        .all(filters.episodeId) as Array<{ value: string }>
    ).map((row) => row.value);

  return {
    summary: {
      rawDownloads: analysis.rawDownloads,
      validDownloads: analysis.validDownloads,
      starts: starts.size,
      verifiedListens,
      uniqueClients: analysis.uniqueClients,
      bytes: analysis.bytes,
    },
    daily,
    countries: breakdown(media, "country"),
    devices: breakdown(media, "device"),
    apps: breakdown(media, "app"),
    retention,
    filterOptions: {
      countries: distinct("country"),
      devices: distinct("device"),
      apps: distinct("app"),
    },
  };
}

export function recordMediaEvent(input: MediaEventInput): void {
  const db = getDb();
  const day = analyticsDay();
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

export function recordListenStart(input: ListenEventInput): void {
  const db = getDb();
  const day = analyticsDay();
  const ua = input.userAgent ?? "";
  const info = classifyUserAgent(input.userAgent);

  db.prepare(
    `INSERT INTO listen_events (
      requestId, episodeId, channelId, ipHash, uaHash, device, app, country, isBot, day, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    input.episodeId,
    input.channelId,
    input.ip ? hashValue(input.ip, day) : null,
    ua ? hashValue(ua, day) : null,
    info.device,
    info.app,
    input.country,
    info.isBot ? 1 : 0,
    day,
    new Date().toISOString(),
  );
}

export function recordProgress(input: ProgressEventInput): void {
  const db = getDb();
  const day = analyticsDay();
  const ua = input.userAgent ?? "";
  const info = classifyUserAgent(input.userAgent);
  const percent = Math.max(0, Math.min(100, Math.round(input.percent)));

  db.prepare(
    `INSERT INTO progress_events (
      requestId, episodeId, channelId, percent, ipHash, uaHash,
      device, app, country, isBot, day, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    input.episodeId,
    input.channelId,
    percent,
    input.ip ? hashValue(input.ip, day) : null,
    ua ? hashValue(ua, day) : null,
    info.device,
    info.app,
    input.country,
    info.isBot ? 1 : 0,
    day,
    new Date().toISOString(),
  );
}

export const analyticsRetentionDays = RETENTION_DAYS;
