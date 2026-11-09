import { prisma } from "@/lib/db";

/**
 * La tabla de comentarios por episodio se crea en la primera escritura.
 * Así no hay que depender del historial de migraciones de producción:
 * la migración equivalente usa IF NOT EXISTS.
 */
let ready: Promise<void> | null = null;

export const COMMENTS_PER_PAGE = 20;

function createTable(): Promise<void> {
  return (async () => {
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
  })();
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

export type EpisodeCommentItem = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string };
};

export type EpisodeCommentsPage = {
  items: EpisodeCommentItem[];
  total: number;
  page: number;
  pageCount: number;
};

/**
 * Lista los comentarios de un episodio, del más reciente al más antiguo.
 * La paginación evita perder comentarios cuando pasan de 100.
 */
export async function listEpisodeComments(
  episodeId: string,
  page = 1,
): Promise<EpisodeCommentsPage> {
  await ensureEpisodeCommentsTable();

  const total = await prisma.episodeComment.count({ where: { episodeId } });
  const pageCount = Math.max(1, Math.ceil(total / COMMENTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), pageCount);

  const items = await prisma.episodeComment.findMany({
    where: { episodeId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (current - 1) * COMMENTS_PER_PAGE,
    take: COMMENTS_PER_PAGE,
    include: { user: { select: { name: true } } },
  });

  return { items, total, page: current, pageCount };
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

export async function addEpisodeComment(
  episodeId: string,
  userId: string,
  body: string,
): Promise<void> {
  const draft = await ensureBy(episodeId);
  if (!draft) return;

  await ensureEpisodeCommentsTable();

  await prisma.episodeComment.create({
    data: { episodeId, userId, body },
  });
}

/**
 * Borra un comentario y cierra los reportes abiertos sobre él: si el
 * comentario ya no existe, no tiene sentido dejarlos en la cola.
 */
export async function deleteEpisodeComment(
  id: string,
  resolvedById?: string,
): Promise<void> {
  await ensureEpisodeCommentsTable();

  await prisma.episodeComment.deleteMany({ where: { id } });

  await prisma.report.updateMany({
    where: { targetType: "comment", targetId: id, status: "open" },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
      resolvedById: resolvedById ?? null,
    },
  });
}

export type ChannelCommentItem = EpisodeCommentItem & {
  episode: { id: string; title: string; slug: string; status: string };
};

/** Bandeja de comentarios de todos los episodios de un canal. */
export async function listChannelComments(
  channelId: string,
  page = 1,
): Promise<{
  items: ChannelCommentItem[];
  total: number;
  page: number;
  pageCount: number;
}> {
  await ensureEpisodeCommentsTable();

  const where = { episode: { channelId } };
  const total = await prisma.episodeComment.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / COMMENTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), pageCount);

  const items = await prisma.episodeComment.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (current - 1) * COMMENTS_PER_PAGE,
    take: COMMENTS_PER_PAGE,
    include: {
      user: { select: { name: true } },
      episode: { select: { id: true, title: true, slug: true, status: true } },
    },
  });

  return { items, total, page: current, pageCount };
}

/**
 * Comentarios de otros usuarios posteriores a la última visita del creador.
 * Si la tabla todavía no existe, el contador es 0.
 */
export async function countUnreadChannelComments(channel: {
  id: string;
  userId: string;
  commentsSeenAt: Date | null;
}): Promise<number> {
  try {
    return await prisma.episodeComment.count({
      where: {
        episode: { channelId: channel.id },
        userId: { not: channel.userId },
        ...(channel.commentsSeenAt
          ? { createdAt: { gt: channel.commentsSeenAt } }
          : {}),
      },
    });
  } catch {
    return 0;
  }
}

export async function markChannelCommentsSeen(
  channelId: string,
): Promise<void> {
  await prisma.channel.update({
    where: { id: channelId },
    data: { commentsSeenAt: new Date() },
  });
}

/** ¿Puede este usuario moderar el comentario? Autor, dueño del canal o admin. */
export function canModerateComment({
  commentUserId,
  viewerId,
  viewerRole,
  viewerChannelId,
  episodeChannelId,
}: {
  commentUserId: string;
  viewerId: string;
  viewerRole: string;
  viewerChannelId: string | null;
  episodeChannelId: string;
}): boolean {
  if (commentUserId === viewerId) return true;
  if (viewerRole === "admin") return true;
  return viewerChannelId === episodeChannelId;
}
