import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { runSchemaMigrations } from "./schema-migrations";

const originalDatabaseUrl = process.env.DATABASE_URL;
let dir: string | null = null;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
  if (dir) {
    rmSync(dir, { recursive: true, force: true });
    dir = null;
  }
});

describe("runSchemaMigrations", () => {
  it("ejecuta todos los pasos y es idempotente", async () => {
    dir = mkdtempSync(path.join(tmpdir(), "podzcash-schema-"));
    const file = path.join(dir, "test.db");

    const setup = new Database(file);
    setup.exec(`
      CREATE TABLE "User" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Channel" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Episode" (
        "id" TEXT PRIMARY KEY,
        "channelId" TEXT,
        "publishedAt" DATETIME,
        "createdAt" DATETIME,
        "episodeNumber" INTEGER
      );
      CREATE TABLE "Report" ("id" TEXT PRIMARY KEY);
      INSERT INTO "User" ("id") VALUES ('u1');
      INSERT INTO "Channel" ("id") VALUES ('c1');
      INSERT INTO "Episode" ("id", "channelId", "createdAt")
        VALUES ('e1', 'c1', '2026-11-13T00:00:00Z');
    `);
    setup.close();

    process.env.DATABASE_URL = `file:${file}`;

    await runSchemaMigrations();
    await runSchemaMigrations();

    const db = new Database(file, { readonly: true });
    const tableNames = (
      db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
        .all() as Array<{ name: string }>
    ).map((row) => row.name);
    const channelColumns = (
      db.prepare(`PRAGMA table_info("Channel")`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);
    const reportColumns = (
      db.prepare(`PRAGMA table_info("Report")`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);
    const episode = db
      .prepare(`SELECT "episodeNumber" FROM "Episode" WHERE "id" = 'e1'`)
      .get() as { episodeNumber: number | null };

    expect(tableNames).toEqual(
      expect.arrayContaining(["EpisodeComment", "PlaybackProgress"]),
    );
    expect(channelColumns).toEqual(
      expect.arrayContaining([
        "feedLanguage",
        "commentNotify",
        "commentsSeenAt",
      ]),
    );
    expect(reportColumns).toContain("reporterId");
    expect(episode.episodeNumber).toBe(1);

    db.close();
  });
});
