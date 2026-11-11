import "server-only";
import { addMissingColumns, openDatabase } from "@/lib/sqlite-bridge";

/**
 * Migración puente para la moderación de comentarios:
 *
 * - `Channel.commentNotify` y `Channel.commentsSeenAt` para la bandeja de avisos.
 * - `Report.reporterId` para saber quién reportó un comentario.
 * - Tabla `EpisodeComment` para instalaciones donde todavía no se escribió
 *   ningún comentario y `listEpisodeComments` aún no la creó.
 */
export function ensureCommentsSchema(): void {
  const db = openDatabase();
  if (!db) return;

  try {
    addMissingColumns(db, "Channel", [
      ["commentNotify", `"commentNotify" TEXT NOT NULL DEFAULT 'inbox'`],
      ["commentsSeenAt", `"commentsSeenAt" DATETIME`],
    ]);

    addMissingColumns(db, "Report", [["reporterId", `"reporterId" TEXT`]]);

    db.exec(`CREATE TABLE IF NOT EXISTS "EpisodeComment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "episodeId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EpisodeComment_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "EpisodeComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`);

    db.exec(
      `CREATE INDEX IF NOT EXISTS "EpisodeComment_episodeId_createdAt_idx" ON "EpisodeComment"("episodeId", "createdAt");`,
    );
    db.exec(
      `CREATE INDEX IF NOT EXISTS "EpisodeComment_userId_idx" ON "EpisodeComment"("userId");`,
    );
  } finally {
    db.close();
  }
}
