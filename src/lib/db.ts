import "server-only";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// En desarrollo, Next recarga los módulos en cada cambio: reutilizamos la
// conexión para no abrir un handle nuevo a SQLite en cada recarga.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
