"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/guards";
import { markChannelCommentsSeen } from "@/lib/comments";

const NOTIFY_VALUES = new Set(["inbox", "email", "off"]);

export async function setCommentNotifyAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();

  if (!user.channel) redirect("/estudio/canal");

  const value = String(formData.get("commentNotify") ?? "");
  const commentNotify = NOTIFY_VALUES.has(value) ? value : "inbox";

  await prisma.channel.update({
    where: { id: user.channel.id },
    data: { commentNotify },
  });

  revalidatePath("/estudio/comentarios");
  redirect("/estudio/comentarios?saved=1");
}

/**
 * Marca la bandeja como vista. Se llama al abrir la página, sin revalidar:
 * el contador del menú se actualiza en la siguiente navegación.
 */
export async function markCommentsSeenAction(): Promise<void> {
  const user = await getCurrentUser();

  if (!user?.channel) return;

  await markChannelCommentsSeen(user.channel.id);
}
