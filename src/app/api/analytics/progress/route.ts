import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordProgress } from "@/lib/analytics";
import { take } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: {
    id?: unknown;
    position?: unknown;
    duration?: unknown;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const position = Number(payload.position);
  const duration = Number(payload.duration);

  if (
    !id ||
    !Number.isFinite(position) ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!take(`progress:${ip}`, 300, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }

  const episode = await prisma.episode.findFirst({
    where: { id, status: "published" },
    select: { channelId: true },
  });

  if (!episode) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  recordProgress({
    episodeId: id,
    channelId: episode.channelId,
    percent: (Math.max(0, position) / duration) * 100,
    ip: ip === "local" ? null : ip,
    userAgent: requestHeaders.get("user-agent"),
    referer: requestHeaders.get("referer"),
    country:
      requestHeaders.get("x-vercel-ip-country") ??
      requestHeaders.get("cf-ipcountry") ??
      requestHeaders.get("x-country-code") ??
      null,
  });

  return NextResponse.json({ ok: true });
}
