import "server-only";
import { prisma } from "@/lib/db";
import { ensureIndex, searchEpisodeIds } from "@/lib/search-index";

const episodeCardSelect = {
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
} as const;

export type EpisodeCard = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  durationSec: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  coverKey: string | null;
  audioPath: string;
  channel: { handle: string; displayName: string; avatarKey: string | null };
};

export type CatalogFilters = {
  query?: string;
  kind?: string;
  tag?: string;
  limit?: number;
};

export async function searchCatalog({
  query = "",
  kind,
  tag,
  limit = 24,
}: CatalogFilters): Promise<EpisodeCard[]> {
  const term = query.trim();

  const baseWhere = {
    status: "published",
    ...(kind ? { kind } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  if (term) {
    await ensureIndex();
    const ids = searchEpisodeIds(term, 200);

    if (ids.length === 0) return [];

    const rows = await prisma.episode.findMany({
      where: { ...baseWhere, id: { in: ids } },
      select: episodeCardSelect,
    });

    const byId = new Map(rows.map((row) => [row.id, row]));

    return ids
      .map((id) => byId.get(id))
      .filter((row): row is EpisodeCard => Boolean(row))
      .slice(0, limit);
  }

  const rows = await prisma.episode.findMany({
    where: baseWhere,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: episodeCardSelect,
  });

  return rows;
}

export async function getLatestEpisodes(limit = 8): Promise<EpisodeCard[]> {
  return prisma.episode.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: episodeCardSelect,
  });
}

export type ChannelSummary = {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarKey: string | null;
  episodeCount: number;
};

export async function getChannels(limit = 8): Promise<ChannelSummary[]> {
  const channels = await prisma.channel.findMany({
    where: { episodes: { some: { status: "published" } } },
    orderBy: { episodes: { _count: "desc" } },
    take: limit,
    select: {
      id: true,
      handle: true,
      displayName: true,
      bio: true,
      avatarKey: true,
      _count: {
        select: { episodes: { where: { status: "published" } } },
      },
    },
  });

  return channels.map((channel) => ({
    id: channel.id,
    handle: channel.handle,
    displayName: channel.displayName,
    bio: channel.bio,
    avatarKey: channel.avatarKey,
    episodeCount: channel._count.episodes,
  }));
}

export async function getTopTags(limit = 12) {
  return prisma.tag.findMany({
    where: { episodes: { some: { episode: { status: "published" } } } },
    orderBy: { episodes: { _count: "desc" } },
    take: limit,
  });
}
