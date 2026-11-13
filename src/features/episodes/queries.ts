import "server-only";
import { prisma } from "@/lib/db";
import { parseLinks } from "@/lib/links";
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

/**
 * Último episodio publicado, usado en la portada. Devuelve solo los campos que
 * muestra la vista.
 */
export async function getLatestPublishedEpisode() {
  return prisma.episode.findFirst({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      title: true,
      durationSec: true,
      channel: { select: { displayName: true } },
    },
  });
}

type StudioChannel = {
  id: string;
  avatarKey: string | null;
  links: string | null;
};

/**
 * Episodio del canal para el formulario de edición, con etiquetas y portada.
 */
export async function getStudioEpisode(channelId: string, id: string) {
  const episode = await prisma.episode.findFirst({
    where: { id, channelId },
    include: { tags: { include: { tag: true } } },
  });

  if (!episode) return null;

  return {
    episode,
    coverUrl: episode.coverKey ? storage.url(episode.coverKey) : null,
  };
}

/**
 * Datos mínimos del episodio para la página y la exportación de analítica.
 */
export async function getStudioEpisodeSummary(channelId: string, id: string) {
  return prisma.episode.findFirst({
    where: { id, channelId },
    select: { id: true, title: true, slug: true, status: true },
  });
}

/**
 * Último episodio publicado del canal, usado en distribución.
 */
export async function getLatestChannelEpisode(channelId: string) {
  return prisma.episode.findFirst({
    where: { channelId, status: "published" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
  });
}

/**
 * Resumen del panel del estudio: cantidad de episodios, reproducciones y datos
 * derivados del canal (avatar y enlaces).
 */
export async function getStudioDashboard(channel: StudioChannel) {
  const [episodes, playSum] = await Promise.all([
    prisma.episode.count({ where: { channelId: channel.id } }),
    prisma.episode.aggregate({
      where: { channelId: channel.id },
      _sum: { playCount: true },
    }),
  ]);

  return {
    episodes,
    plays: playSum._sum.playCount ?? 0,
    links: parseLinks(channel.links),
    avatarUrl: channel.avatarKey ? storage.url(channel.avatarKey) : null,
  };
}

/**
 * Lista de episodios del estudio con las etiquetas y la portada ya resuelta.
 * La página solo muestra el resultado.
 */
export async function listStudioEpisodes(channelId: string) {
  const episodes = await prisma.episode.findMany({
    where: { channelId },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  return {
    episodes: episodes.map((episode) => ({
      ...episode,
      coverUrl: episode.coverKey ? storage.url(episode.coverKey) : null,
    })),
    publishedCount: episodes.filter((episode) => episode.status === "published")
      .length,
  };
}

/**
 * Episodio para el reproductor embebido, con portada y audio resueltos.
 */
export async function getEmbedEpisode(id: string) {
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      channel: { select: { handle: true, displayName: true } },
    },
  });

  if (!episode) return null;

  return {
    episode,
    cover: episode.coverKey ? storage.url(episode.coverKey) : null,
    audioUrl: storage.url(episode.audioPath),
  };
}

/**
 * Título del episodio para los metadatos del embed, sin el resto de campos.
 */
export async function getEpisodeTitle(id: string) {
  const episode = await prisma.episode.findUnique({
    where: { id },
    select: { title: true },
  });

  return episode?.title ?? null;
}

type AudioEpisode = {
  id: string;
  channelId: string;
  durationSec: number | null;
} | null;

const audioEpisodeCache = new Map<string, AudioEpisode>();

/**
 * Episodio asociado a una ruta de audio. Se cachea por ruta porque la ruta de
 * medios resuelve el mismo archivo en cada petición de rango.
 */
export async function findEpisodeByAudioPath(
  audioPath: string,
): Promise<AudioEpisode> {
  if (audioEpisodeCache.has(audioPath)) {
    return audioEpisodeCache.get(audioPath) ?? null;
  }

  const episode = await prisma.episode.findFirst({
    where: { audioPath },
    select: { id: true, channelId: true, durationSec: true },
  });

  audioEpisodeCache.set(audioPath, episode);
  return episode;
}

/**
 * Episodios publicados para el sitemap.
 */
export async function listSitemapEpisodes() {
  return prisma.episode.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      publishedAt: true,
      createdAt: true,
      channel: { select: { handle: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });
}
