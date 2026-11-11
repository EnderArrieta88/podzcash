"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { indexEpisode } from "@/lib/search-index";
import { deleteOrphans } from "@/lib/media-cleanup";
import { deleteEpisodeComment } from "@/lib/comments";
import { channelPath, episodePath } from "@/lib/routes";
import { formatInviteCode, generateInviteCode } from "@/lib/links";
import { getSiteOrigin } from "@/lib/origin";
import { getLocale } from "@/lib/i18n/locale";
import { sendInviteEmail } from "@/lib/email";
import { deleteWaitlistEntry, getWaitlistEntry } from "@/lib/waitlist";

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status =
    formData.get("status") === "suspended" ? "suspended" : "active";

  if (!id || id === admin.id) redirect("/estudio/admin");

  await prisma.user.update({ where: { id }, data: { status } });

  if (status === "suspended") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  revalidatePath("/estudio/admin");
}

export async function setEpisodeStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status =
    formData.get("status") === "published" ? "published" : "hidden";

  const episode = await prisma.episode
    .update({
      where: { id },
      data: { status },
      include: { channel: { select: { handle: true } } },
    })
    .catch(() => null);

  if (!episode) redirect("/estudio/admin");

  await indexEpisode(episode.id);

  revalidatePath("/estudio/admin");
  revalidatePath(channelPath(episode.channel.handle));
  revalidatePath(episodePath(episode.channel.handle, episode.slug));
}

export async function resolveReportAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const decision = formData.get("decision") === "hide" ? "hide" : "dismiss";

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) redirect("/estudio/admin");

  if (decision === "hide" && report.targetType === "episode") {
    const episode = await prisma.episode
      .update({
        where: { id: report.targetId },
        data: { status: "hidden" },
        include: { channel: { select: { handle: true } } },
      })
      .catch(() => null);

    if (episode) {
      await indexEpisode(episode.id);
      revalidatePath(channelPath(episode.channel.handle));
      revalidatePath(episodePath(episode.channel.handle, episode.slug));
    }
  }

  if (decision === "hide" && report.targetType === "comment") {
    const comment = await prisma.episodeComment
      .findUnique({
        where: { id: report.targetId },
        select: {
          episode: {
            select: { slug: true, channel: { select: { handle: true } } },
          },
        },
      })
      .catch(() => null);

    // Borra el comentario y cierra sus reportes abiertos.
    await deleteEpisodeComment(report.targetId, admin.id);

    if (comment) {
      revalidatePath(
        episodePath(comment.episode.channel.handle, comment.episode.slug),
      );
    }

    revalidatePath("/estudio/comentarios");
  }

  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: decision === "hide" ? "resolved" : "dismissed",
      resolvedAt: new Date(),
      resolvedById: admin.id,
    },
  });

  revalidatePath("/estudio/admin");
}

export async function cleanOrphansAction(): Promise<void> {
  await requireAdmin();

  const { deleted } = await deleteOrphans();

  revalidatePath("/estudio/admin");
  redirect(`/estudio/admin?cleaned=${deleted}`);
}

/**
 * Crea una invitación para una solicitud de la lista de espera y se la envía
 * por email. Si ya había una invitación pendiente para ese email, reutiliza el
 * mismo código en lugar de generar otro.
 */
export async function inviteWaitlistAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const locale = await getLocale();
  const id = String(formData.get("id") ?? "");

  const entry = id ? await getWaitlistEntry(id) : null;

  if (!entry) redirect("/estudio/admin?inviteError=1");

  const note = `Lista de espera: ${entry.email}`;

  let code: string | null = null;

  const existing = await prisma.invite.findFirst({
    where: { note, usedById: null },
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });

  if (existing) {
    code = existing.code;
  } else {
    for (let attempt = 0; attempt < 5 && !code; attempt += 1) {
      try {
        const created = await prisma.invite.create({
          data: { code: generateInviteCode(), note, createdById: admin.id },
          select: { code: true },
        });

        code = created.code;
      } catch {
        // Colisión de código: se reintenta con uno nuevo.
      }
    }
  }

  if (!code) redirect("/estudio/admin?inviteError=1");

  const formatted = formatInviteCode(code);
  const origin = await getSiteOrigin();
  const url = `${origin}/registro?invite=${encodeURIComponent(formatted)}`;

  const sent = await sendInviteEmail({
    to: entry.email,
    url,
    code: formatted,
    locale,
  });

  revalidatePath("/estudio/admin");
  redirect(sent ? "/estudio/admin?invited=1" : "/estudio/admin?inviteError=1");
}

export async function deleteWaitlistAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (id) {
    await deleteWaitlistEntry(id);
  }

  revalidatePath("/estudio/admin");
  redirect("/estudio/admin?deleted=1");
}
