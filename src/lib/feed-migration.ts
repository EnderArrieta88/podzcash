import "server-only";
import type Database from "better-sqlite3";
import { addMissingColumns, columns, openDatabase } from "@/lib/sqlite-bridge";

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
  const db = openDatabase();
  if (!db) return;

  try {
    addMissingColumns(db, "Channel", [
      ["feedLanguage", `"feedLanguage" TEXT NOT NULL DEFAULT 'es'`],
      ["feedCategory", `"feedCategory" TEXT NOT NULL DEFAULT 'Technology'`],
      ["feedExplicit", `"feedExplicit" BOOLEAN NOT NULL DEFAULT 0`],
      ["ownerEmail", `"ownerEmail" TEXT`],
      ["block", `"block" BOOLEAN NOT NULL DEFAULT 0`],
      ["newFeedUrl", `"newFeedUrl" TEXT`],
    ]);

    addMissingColumns(db, "Episode", [
      ["season", `"season" INTEGER`],
      ["episodeNumber", `"episodeNumber" INTEGER`],
      ["episodeType", `"episodeType" TEXT NOT NULL DEFAULT 'full'`],
      ["explicit", `"explicit" BOOLEAN`],
    ]);

    backfillEpisodeNumbers(db);
  } finally {
    db.close();
  }
}
