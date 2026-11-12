import "server-only";
import { prisma } from "@/lib/db";

/**
 * Episodio reportable: existe y está publicado. La página solo muestra el
 * formulario.
 */
export async function getReportableEpisode(id: string) {
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: { channel: { select: { handle: true, displayName: true } } },
  });

  if (!episode || episode.status !== "published") return null;

  return episode;
}

/**
 * Comentario reportable con el contexto del episodio y su autor.
 */
export async function getReportableComment(id: string) {
  return prisma.episodeComment.findUnique({
    where: { id },
    select: {
      id: true,
      body: true,
      user: { select: { name: true } },
      episode: {
        select: {
          title: true,
          slug: true,
          status: true,
          channel: { select: { handle: true } },
        },
      },
    },
  });
}
