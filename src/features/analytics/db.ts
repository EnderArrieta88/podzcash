import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DAY_MS, RETENTION_DAYS } from "./config";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.ANALYTICS_DB_PATH ?? "./.data/analytics.db",
);

type GlobalWithAnalytics = typeof globalThis & {
  podzcashAnalyticsDb?: Database.Database;
  podzcashAnalyticsPruned?: boolean;
  podzcashAnalyticsRebuilt?: Map<string, number>;
};

export const globalForAnalytics = globalThis as GlobalWithAnalytics;

export function getDb(): Database.Database {
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
    const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS).toISOString();
    db.prepare(`DELETE FROM media_events WHERE createdAt < ?`).run(cutoff);
    db.prepare(`DELETE FROM listen_events WHERE createdAt < ?`).run(cutoff);
    db.prepare(`DELETE FROM progress_events WHERE createdAt < ?`).run(cutoff);
  }

  globalForAnalytics.podzcashAnalyticsDb = db;
  return db;
}
