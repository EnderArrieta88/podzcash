import "server-only";
import { openDatabase } from "@/lib/sqlite-bridge";

/**
 * Migración puente para el progreso de reproducción. El deploy no ejecuta
 * `prisma migrate deploy`: la tabla se crea al arrancar si no existe.
 */
export function ensurePlaybackProgressSchema(): void {
  const db = openDatabase();
  if (!db) return;

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS "PlaybackProgress" (
      "userId" TEXT NOT NULL,
      "episodeId" TEXT NOT NULL,
      "positionSec" REAL NOT NULL DEFAULT 0,
      "durationSec" REAL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      PRIMARY KEY ("userId", "episodeId"),
      CONSTRAINT "PlaybackProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "PlaybackProgress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`);

    db.exec(
      `CREATE INDEX IF NOT EXISTS "PlaybackProgress_userId_updatedAt_idx" ON "PlaybackProgress"("userId", "updatedAt");`,
    );
  } finally {
    db.close();
  }
}
