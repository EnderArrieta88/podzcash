import "server-only";
import { prisma } from "@/lib/db";

/**
 * Canal del episodio si está publicado. Usado por los contadores de
 * reproducción y de progreso.
 */
export async function findPublishedEpisodeChannel(id: string) {
  return prisma.episode.findFirst({
    where: { id, status: "published" },
    select: { channelId: true },
  });
}

/**
 * Incrementa el contador agregado de reproducciones de un episodio publicado.
 */
export async function incrementEpisodePlayCount(id: string) {
  return prisma.episode.updateMany({
    where: { id, status: "published" },
    data: { playCount: { increment: 1 } },
  });
}

/**
 * Progreso guardado de un usuario para un episodio.
 */
export async function getPlaybackProgress(userId: string, episodeId: string) {
  return prisma.playbackProgress.findUnique({
    where: { userId_episodeId: { userId, episodeId } },
  });
}

/**
 * Comprueba que el episodio exista antes de guardar progreso.
 */
export async function episodeExists(id: string) {
  const episode = await prisma.episode.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(episode);
}

type SavePlaybackProgressInput = {
  userId: string;
  episodeId: string;
  positionSec: number;
  durationSec: number | null;
};

/**
 * Guarda o actualiza el progreso de reproducción de un usuario.
 */
export async function savePlaybackProgress({
  userId,
  episodeId,
  positionSec,
  durationSec,
}: SavePlaybackProgressInput) {
  return prisma.playbackProgress.upsert({
    where: { userId_episodeId: { userId, episodeId } },
    update: { positionSec, durationSec },
    create: { userId, episodeId, positionSec, durationSec },
    select: { updatedAt: true },
  });
}

/**
 * Borra todo el historial de reproducción de un usuario.
 */
export async function clearPlaybackProgress(userId: string) {
  return prisma.playbackProgress.deleteMany({ where: { userId } });
}
