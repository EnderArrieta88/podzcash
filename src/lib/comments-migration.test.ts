import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { ensureCommentsSchema } from "./comments-migration";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("ensureCommentsSchema", () => {
  it("agrega las columnas de moderación y es idempotente", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "podzcash-comments-"));
    const file = path.join(dir, "test.db");

    const setup = new Database(file);
    setup.exec(`
      CREATE TABLE "Channel" ("id" TEXT PRIMARY KEY);
      CREATE TABLE "Report" ("id" TEXT PRIMARY KEY);
      INSERT INTO "Channel" ("id") VALUES ('c1');
    `);
    setup.close();

    process.env.DATABASE_URL = `file:${file}`;

    ensureCommentsSchema();
    ensureCommentsSchema();

    const db = new Database(file, { readonly: true });

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
    const tables = (
      db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
        .all() as Array<{ name: string }>
    ).map((table) => table.name);

    expect(channelColumns).toEqual(
      expect.arrayContaining(["commentNotify", "commentsSeenAt"]),
    );
    expect(reportColumns).toContain("reporterId");
    expect(tables).toContain("EpisodeComment");

    const channel = db
      .prepare(`SELECT "commentNotify" FROM "Channel" WHERE "id" = 'c1'`)
      .get() as { commentNotify: string };

    expect(channel.commentNotify).toBe("inbox");

    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
