import "server-only";
import { prisma } from "@/lib/db";
import { findOrphans } from "@/lib/media-cleanup";
import { countWaitlist, listWaitlist } from "@/features/waitlist/queries";

/**
 * Datos del panel de administración. Las consultas viven aquí para que la
 * página solo componga la vista.
 */
export async function getAdminDashboard() {
  const [
    users,
    episodes,
    reports,
    channels,
    orphans,
    publishedCount,
    waiting,
    waitlist,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        channel: { select: { handle: true, displayName: true } },
      },
    }),
    prisma.episode.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        playCount: true,
        createdAt: true,
        channel: { select: { handle: true, displayName: true } },
      },
    }),
    prisma.report.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.channel.count(),
    findOrphans(),
    prisma.episode.count({ where: { status: "published" } }),
    countWaitlist(),
    listWaitlist(20),
  ]);

  const episodeIds = reports
    .filter((report) => report.targetType === "episode")
    .map((report) => report.targetId);

  const reportedEpisodes = new Map(
    (
      await prisma.episode.findMany({
        where: { id: { in: episodeIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          channel: { select: { handle: true } },
        },
      })
    ).map((episode) => [episode.id, episode]),
  );

  const commentIds = reports
    .filter((report) => report.targetType === "comment")
    .map((report) => report.targetId);

  const reportedComments = new Map(
    (
      await prisma.episodeComment.findMany({
        where: { id: { in: commentIds } },
        select: {
          id: true,
          body: true,
          user: { select: { name: true } },
          episode: {
            select: {
              id: true,
              title: true,
              slug: true,
              channel: { select: { handle: true } },
            },
          },
        },
      })
    ).map((comment) => [comment.id, comment]),
  );

  const reporterIds = [
    ...new Set(
      reports
        .map((report) => report.reporterId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const reporters = new Map(
    (
      await prisma.user.findMany({
        where: { id: { in: reporterIds } },
        select: { id: true, name: true },
      })
    ).map((user) => [user.id, user.name]),
  );

  return {
    users,
    episodes,
    reports,
    channels,
    orphans,
    publishedCount,
    waiting,
    waitlist,
    reportedEpisodes,
    reportedComments,
    reporters,
  };
}
