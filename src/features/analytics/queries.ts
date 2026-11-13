import "server-only";
import { globalForAnalytics, getDb } from "./db";
import { analyticsDay, dayRange } from "./dates";
import { aggregateDay, buildDashboard, filterWhere } from "./dashboard";
import type {
  AnalyticsEvent,
  AnalyticsFilters,
  DailyStats,
  DashboardData,
  EpisodeStats,
  ListenEvent,
  ProgressEvent,
} from "./types";

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

  const distinct = (field: "country" | "device" | "app") =>
    (
      db
        .prepare(
          `SELECT DISTINCT ${field} AS value FROM media_events
           WHERE episodeId = ? AND ${field} IS NOT NULL ORDER BY value`,
        )
        .all(filters.episodeId) as Array<{ value: string }>
    ).map((row) => row.value);

  return buildDashboard(
    {
      media,
      listens,
      progress,
      filterOptions: {
        countries: distinct("country"),
        devices: distinct("device"),
        apps: distinct("app"),
      },
    },
    filters,
  );
}
