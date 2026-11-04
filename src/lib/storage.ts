import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MEDIA_ROOT = path.resolve(
  process.cwd(),
  process.env.MEDIA_ROOT ?? "./.media",
);

export const IMAGE_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  flac: "audio/flac",
};

export function contentTypeFor(filePath: string): string {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

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
  remove(key: string): Promise<void>;
  url(key: string): string;
}

export const storage: StorageAdapter = {
  async put(key, data) {
    const absolute = resolveMediaPath(key);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, data);
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
