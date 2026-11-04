import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { contentTypeFor } from "@/lib/media-types";
import { resolveMediaPath } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ path: string[] }> };

function notFound() {
  return new Response("No encontrado", { status: 404 });
}

export async function GET(request: Request, context: RouteContext) {
  const { path: segments } = await context.params;

  let absolute: string;
  try {
    absolute = resolveMediaPath(segments.join("/"));
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

    if (Number.isNaN(start) || Number.isNaN(end) || start >= size || start > end) {
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

    return new Response(stream, { status: 206, headers });
  }

  const stream = Readable.toWeb(
    createReadStream(absolute),
  ) as ReadableStream;

  headers.set("Content-Length", String(size));

  return new Response(stream, { status: 200, headers });
}
