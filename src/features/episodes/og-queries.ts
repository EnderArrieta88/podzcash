import "server-only";
import { prisma } from "@/lib/db";
import { normalizeHandleParam } from "@/lib/routes";

/**
 * Datos mínimos para generar la imagen Open Graph de un episodio, sin cargar
 * almacenamiento ni el resto de la página.
 */
export async function getEpisodeOgData(handle: string, slug: string) {
  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    select: { id: true, handle: true, displayName: true },
  });

  if (!channel) return null;

  const episode = await prisma.episode.findUnique({
    where: { channelId_slug: { channelId: channel.id, slug } },
    select: { title: true },
  });

  if (!episode) return null;

  return { channel, episode };
}
