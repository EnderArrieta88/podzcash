"use server";

import type { ActionState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  addEpisodeComment,
  canModerateComment,
  deleteEpisodeComment,
  ensureEpisodeCommentsTable,
} from "@/lib/comments";
import { clearLimit, take } from "@/lib/rate-limit";
import { episodePath } from "@/lib/routes";
import { getLocale } from "@/lib/i18n/locale";
import { episodeContent } from "@/lib/i18n/episode";
import { sendCommentNotificationEmail } from "@/lib/email";
import { getSiteOrigin } from "@/lib/origin";

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
      title: true,
      slug: true,
      status: true,
      channel: {
        select: {
          id: true,
          handle: true,
          ownerEmail: true,
          commentNotify: true,
          feedLanguage: true,
          userId: true,
          user: { select: { email: true } },
        },
      },
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
  revalidatePath("/estudio/comentarios");

  // Vuelve a la primera página para que el autor vea su comentario, que es
  // el más reciente. En páginas antiguas quedaría fuera de la vista.
  if (
    draft.channel.commentNotify === "email" &&
    draft.channel.userId !== user.id
  ) {
    const to = draft.channel.ownerEmail ?? draft.channel.user.email;

    try {
      const origin = await getSiteOrigin();

      await sendCommentNotificationEmail({
        to,
        authorName: user.name,
        episodeTitle: draft.title,
        body,
        url: `${origin}${episodePath(draft.channel.handle, draft.slug)}#comentarios`,
        locale: draft.channel.feedLanguage === "en" ? "en" : "es",
      });
    } catch (error) {
      // El aviso es best-effort: el comentario ya quedó publicado.
      console.error("[comments] No se pudo enviar el aviso:", error);
    }
  }

  redirect(`${episodePath(draft.channel.handle, draft.slug)}#comentarios`);
}

export async function deleteEpisodeCommentAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "");

  if (!user || !id) return;

  await ensureEpisodeCommentsTable();

  const comment = await prisma.episodeComment.findUnique({
    where: { id },
    select: { userId: true, episode: { select: { channelId: true } } },
  });

  if (!comment) return;

  const allowed = canModerateComment({
    commentUserId: comment.userId,
    viewerId: user.id,
    viewerRole: user.role,
    viewerChannelId: user.channel?.id ?? null,
    episodeChannelId: comment.episode.channelId,
  });

  if (!allowed) return;

  try {
    await deleteEpisodeComment(id, user.id);
  } catch (error) {
    console.error("[comments] No se pudo borrar el comentario:", error);
  }

  revalidatePath(path || "/");
  revalidatePath("/estudio/comentarios");
}
