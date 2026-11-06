import { prisma } from "@/lib/db";

/**
 * La tabla de la lista de espera se crea en la primera escritura.
 * Así no hace falta una migración en producción, donde el historial de
 * Prisma quedó incompleto. La migración equivalente usa IF NOT EXISTS.
 */
let ready: Promise<void> | null = null;

async function createTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "WaitlistEntry" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'podcast',
      "note" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "WaitlistEntry_email_key" ON "WaitlistEntry"("email");`,
  );
}

export function ensureWaitlistTable(): Promise<void> {
  if (!ready) {
    ready = createTable().catch((error) => {
      // Si falla, se reintenta en la próxima llamada.
      ready = null;
      throw error;
    });
  }

  return ready;
}

export type WaitlistInput = {
  name: string;
  email: string;
  role: string;
  note: string | null;
};

export async function addWaitlistEntry(
  input: WaitlistInput,
): Promise<"created" | "exists"> {
  await ensureWaitlistTable();

  try {
    await prisma.waitlistEntry.create({ data: input });
    return "created";
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return "exists";
    }

    throw error;
  }
}

export type WaitlistRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  note: string | null;
  createdAt: Date;
};

export async function listWaitlist(limit = 50): Promise<WaitlistRow[]> {
  await ensureWaitlistTable();

  return prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      note: true,
      createdAt: true,
    },
  });
}

export async function countWaitlist(): Promise<number> {
  await ensureWaitlistTable();

  return prisma.waitlistEntry.count();
}

export async function getWaitlistEntry(id: string) {
  await ensureWaitlistTable();

  return prisma.waitlistEntry.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, note: true },
  });
}

export async function deleteWaitlistEntry(id: string): Promise<void> {
  await ensureWaitlistTable();

  await prisma.waitlistEntry.deleteMany({ where: { id } });
}
