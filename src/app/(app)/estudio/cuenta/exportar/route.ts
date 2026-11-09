import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { parseLinks } from "@/lib/links";
import { take } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const viewer = await getCurrentUser();

  if (!viewer) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  if (!take(`export-account:${viewer.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "rateLimited" },
      { status: 429, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const [user, reports, waitlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: viewer.id },
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
      where: { reporterId: viewer.id },
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
      where: { email: viewer.email },
      select: { email: true, name: true, role: true, note: true, createdAt: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const episodes = user.channel
    ? await prisma.episode.findMany({
        where: { channelId: user.channel.id },
        orderBy: { createdAt: "asc" },
        select: EPISODE_SELECT,
      })
    : [];

  const payload = {
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

  const date = new Date().toISOString().slice(0, 10);
  const filename = `podzcash-cuenta-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
