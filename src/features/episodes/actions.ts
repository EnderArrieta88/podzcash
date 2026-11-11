"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/locale";
import { studioErrors } from "@/lib/i18n/studio-errors";
import { toFieldErrors } from "@/lib/validation";
import { parseTags } from "@/lib/tags";
import { slugify, uniqueSlug } from "@/lib/slug";
import { channelPath, episodePath } from "@/lib/routes";
import { indexEpisode, removeFromIndex } from "@/lib/search-index";
import { storage } from "@/lib/storage";
import type { ActionState } from "@/lib/action-state";
import { episodeSchema } from "./schemas";
// ---------------------------------------------------------------------------
// Episodios
// ---------------------------------------------------------------------------

export async function saveEpisodeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const errors = studioErrors[locale];
  const channel = user.channel;

  if (!channel) redirect("/estudio/canal");

  const episodeId = String(formData.get("id") ?? "").trim() || null;
  const publish = formData.get("intent") === "publish";

  const parsed = episodeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    kind: formData.get("kind") ?? "podcast",
    tags: formData.get("tags") ?? "",
    season: formData.get("season") ?? "",
    episodeNumber: formData.get("episodeNumber") ?? "",
    episodeType: formData.get("episodeType") ?? "full",
    explicit: formData.get("explicit") ?? "",
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const { title, description, kind, season, episodeType, explicit } =
    parsed.data;
  const requestedEpisodeNumber = parsed.data.episodeNumber ?? null;

  const existing = episodeId
    ? await prisma.episode.findFirst({
        where: { id: episodeId, channelId: channel.id },
      })
    : null;

  if (episodeId && !existing) {
    return { error: errors.episodeNotFound };
  }

  let episodeNumber: number;

  if (requestedEpisodeNumber != null) {
    episodeNumber = requestedEpisodeNumber;
  } else if (existing?.episodeNumber != null) {
    episodeNumber = existing.episodeNumber;
  } else {
    const max = await prisma.episode.aggregate({
      where: { channelId: channel.id },
      _max: { episodeNumber: true },
    });

    episodeNumber = (max._max.episodeNumber ?? 0) + 1;
  }

  const newAudioKey = String(formData.get("audioKey") ?? "").trim() || null;
  const audioPath = newAudioKey ?? existing?.audioPath ?? null;

  if (!audioPath) {
    return { fields: { audio: errors.audioRequired } };
  }

  const newCoverKey = String(formData.get("coverKey") ?? "").trim() || null;
  const coverKey = newCoverKey ?? existing?.coverKey ?? null;

  const durationRaw = Number(formData.get("durationSec") ?? "0");
  const durationSec =
    Number.isFinite(durationRaw) && durationRaw > 0
      ? Math.round(durationRaw)
      : (existing?.durationSec ?? null);

  const fileSizeRaw = Number(formData.get("fileSize") ?? "0");
  const fileSize =
    Number.isFinite(fileSizeRaw) && fileSizeRaw > 0
      ? Math.round(fileSizeRaw)
      : (existing?.fileSize ?? null);

  const mimeType =
    String(formData.get("mimeType") ?? "").trim() || existing?.mimeType || null;

  const tagNames = parseTags(formData.get("tags"));

  let slug = existing?.slug ?? "";

  if (!existing) {
    const taken = new Set(
      (
        await prisma.episode.findMany({
          where: { channelId: channel.id },
          select: { slug: true },
        })
      ).map((episode) => episode.slug),
    );

    slug = uniqueSlug(slugify(title), taken);
  }

  const status = publish ? "published" : "draft";
  const publishedAt = publish ? (existing?.publishedAt ?? new Date()) : null;

  let savedEpisodeId = "";

  try {
    savedEpisodeId = await prisma.$transaction(async (tx) => {
      const data = {
        title,
        description: description || null,
        kind,
        slug,
        status,
        publishedAt,
        audioPath,
        coverKey,
        durationSec,
        fileSize,
        mimeType,
        season: season ?? null,
        episodeNumber: episodeNumber ?? null,
        episodeType,
        explicit: explicit ?? null,
      };

      const episode = existing
        ? await tx.episode.update({ where: { id: existing.id }, data })
        : await tx.episode.create({
            data: { ...data, channelId: channel.id },
          });

      await tx.episodeTag.deleteMany({ where: { episodeId: episode.id } });

      for (const name of tagNames) {
        const tagSlug = slugify(name);
        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });

        await tx.episodeTag.create({
          data: { episodeId: episode.id, tagId: tag.id },
        });
      }

      return episode.id;
    });
  } catch (error) {
    console.error("No se pudo guardar el episodio:", error);
    return { error: errors.episodeSaveFailed };
  }

  if (newAudioKey && existing && existing.audioPath !== newAudioKey) {
    await storage.remove(existing.audioPath);
  }

  if (newCoverKey && existing?.coverKey && existing.coverKey !== newCoverKey) {
    await storage.remove(existing.coverKey);
  }

  await indexEpisode(savedEpisodeId);

  revalidatePath("/estudio/episodios");
  revalidatePath(channelPath(channel.handle));
  revalidatePath(episodePath(channel.handle, slug));

  redirect("/estudio/episodios");
}

export async function deleteEpisodeAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const channel = user.channel;

  if (!channel) redirect("/estudio/canal");

  const id = String(formData.get("id") ?? "");
  const episode = await prisma.episode.findFirst({
    where: { id, channelId: channel.id },
  });

  if (!episode) redirect("/estudio/episodios");

  await prisma.episode.delete({ where: { id: episode.id } });
  removeFromIndex(episode.id);
  await storage.remove(episode.audioPath);

  if (episode.coverKey) {
    await storage.remove(episode.coverKey);
  }

  revalidatePath("/estudio/episodios");
  revalidatePath(channelPath(channel.handle));
}
