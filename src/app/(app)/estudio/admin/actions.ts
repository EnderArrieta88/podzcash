"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { indexEpisode } from "@/lib/search-index";
import { deleteOrphans } from "@/lib/media-cleanup";

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "suspended" ? "suspended" : "active";

  if (!id || id === admin.id) redirect("/estudio/admin");

  await prisma.user.update({ where: { id }, data: { status } });

  if (status === "suspended") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  revalidatePath("/estudio/admin");
}

export async function setEpisodeStatusAction(formData: FormData): Promise<void> {
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
  revalidatePath(`/c/${episode.channel.handle}`);
  revalidatePath(`/c/${episode.channel.handle}/${episode.slug}`);
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
      revalidatePath(`/c/${episode.channel.handle}`);
      revalidatePath(`/c/${episode.channel.handle}/${episode.slug}`);
    }
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
