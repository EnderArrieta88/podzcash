import "server-only";
import { addMissingColumns, openDatabase } from "@/lib/sqlite-bridge";

/**
 * Migración puente para 2FA TOTP. La tabla User ya existe en producción; solo
 * faltan las columnas.
 */
export function ensureTotpSchema(): void {
  const db = openDatabase();
  if (!db) return;

  try {
    addMissingColumns(db, "User", [
      ["totpSecret", `"totpSecret" TEXT`],
      ["totpEnabled", `"totpEnabled" BOOLEAN NOT NULL DEFAULT false`],
      ["totpRecoveryCodes", `"totpRecoveryCodes" TEXT`],
      ["totpPendingSecret", `"totpPendingSecret" TEXT`],
    ]);
  } finally {
    db.close();
  }
}
