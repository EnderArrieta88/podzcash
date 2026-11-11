import "server-only";
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

type Column = { name: string };

/**
 * Utilidades para las migraciones puente de SQLite.
 *
 * El deploy no ejecuta `prisma migrate deploy`: la base de producción se
 * actualiza al arrancar el proceso. Cada migración puente solo agrega lo que
 * falta, de forma idempotente, para no romper instalaciones ya migradas.
 */
export function databasePath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return null;
  return path.resolve(process.cwd(), url.slice("file:".length));
}

export function columns(db: Database.Database, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info("${table}")`).all() as Column[];
  return new Set(rows.map((row) => row.name));
}

export function addMissingColumns(
  db: Database.Database,
  table: string,
  definitions: Array<[name: string, sql: string]>,
): void {
  const existing = columns(db, table);

  for (const [name, sql] of definitions) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE "${table}" ADD COLUMN ${sql};`);
    }
  }
}

export function openDatabase(): Database.Database | null {
  const file = databasePath();
  if (!file || !existsSync(file)) return null;

  const db = new Database(file);
  // Si otro proceso está escribiendo (Passenger puede arrancar más de uno),
  // espera en lugar de fallar con SQLITE_BUSY.
  db.pragma("busy_timeout = 5000");

  return db;
}
