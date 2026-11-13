import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { RETENTION_DAYS } from "./config";
import { getDb } from "./db";
import { analyticsDay } from "./dates";
import { classifyUserAgent } from "./user-agent";
import type {
  ListenEventInput,
  MediaEventInput,
  ProgressEventInput,
} from "./types";

function hashValue(value: string, day: string): string {
  const salt =
    process.env.ANALYTICS_SALT ??
    process.env.AUTH_SECRET ??
    "podzcash-analytics";

  return createHash("sha256").update(`${day}|${value}|${salt}`).digest("hex");
}

function refererHost(referer: string | null): string | null {
  if (!referer) return null;

  try {
    return new URL(referer).host;
  } catch {
    return null;
  }
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

/**
 * Borra los eventos y agregados de una lista de episodios. Se usa al eliminar
 * una cuenta: los datos analíticos de sus episodios no deben quedar huérfanos.
 */
export function purgeEpisodes(episodeIds: string[]): void {
  if (episodeIds.length === 0) return;

  const db = getDb();
  const placeholders = episodeIds.map(() => "?").join(", ");

  const transaction = db.transaction(() => {
    for (const table of [
      "media_events",
      "listen_events",
      "progress_events",
      "daily_stats",
    ]) {
      db.prepare(
        `DELETE FROM ${table} WHERE episodeId IN (${placeholders})`,
      ).run(...episodeIds);
    }
  });

  transaction();
}
