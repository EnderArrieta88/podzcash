import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { isPrefetchRequest, recordMediaEvent } from "@/lib/analytics";
import { contentTypeFor } from "@/lib/media-types";
import { resolveMediaPath } from "@/lib/storage";
import { findEpisodeByAudioPath } from "@/features/episodes/queries";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ path: string[] }> };

type RequestInfo = {
  relativePath: string;
  method: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  isPrefetch: boolean;
};

type MediaLog = {
  status: number;
  rangeStart: number | null;
  rangeEnd: number | null;
  bytes: number;
  totalBytes: number;
};

async function logAudioRequest(requestInfo: RequestInfo, log: MediaLog) {
  if (!requestInfo.relativePath.startsWith("audio/")) return;

  const episode = await findEpisodeByAudioPath(requestInfo.relativePath);
  if (!episode) return;

  recordMediaEvent({
    episodeId: episode.id,
    channelId: episode.channelId,
    method: requestInfo.method,
    status: log.status,
    rangeStart: log.rangeStart,
    rangeEnd: log.rangeEnd,
    bytes: log.bytes,
    totalBytes: log.totalBytes,
    durationSec: episode.durationSec,
    ip: requestInfo.ip,
    userAgent: requestInfo.userAgent,
    referer: requestInfo.referer,
    country: requestInfo.country,
    isPrefetch: requestInfo.isPrefetch,
  });
}

function queueAudioLog(requestInfo: RequestInfo, log: MediaLog) {
  void logAudioRequest(requestInfo, log).catch((error) => {
    console.error("[analytics] No se pudo registrar la descarga:", error);
  });
}

function requestInfo(request: Request, relativePath: string): RequestInfo {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  return {
    relativePath,
    method: request.method,
    ip,
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
    country:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      request.headers.get("x-country-code") ??
      null,
    isPrefetch: isPrefetchRequest(request.headers),
  };
}

function notFound() {
  return new Response("No encontrado", { status: 404 });
}

export async function GET(request: Request, context: RouteContext) {
  const { path: segments } = await context.params;
  const relativePath = segments.join("/");
  const info = requestInfo(request, relativePath);

  let absolute: string;
  try {
    absolute = resolveMediaPath(relativePath);
  } catch {
    return notFound();
  }

  let size: number;

  try {
    const info = await stat(absolute);
    if (!info.isFile()) return notFound();
    size = info.size;
  } catch {
    return notFound();
  }

  const headers = new Headers({
    "Content-Type": contentTypeFor(absolute),
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  const range = request.headers.get("range");

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

    if (!match) {
      queueAudioLog(info, {
        status: 416,
        rangeStart: null,
        rangeEnd: null,
        bytes: 0,
        totalBytes: size,
      });

      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const [, startRaw, endRaw] = match;
    let start = startRaw ? Number.parseInt(startRaw, 10) : 0;
    let end = endRaw ? Number.parseInt(endRaw, 10) : size - 1;

    // Rango sufijo: "bytes=-500" = últimos 500 bytes.
    if (!startRaw && endRaw) {
      start = Math.max(size - Number.parseInt(endRaw, 10), 0);
      end = size - 1;
    }

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start >= size ||
      start > end
    ) {
      queueAudioLog(info, {
        status: 416,
        rangeStart: Number.isNaN(start) ? null : start,
        rangeEnd: Number.isNaN(end) ? null : end,
        bytes: 0,
        totalBytes: size,
      });

      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    end = Math.min(end, size - 1);

    const stream = Readable.toWeb(
      createReadStream(absolute, { start, end }),
    ) as ReadableStream;

    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    queueAudioLog(info, {
      status: 206,
      rangeStart: start,
      rangeEnd: end,
      bytes: request.method === "HEAD" ? 0 : end - start + 1,
      totalBytes: size,
    });

    return new Response(stream, { status: 206, headers });
  }

  const stream = Readable.toWeb(createReadStream(absolute)) as ReadableStream;

  headers.set("Content-Length", String(size));

  queueAudioLog(info, {
    status: 200,
    rangeStart: null,
    rangeEnd: null,
    bytes: request.method === "HEAD" ? 0 : size,
    totalBytes: size,
  });

  return new Response(stream, { status: 200, headers });
}
