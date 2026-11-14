import "server-only";
import { prisma } from "@/lib/db";
import { normalizeHandleParam } from "@/lib/routes";

/**
 * Datos mínimos para generar la imagen Open Graph de un canal, sin cargar
 * almacenamiento ni el resto de la página.
 */
export async function getChannelOgData(handle: string) {
  return prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    select: { handle: true, displayName: true, bio: true },
  });
}
