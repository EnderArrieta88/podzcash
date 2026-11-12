import "server-only";
import { prisma } from "@/lib/db";
import { normalizeHandleParam } from "@/lib/routes";
import { storage } from "@/lib/storage";

/**
 * Consulta y URLs públicas de la página de un episodio. La página solo
 * compone la vista con este resultado.
 */
export async function getEpisodePageData(handle: string, slug: string) {
  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    select: {
      id: true,
      handle: true,
      displayName: true,
      avatarKey: true,
      zcashAddress: true,
    },
  });

  if (!channel) return null;

  const episode = await prisma.episode.findUnique({
    where: { channelId_slug: { channelId: channel.id, slug } },
    include: { tags: { include: { tag: true } } },
  });

  if (!episode) return null;

  const cover = episode.coverKey ? storage.url(episode.coverKey) : null;
  const audioUrl = storage.url(episode.audioPath);
  const ogImage =
    cover ?? (channel.avatarKey ? storage.url(channel.avatarKey) : null);

  return { channel, episode, cover, audioUrl, ogImage };
}
