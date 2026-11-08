import { prisma } from "@/lib/db";

/**
 * La tabla de comentarios por episodio se crea en la primera escritura.
 * Así no hay que depender del historial de migraciones de producción:
 * la migración equivalente usa IF NOT EXISTS.
 */
let ready: Promise<void> | null = null;

async function createTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "EpisodeComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EpisodeComment_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EpisodeComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "EpisodeComment_episodeId_createdAt_idx" ON "EpisodeComment"("episodeId", "createdAt");`,
  );

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "EpisodeComment_userId_idx" ON "EpisodeComment"("userId");`,
  );
}

export function ensureEpisodeCommentsTable(): Promise<void> {
  if (!ready) {
    ready = createTable().catch((error) => {
      // Si falla, se reintenta en la próxima llamada.
      ready = null;
      throw error;
    });
  }

  return ready;
}

async function ensureBy(episodeId: string): Promise<{
  slug: string;
  handle: string;
  status: string;
} | null> {
  const draft = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      slug: true,
      status: true,
      channel: { select: { handle: true } },
    },
  });

  if (!draft) return null;

  return {
    slug: draft.slug,
    handle: draft.channel.handle,
    status: draft.status,
  };
}

export async function listEpisodeComments(episodeId: string) {
  await ensureEpisodeCommentsTable();

  return prisma.episodeComment.findMany({
    where: { episodeId },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { user: { select: { name: true } } },
  });
}

export async function addEpisodeComment(episodeId: string, userId: string, body: string): Promise<void> {
  const draft = await ensureBy(episodeId);
  if (!draft) return;

  await ensureEpisodeCommentsTable();

  await prisma.episodeComment.create({
    data: { episodeId, userId, body },
  });
}

export async function deleteEpisodeComment(id: string): Promise<void> {
  await ensureEpisodeCommentsTable();

  await prisma.episodeComment.deleteMany({ where: { id } });
}
