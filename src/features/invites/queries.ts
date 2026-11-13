import "server-only";
import { prisma } from "@/lib/db";

/**
 * Invitaciones creadas por un administrador, con el usuario que las usó.
 */
export async function listAdminInvites(adminId: string) {
  return prisma.invite.findMany({
    where: { createdById: adminId },
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { name: true, email: true } } },
  });
}
