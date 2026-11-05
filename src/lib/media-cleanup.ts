import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { mediaRoot, resolveMediaPath, storage } from "@/lib/storage";

export type OrphanFile = { key: string; size: number };

const DAY = 24 * 60 * 60 * 1000;

async function walk(directory: string, prefix: string): Promise<OrphanFile[]> {
  const absolute = path.join(mediaRoot(), directory);

  const entries = await readdir(absolute, { withFileTypes: true }).catch(
    () => [],
  );

  const files: OrphanFile[] = [];

  for (const entry of entries) {
    const key = `${prefix}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...(await walk(`${directory}/${entry.name}`, key)));
      continue;
    }

    try {
      const info = await stat(resolveMediaPath(key));
      if (info.mtimeMs < Date.now() - DAY) {
        files.push({ key, size: info.size });
      }
    } catch {
      // Archivo ilegible: se ignora.
    }
  }

  return files;
}

/**
 * Archivos en disco que ningún episodio ni canal referencia, y que tienen más
 * de 24 h (para no borrar subidas en curso).
 */
export async function findOrphans(): Promise<{
  files: OrphanFile[];
  bytes: number;
}> {
  const [audio, covers, avatars, episodes, channels] = await Promise.all([
    walk("audio", "audio"),
    walk("covers", "covers"),
    walk("avatars", "avatars"),
    prisma.episode.findMany({ select: { audioPath: true, coverKey: true } }),
    prisma.channel.findMany({ select: { avatarKey: true, bannerKey: true } }),
  ]);

  const used = new Set<string>();

  for (const episode of episodes) {
    used.add(episode.audioPath);
    if (episode.coverKey) used.add(episode.coverKey);
  }

  for (const channel of channels) {
    if (channel.avatarKey) used.add(channel.avatarKey);
    if (channel.bannerKey) used.add(channel.bannerKey);
  }

  const files = [...audio, ...covers, ...avatars].filter(
    (file) => !used.has(file.key),
  );

  return { files, bytes: files.reduce((total, file) => total + file.size, 0) };
}

export async function deleteOrphans(): Promise<{
  deleted: number;
  bytes: number;
}> {
  const { files, bytes } = await findOrphans();

  for (const file of files) {
    await storage.remove(file.key);
  }

  return { deleted: files.length, bytes };
}
