import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  AUDIO_MIME,
  IMAGE_MIME,
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
} from "@/lib/media-types";
import { validateArtwork, deriveArtwork } from "@/lib/artwork";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = {
  audio: {
    mimes: AUDIO_MIME,
    maxBytes: MAX_AUDIO_BYTES,
    prefix: "audio",
  },
  image: {
    mimes: IMAGE_MIME,
    maxBytes: MAX_IMAGE_BYTES,
    prefix: "covers",
  },
} as const;

type UploadKind = keyof typeof LIMITS;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const kind = new URL(request.url).searchParams.get(
    "kind",
  ) as UploadKind | null;
  const purpose = new URL(request.url).searchParams.get("purpose");

  if (!kind || !(kind in LIMITS)) {
    return NextResponse.json({ error: "invalidType" }, { status: 400 });
  }

  const limit = LIMITS[kind];
  const mimeType = (request.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  const extension = limit.mimes[mimeType as keyof typeof limit.mimes];

  if (!extension) {
    return NextResponse.json({ error: "unsupportedFormat" }, { status: 415 });
  }

  const declared = Number(request.headers.get("content-length") ?? "0");

  if (declared > limit.maxBytes) {
    return NextResponse.json({ error: "tooLarge" }, { status: 413 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "noFile" }, { status: 400 });
  }

  const key = `${limit.prefix}/${user.id}/${randomUUID()}.${extension}`;

  try {
    if (kind === "image" && purpose === "cover") {
      const data = Buffer.from(await request.arrayBuffer());

      if (data.length > limit.maxBytes) {
        return NextResponse.json({ error: "tooLarge" }, { status: 413 });
      }

      if (data.length === 0) {
        return NextResponse.json({ error: "empty" }, { status: 400 });
      }

      const artwork = validateArtwork(data);

      if (!artwork.ok) {
        return NextResponse.json({ error: artwork.error }, { status: 415 });
      }

      const derived = await deriveArtwork(data);
      const coverKey = `covers/${user.id}/${randomUUID()}.jpg`;

      await storage.put(coverKey, derived.data);

      return NextResponse.json({
        key: coverKey,
        size: derived.data.length,
        mimeType: derived.mimeType,
      });
    }

    const size = await storage.putStream(key, request.body);

    if (size > limit.maxBytes) {
      await storage.remove(key);
      return NextResponse.json({ error: "tooLarge" }, { status: 413 });
    }

    if (size === 0) {
      await storage.remove(key);
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }

    return NextResponse.json({ key, size, mimeType });
  } catch (error) {
    console.error("Falló la subida:", error);
    await storage.remove(key);
    return NextResponse.json({ error: "saveFailed" }, { status: 500 });
  }
}
