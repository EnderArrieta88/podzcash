import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { clampProgress } from "@/lib/playback-progress";
import { take } from "@/lib/rate-limit";
import {
  clearPlaybackProgress,
  episodeExists,
  getPlaybackProgress,
  savePlaybackProgress,
} from "@/features/playback/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SECONDS = 60 * 60 * 48;

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) return unauthorized();

  const episodeId = new URL(request.url).searchParams.get("episodeId")?.trim();

  if (!episodeId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const progress = await getPlaybackProgress(user.id, episodeId);

  if (!progress) return NextResponse.json(null);

  return NextResponse.json(
    {
      positionSec: progress.positionSec,
      durationSec: progress.durationSec,
      updatedAt: progress.updatedAt.toISOString(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) return unauthorized();

  let payload: {
    episodeId?: unknown;
    positionSec?: unknown;
    durationSec?: unknown;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const episodeId =
    typeof payload.episodeId === "string" ? payload.episodeId.trim() : "";
  const positionSec = Number(payload.positionSec);
  const durationSec =
    payload.durationSec == null ? null : Number(payload.durationSec);

  if (
    !episodeId ||
    !Number.isFinite(positionSec) ||
    positionSec < 0 ||
    positionSec > MAX_SECONDS ||
    (durationSec != null &&
      (!Number.isFinite(durationSec) ||
        durationSec < 0 ||
        durationSec > MAX_SECONDS))
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // El reproductor guarda cada 10 s como máximo; el límite frena abusos.
  if (!take(`progress-sync:${user.id}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "rateLimited" }, { status: 429 });
  }

  const exists = await episodeExists(episodeId);

  if (!exists) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  const position = clampProgress(positionSec, durationSec);

  const progress = await savePlaybackProgress({
    userId: user.id,
    episodeId,
    positionSec: position,
    durationSec,
  });

  return NextResponse.json({
    ok: true,
    updatedAt: progress.updatedAt.toISOString(),
  });
}

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user) return unauthorized();

  const result = await clearPlaybackProgress(user.id);

  return NextResponse.json({ ok: true, deleted: result.count });
}
