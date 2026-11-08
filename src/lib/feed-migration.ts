import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

type Column = { name: string };

function databasePath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return null;
  return path.resolve(process.cwd(), url.slice("file:".length));
}

function columns(db: Database.Database, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info("${table}")`).all() as Column[];
  return new Set(rows.map((row) => row.name));
}

function backfillEpisodeNumbers(db: Database.Database): void {
  const episodeColumns = columns(db, "Episode");
  const required = ["channelId", "publishedAt", "createdAt", "episodeNumber"];

  if (!required.every((column) => episodeColumns.has(column))) return;

  const channels = db
    .prepare(`SELECT DISTINCT "channelId" FROM "Episode"`)
    .all() as Array<{ channelId: string }>;

  const select = db.prepare(
    `SELECT "id", "episodeNumber" FROM "Episode"
     WHERE "channelId" = ?
     ORDER BY COALESCE("publishedAt", "createdAt") ASC, "id" ASC`,
  );
  const update = db.prepare(
    `UPDATE "Episode" SET "episodeNumber" = ? WHERE "id" = ?`,
  );

  const transaction = db.transaction(() => {
    for (const { channelId } of channels) {
      const episodes = select.all(channelId) as Array<{
        id: string;
        episodeNumber: number | null;
      }>;
      let next =
        episodes.reduce(
          (max, episode) => Math.max(max, episode.episodeNumber ?? 0),
          0,
        ) + 1;

      for (const episode of episodes) {
        if (episode.episodeNumber == null) {
          update.run(next, episode.id);
          next += 1;
        }
      }
    }
  });

  transaction();
}

/**
 * Migración puente para SQLite: agrega las columnas del feed antes de que la
 * app empiece a consultarlas. La migración de Prisma equivalente mantiene las
 * instalaciones nuevas al día; esto cubre la base de producción, que se
 * actualiza al reiniciar el proceso.
 */
export function ensureFeedSchema(): void {
  const file = databasePath();
  if (!file || !existsSync(file)) return;

  const db = new Database(file);

  try {
    const channel = columns(db, "Channel");
    const channelColumns: Array<[string, string]> = [
      ["feedLanguage", `"feedLanguage" TEXT NOT NULL DEFAULT 'es'`],
      ["feedCategory", `"feedCategory" TEXT NOT NULL DEFAULT 'Technology'`],
      ["feedExplicit", `"feedExplicit" BOOLEAN NOT NULL DEFAULT 0`],
      ["ownerEmail", `"ownerEmail" TEXT`],
      ["block", `"block" BOOLEAN NOT NULL DEFAULT 0`],
      ["newFeedUrl", `"newFeedUrl" TEXT`],
    ];

    for (const [name, definition] of channelColumns) {
      if (!channel.has(name)) {
        db.exec(`ALTER TABLE "Channel" ADD COLUMN ${definition};`);
      }
    }

    const episode = columns(db, "Episode");
    const episodeColumns: Array<[string, string]> = [
      ["season", `"season" INTEGER`],
      ["episodeNumber", `"episodeNumber" INTEGER`],
      ["episodeType", `"episodeType" TEXT NOT NULL DEFAULT 'full'`],
      ["explicit", `"explicit" BOOLEAN`],
    ];

    for (const [name, definition] of episodeColumns) {
      if (!episode.has(name)) {
        db.exec(`ALTER TABLE "Episode" ADD COLUMN ${definition};`);
      }
    }

    backfillEpisodeNumbers(db);
  } finally {
    db.close();
  }
}
