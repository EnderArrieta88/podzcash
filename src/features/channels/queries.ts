import "server-only";
import { prisma } from "@/lib/db";
import { parseLinks } from "@/lib/links";
import { normalizeHandleParam } from "@/lib/routes";
import { storage } from "@/lib/storage";

/**
 * Consulta y preparación de la página pública de un canal. La página solo
 * compone la vista con este resultado.
 */
export async function getChannelPageData(handle: string) {
  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    include: {
      _count: {
        select: { episodes: { where: { status: "published" } } },
      },
      episodes: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 24,
        select: {
          id: true,
          slug: true,
          title: true,
          kind: true,
          durationSec: true,
          publishedAt: true,
          createdAt: true,
          coverKey: true,
          audioPath: true,
          channel: {
            select: { handle: true, displayName: true, avatarKey: true },
          },
        },
      },
    },
  });

  if (!channel) return null;

  const links = parseLinks(channel.links);
  const latestCover = [...channel.episodes]
    .reverse()
    .find((episode) => episode.coverKey)?.coverKey;
  const imageKey = latestCover ?? channel.avatarKey;

  return {
    channel,
    links,
    image: imageKey ? storage.url(imageKey) : null,
    avatarUrl: channel.avatarKey ? storage.url(channel.avatarKey) : null,
    bannerUrl: channel.bannerKey ? storage.url(channel.bannerKey) : null,
  };
}

/**
 * Canal y avatar para la página de donaciones.
 */
export async function getChannelDonationData(handle: string) {
  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    select: {
      handle: true,
      displayName: true,
      avatarKey: true,
      zcashAddress: true,
    },
  });

  if (!channel) return null;

  return {
    channel,
    avatarUrl: channel.avatarKey ? storage.url(channel.avatarKey) : null,
  };
}

/**
 * Canal y episodios publicados para el feed RSS.
 */
export async function getChannelFeedData(handle: string) {
  return prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    include: {
      episodes: {
        where: { status: "published" },
        orderBy: { publishedAt: "asc" },
        include: { tags: { include: { tag: true } } },
      },
    },
  });
}

/**
 * Canales para el sitemap, ordenados por última actualización.
 */
export async function listSitemapChannels() {
  return prisma.channel.findMany({
    select: { handle: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
}
