import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { ensurePlaybackProgressSchema } from "./progress-migration";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("ensurePlaybackProgressSchema", () => {
  it("crea la tabla del progreso y es idempotente", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "podzcash-progress-"));
    const file = path.join(dir, "test.db");

    const setup = new Database(file);
    setup.exec(`
      CREATE TABLE "User" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Episode" ("id" TEXT PRIMARY KEY);
      INSERT INTO "User" ("id") VALUES ('u1');
      INSERT INTO "Episode" ("id") VALUES ('e1');
    `);
    setup.close();

    process.env.DATABASE_URL = `file:${file}`;

    ensurePlaybackProgressSchema();
    ensurePlaybackProgressSchema();

    const db = new Database(file);

    const columns = (
      db.prepare(`PRAGMA table_info("PlaybackProgress")`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);

    expect(columns).toEqual(
      expect.arrayContaining([
        "userId",
        "episodeId",
        "positionSec",
        "durationSec",
        "createdAt",
        "updatedAt",
      ]),
    );

    db.prepare(
      `INSERT INTO "PlaybackProgress" ("userId", "episodeId", "positionSec", "durationSec", "updatedAt")
       VALUES ('u1', 'e1', 42, 1800, CURRENT_TIMESTAMP)`,
    ).run();

    expect(
      (
        db
          .prepare(
            `SELECT "positionSec" FROM "PlaybackProgress" WHERE "userId" = 'u1'`,
          )
          .get() as { positionSec: number }
      ).positionSec,
    ).toBe(42);

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
