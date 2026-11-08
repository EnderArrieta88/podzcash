import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { ensureFeedSchema } from "./feed-migration";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("ensureFeedSchema", () => {
  it("agrega las columnas del feed a una base existente y es idempotente", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "podzcash-feed-"));
    const file = path.join(dir, "test.db");

    const setup = new Database(file);
    setup.exec(`
      CREATE TABLE "Channel" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Episode" ("id" TEXT PRIMARY KEY);
      INSERT INTO "Channel" ("id") VALUES ('c1');
      INSERT INTO "Episode" ("id") VALUES ('e1');
    `);
    setup.close();

    process.env.DATABASE_URL = `file:${file}`;

    ensureFeedSchema();
    ensureFeedSchema();

    const db = new Database(file, { readonly: true });

    const channelColumns = (
      db.prepare(`PRAGMA table_info("Channel")`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);
    const episodeColumns = (
      db.prepare(`PRAGMA table_info("Episode")`).all() as Array<{
        name: string;
      }>
    ).map((column) => column.name);

    expect(channelColumns).toEqual(
      expect.arrayContaining([
        "feedLanguage",
        "feedCategory",
        "feedExplicit",
        "ownerEmail",
        "block",
        "newFeedUrl",
      ]),
    );
    expect(episodeColumns).toEqual(
      expect.arrayContaining([
        "season",
        "episodeNumber",
        "episodeType",
        "explicit",
      ]),
    );

    const channel = db
      .prepare(
        `SELECT "feedLanguage", "feedCategory", "feedExplicit", "block" FROM "Channel" WHERE "id" = 'c1'`,
      )
      .get() as {
      feedLanguage: string;
      feedCategory: string;
      feedExplicit: number;
      block: number;
    };
    const episode = db
      .prepare(
        `SELECT "episodeType", "explicit" FROM "Episode" WHERE "id" = 'e1'`,
      )
      .get() as { episodeType: string; explicit: number | null };

    expect(channel).toEqual({
      feedLanguage: "es",
      feedCategory: "Technology",
      feedExplicit: 0,
      block: 0,
    });
    expect(episode).toEqual({ episodeType: "full", explicit: null });

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("asigna números de episodio estables a los existentes", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "podzcash-feed-"));
    const file = path.join(dir, "test.db");

    const setup = new Database(file);
    setup.exec(`
      CREATE TABLE "Channel" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Episode" (
        "id" TEXT PRIMARY KEY,
        "channelId" TEXT NOT NULL,
        "publishedAt" TEXT,
        "createdAt" TEXT NOT NULL,
        "episodeNumber" INTEGER
      );
      INSERT INTO "Channel" ("id") VALUES ('c1');
      INSERT INTO "Episode" ("id", "channelId", "publishedAt", "createdAt", "episodeNumber")
        VALUES
          ('e2', 'c1', '2026-01-02T00:00:00.000Z', '2026-01-02T00:00:00.000Z', NULL),
          ('e1', 'c1', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', NULL),
          ('e3', 'c1', '2026-01-03T00:00:00.000Z', '2026-01-03T00:00:00.000Z', 10);
    `);
    setup.close();

    process.env.DATABASE_URL = `file:${file}`;

    ensureFeedSchema();
    ensureFeedSchema();

    const db = new Database(file, { readonly: true });
    const rows = db
      .prepare(`SELECT "id", "episodeNumber" FROM "Episode" ORDER BY "id"`)
      .all() as Array<{ id: string; episodeNumber: number }>;

    expect(rows).toEqual([
      { id: "e1", episodeNumber: 11 },
      { id: "e2", episodeNumber: 12 },
      { id: "e3", episodeNumber: 10 },
    ]);

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
