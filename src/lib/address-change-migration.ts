import "server-only";
import { openDatabase } from "@/lib/sqlite-bridge";

/**
 * Migración puente para el historial de direcciones ZEC. El deploy no ejecuta
 * `prisma migrate deploy`: la tabla se crea al arrancar si no existe.
 */
export function ensureAddressChangeSchema(): void {
  const db = openDatabase();
  if (!db) return;

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS "ChannelAddressChange" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "channelId" TEXT NOT NULL,
      "changedById" TEXT NOT NULL,
      "previousAddress" TEXT,
      "newAddress" TEXT,
      "ip" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ChannelAddressChange_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "ChannelAddressChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`);

    db.exec(
      `CREATE INDEX IF NOT EXISTS "ChannelAddressChange_channelId_createdAt_idx" ON "ChannelAddressChange"("channelId", "createdAt");`,
    );
  } finally {
    db.close();
  }
}
