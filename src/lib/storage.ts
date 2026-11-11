import "server-only";
import { createWriteStream } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { env } from "@/lib/env";

const MEDIA_ROOT = path.resolve(process.cwd(), env.MEDIA_ROOT);

export { contentTypeFor } from "@/lib/media-types";

/**
 * Resuelve una ruta relativa dentro de MEDIA_ROOT y bloquea cualquier intento
 * de salir de la carpeta (path traversal).
 */
export function resolveMediaPath(relativePath: string): string {
  const normalized = relativePath.replaceAll("\\", "/");
  const absolute = path.resolve(MEDIA_ROOT, normalized);

  if (absolute !== MEDIA_ROOT && !absolute.startsWith(MEDIA_ROOT + path.sep)) {
    throw new Error("Ruta fuera de MEDIA_ROOT");
  }

  return absolute;
}

/**
 * Puerto de almacenamiento. Hoy escribe en disco; cuando el proyecto crezca,
 * esta es la única pieza que cambia para usar Cloudflare R2.
 */
export interface StorageAdapter {
  put(key: string, data: Buffer): Promise<void>;
  putStream(key: string, body: ReadableStream<Uint8Array>): Promise<number>;
  remove(key: string): Promise<void>;
  url(key: string): string;
}

export const storage: StorageAdapter = {
  async put(key, data) {
    const absolute = resolveMediaPath(key);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, data);
  },

  /**
   * Escribe el cuerpo de la petición directamente a disco, sin cargarlo en
   * memoria. Devuelve los bytes escritos.
   */
  async putStream(key, body) {
    const absolute = resolveMediaPath(key);
    await mkdir(path.dirname(absolute), { recursive: true });

    let bytes = 0;
    const counter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        bytes += chunk.length;
        callback(null, chunk);
      },
    });

    await pipeline(
      Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]),
      counter,
      createWriteStream(absolute),
    );

    return bytes;
  },

  async remove(key) {
    await unlink(resolveMediaPath(key)).catch(() => {});
  },

  url(key) {
    return `/media/${key.replaceAll("\\", "/")}`;
  },
};

export function mediaRoot(): string {
  return MEDIA_ROOT;
}
