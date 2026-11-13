import "server-only";
import { prisma } from "@/lib/db";

/**
 * Indica si todavía no existe ningún usuario: el primero puede registrarse sin
 * invitación.
 */
export async function isFirstUser() {
  return (await prisma.user.count()) === 0;
}

/**
 * Datos del usuario necesarios para validar un enlace de verificación.
 */
export async function getVerificationUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true },
  });
}

/**
 * Datos del usuario necesarios para validar un enlace de restablecimiento.
 */
export async function getResetUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true, passwordHash: true },
  });
}
