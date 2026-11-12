import "server-only";
import { prisma } from "@/lib/db";
import { parseLinks } from "@/lib/links";

const EPISODE_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  kind: true,
  status: true,
  durationSec: true,
  fileSize: true,
  mimeType: true,
  season: true,
  episodeNumber: true,
  episodeType: true,
  explicit: true,
  publishedAt: true,
  playCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Arma el JSON de exportación de la cuenta. La ruta solo valida la sesión,
 * aplica el límite de peticiones y devuelve el archivo.
 */
export async function buildAccountExport(userId: string, email: string) {
  const [user, reports, waitlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            episodeId: true,
            body: true,
            createdAt: true,
            episode: { select: { title: true, slug: true } },
          },
        },
        playbackProgress: {
          orderBy: { updatedAt: "desc" },
          select: {
            episodeId: true,
            positionSec: true,
            durationSec: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sessions: {
          orderBy: { createdAt: "asc" },
          select: { id: true, createdAt: true, expiresAt: true },
        },
        invitesCreated: {
          orderBy: { createdAt: "asc" },
          select: {
            code: true,
            note: true,
            createdAt: true,
            usedAt: true,
            expiresAt: true,
          },
        },
        inviteUsed: {
          select: {
            code: true,
            note: true,
            createdAt: true,
            usedAt: true,
            expiresAt: true,
          },
        },
        channel: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            bio: true,
            zcashAddress: true,
            feedLanguage: true,
            feedCategory: true,
            feedExplicit: true,
            ownerEmail: true,
            block: true,
            newFeedUrl: true,
            links: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.report.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: "asc" },
      select: {
        targetType: true,
        targetId: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
      },
    }),
    prisma.waitlistEntry.findMany({
      where: { email },
      select: {
        email: true,
        name: true,
        role: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) return null;

  const episodes = user.channel
    ? await prisma.episode.findMany({
        where: { channelId: user.channel.id },
        orderBy: { createdAt: "asc" },
        select: EPISODE_SELECT,
      })
    : [];

  return {
    format: "podzcash-account-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    channel: user.channel
      ? {
          ...user.channel,
          links: parseLinks(user.channel.links),
          episodes,
        }
      : null,
    comments: user.comments,
    playbackProgress: user.playbackProgress,
    invitations: {
      created: user.invitesCreated,
      used: user.inviteUsed,
    },
    sessions: user.sessions,
    reportsFiled: reports,
    waitlist,
  };
}
