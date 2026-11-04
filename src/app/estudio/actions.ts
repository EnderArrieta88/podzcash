"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { destroySession } from "@/lib/auth/session";
import { generateInviteCode, linkListSchema } from "@/lib/links";
import { slugify, uniqueSlug } from "@/lib/slug";
import { IMAGE_MIME } from "@/lib/media-types";
import { indexEpisode, reindexChannel, removeFromIndex } from "@/lib/search-index";
import { storage } from "@/lib/storage";
import { parseTags } from "@/lib/tags";
import { channelSchema, episodeSchema, toFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function saveChannelAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = channelSchema.safeParse({
    displayName: formData.get("displayName"),
    handle: formData.get("handle"),
    bio: formData.get("bio") ?? "",
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error) };
  }

  const { displayName, handle } = parsed.data;
  const bio = parsed.data.bio || null;

  const clash = await prisma.channel.findFirst({
    where: { handle, NOT: { userId: user.id } },
    select: { id: true },
  });

  if (clash) {
    return { fields: { handle: "Ese handle ya está ocupado. Prueba otro." } };
  }

  let linksJson: string | null = null;
  const rawLinks = formData.get("links");

  if (typeof rawLinks === "string" && rawLinks.trim() !== "") {
    try {
      const parsedLinks = linkListSchema.safeParse(JSON.parse(rawLinks));

      if (!parsedLinks.success) {
        return {
          fields: {
            links: "Cada enlace necesita una etiqueta y una URL válida.",
          },
        };
      }

      if (parsedLinks.data.length > 0) {
        linksJson = JSON.stringify(parsedLinks.data);
      }
    } catch {
      return { fields: { links: "No pudimos leer los enlaces." } };
    }
  }

  let newAvatarKey: string | undefined;
  const file = formData.get("avatar");

  if (file instanceof File && file.size > 0) {
    if (!IMAGE_MIME[file.type]) {
      return {
        fields: { avatar: "Formato no soportado. Usa JPG, PNG, WebP o GIF." },
      };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { fields: { avatar: "La imagen no puede pasar de 2 MB." } };
    }

    const extension = IMAGE_MIME[file.type];
    const key = `avatars/${user.id}/${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    await storage.put(key, bytes);
    newAvatarKey = key;
  }

  const data = {
    displayName,
    handle,
    bio,
    links: linksJson,
    ...(newAvatarKey ? { avatarKey: newAvatarKey } : {}),
  };

  let previousHandle: string | null = null;

  if (user.channel) {
    previousHandle = user.channel.handle;

    await prisma.channel.update({
      where: { id: user.channel.id },
      data,
    });

    if (user.channel.displayName !== displayName) {
      await reindexChannel(user.channel.id);
    }

    if (newAvatarKey && user.channel.avatarKey) {
      await storage.remove(user.channel.avatarKey);
    }
  } else {
    await prisma.channel.create({
      data: { ...data, userId: user.id },
    });
  }

  revalidatePath("/estudio");
  revalidatePath(`/c/${handle}`);

  if (previousHandle && previousHandle !== handle) {
    revalidatePath(`/c/${previousHandle}`);
  }

  return { ok: true };
}

export async function createInviteAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim().slice(0, 80) || null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateInviteCode();

    try {
      await prisma.invite.create({
        data: { code, note, createdById: admin.id },
      });

      revalidatePath("/estudio/invitaciones");
      return { ok: true };
    } catch {
      // Colisión de código: se reintenta con uno nuevo.
    }
  }

  return { error: "No se pudo generar el código. Inténtalo otra vez." };
}

export async function revokeInviteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  await prisma.invite.deleteMany({
    where: { id, usedById: null },
  });

  revalidatePath("/estudio/invitaciones");
}

// ---------------------------------------------------------------------------
// Episodios
// ---------------------------------------------------------------------------

export async function saveEpisodeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const channel = user.channel;

  if (!channel) redirect("/estudio/canal");

  const episodeId = String(formData.get("id") ?? "").trim() || null;
  const publish = formData.get("intent") === "publish";

  const parsed = episodeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    kind: formData.get("kind") ?? "podcast",
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error) };
  }

  const { title, description, kind } = parsed.data;

  const existing = episodeId
    ? await prisma.episode.findFirst({
        where: { id: episodeId, channelId: channel.id },
      })
    : null;

  if (episodeId && !existing) {
    return { error: "Ese episodio no existe." };
  }

  const newAudioKey = String(formData.get("audioKey") ?? "").trim() || null;
  const audioPath = newAudioKey ?? existing?.audioPath ?? null;

  if (!audioPath) {
    return { fields: { audio: "Sube un archivo de audio antes de guardar." } };
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
  const publishedAt = publish
    ? (existing?.publishedAt ?? new Date())
    : null;

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
    return { error: "No se pudo guardar el episodio. Inténtalo otra vez." };
  }

  if (newAudioKey && existing && existing.audioPath !== newAudioKey) {
    await storage.remove(existing.audioPath);
  }

  if (newCoverKey && existing?.coverKey && existing.coverKey !== newCoverKey) {
    await storage.remove(existing.coverKey);
  }

  await indexEpisode(savedEpisodeId);

  revalidatePath("/estudio/episodios");
  revalidatePath(`/c/${channel.handle}`);
  revalidatePath(`/c/${channel.handle}/${slug}`);

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
  revalidatePath(`/c/${channel.handle}`);
}
