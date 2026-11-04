import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env antes de arrancar.",
    );
  }

  const adapter = new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// En desarrollo, Next recarga los módulos en cada cambio: reutilizamos la
// conexión para no abrir un handle nuevo a SQLite en cada recarga.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
