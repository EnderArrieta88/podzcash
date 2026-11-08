"use server";

import type { ActionState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { addEpisodeComment, deleteEpisodeComment } from "@/lib/comments";
import { clearLimit, take } from "@/lib/rate-limit";
import { episodePath } from "@/lib/routes";
import { getLocale } from "@/lib/i18n/locale";
import { episodeContent } from "@/lib/i18n/episode";

export async function addEpisodeCommentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  const locale = await getLocale();
  const content = episodeContent[locale].comments;

  if (!user) return { error: content.error };

  const body = String(formData.get("body") ?? "").trim();
  const episodeId = String(formData.get("episodeId") ?? "").trim();

  if (body.length < 2 || body.length > 600) return { error: content.error };

  const limitKey = `comment:${user.id}`;

  if (!take(limitKey, 5, 10 * 60 * 1000)) return { error: content.error };

  const draft = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      slug: true,
      status: true,
      channel: { select: { handle: true } },
    },
  });

  if (!draft || draft.status !== "published") return { error: content.error };

  try {
    await addEpisodeComment(episodeId, user.id, body);
    clearLimit(limitKey);
  } catch (error) {
    console.error("[comments] No se pudo guardar el comentario:", error);
    return { error: content.error };
  }

  revalidatePath(episodePath(draft.channel.handle, draft.slug));
  return { ok: true };
}

export async function deleteEpisodeCommentAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "");

  if (!user || !id) return;

  const comment = await prisma.episodeComment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!comment) return;
  if (comment.userId !== user.id && user.role !== "admin") return;

  try {
    await deleteEpisodeComment(id);
  } catch (error) {
    console.error("[comments] No se pudo borrar el comentario:", error);
  }

  revalidatePath(path || "/");
}
