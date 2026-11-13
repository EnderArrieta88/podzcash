import "server-only";
import { prisma } from "@/lib/db";

/**
 * Conteos usados por el chequeo de salud para confirmar que la base responde.
 */
export async function getDatabaseCounts() {
  const [channels, episodes] = await Promise.all([
    prisma.channel.count(),
    prisma.episode.count(),
  ]);

  return { channels, episodes };
}
