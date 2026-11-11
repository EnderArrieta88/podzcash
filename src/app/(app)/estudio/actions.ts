"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { generateInviteCode, linkListSchema } from "@/lib/links";
import { IMAGE_MIME } from "@/lib/media-types";
import { reindexChannel, removeFromIndex } from "@/lib/search-index";
import { purgeEpisodes } from "@/lib/analytics";
import { storage } from "@/lib/storage";
import {
  channelSchema,
  passwordChangeSchema,
  toFieldErrors,
} from "@/lib/validation";
import { validateZcashAddress } from "@/lib/zcash-address";
import { channelPath } from "@/lib/routes";
import { take } from "@/lib/rate-limit";
import { deleteUserPushSubscriptions } from "@/lib/push";
import { studioAccountContent } from "@/lib/i18n/studio-account";
import type { ActionState } from "@/lib/action-state";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

import { getLocale } from "@/lib/i18n/locale";
import { studioErrors } from "@/lib/i18n/studio-errors";

export async function saveChannelAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const errors = studioErrors[locale];

  const parsed = channelSchema.safeParse({
    displayName: formData.get("displayName"),
    handle: formData.get("handle"),
    bio: formData.get("bio") ?? "",
    zcashAddress: formData.get("zcashAddress") ?? "",
    feedLanguage: formData.get("feedLanguage") ?? "es",
    feedCategory: formData.get("feedCategory") ?? "Technology",
    feedExplicit: formData.get("feedExplicit") === "on",
    ownerEmail: formData.get("ownerEmail") ?? "",
    block: formData.get("block") === "on",
    newFeedUrl: formData.get("newFeedUrl") ?? "",
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const {
    displayName,
    handle,
    feedLanguage,
    feedCategory,
    feedExplicit,
    block,
  } = parsed.data;
  const bio = parsed.data.bio || null;
  const ownerEmail = parsed.data.ownerEmail?.trim() || null;
  const newFeedUrl = parsed.data.newFeedUrl?.trim() || null;

  let zcashAddress: string | null = null;
  const addressInput = (parsed.data.zcashAddress ?? "").trim();

  if (addressInput) {
    const address = validateZcashAddress(addressInput, locale);

    if (!address.ok) {
      return { fields: { zcashAddress: address.error } };
    }

    zcashAddress = address.address;
  }

  const clash = await prisma.channel.findFirst({
    where: { handle, NOT: { userId: user.id } },
    select: { id: true },
  });

  if (clash) {
    return { fields: { handle: errors.handleTaken } };
  }

  let linksJson: string | null = null;
  const rawLinks = formData.get("links");

  if (typeof rawLinks === "string" && rawLinks.trim() !== "") {
    try {
      const parsedLinks = linkListSchema.safeParse(JSON.parse(rawLinks));

      if (!parsedLinks.success) {
        return {
          fields: {
            links: errors.linksInvalid,
          },
        };
      }

      if (parsedLinks.data.length > 0) {
        linksJson = JSON.stringify(parsedLinks.data);
      }
    } catch {
      return { fields: { links: errors.linksUnreadable } };
    }
  }

  let newAvatarKey: string | undefined;
  const file = formData.get("avatar");

  if (file instanceof File && file.size > 0) {
    if (!IMAGE_MIME[file.type]) {
      return {
        fields: { avatar: errors.avatarFormat },
      };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { fields: { avatar: errors.avatarSize } };
    }

    const extension = IMAGE_MIME[file.type];
    const key = `avatars/${user.id}/${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    await storage.put(key, bytes);
    newAvatarKey = key;
  }

  let newBannerKey: string | undefined;
  const banner = formData.get("banner");

  if (banner instanceof File && banner.size > 0) {
    if (!IMAGE_MIME[banner.type]) {
      return {
        fields: { banner: errors.bannerFormat },
      };
    }

    if (banner.size > 4 * 1024 * 1024) {
      return { fields: { banner: errors.bannerSize } };
    }

    const extension = IMAGE_MIME[banner.type];
    const key = `banners/${user.id}/${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await banner.arrayBuffer());

    await storage.put(key, bytes);
    newBannerKey = key;
  }

  const data = {
    displayName,
    handle,
    bio,
    zcashAddress,
    feedLanguage,
    feedCategory,
    feedExplicit,
    ownerEmail,
    block,
    newFeedUrl,
    links: linksJson,
    ...(newAvatarKey ? { avatarKey: newAvatarKey } : {}),
    ...(newBannerKey ? { bannerKey: newBannerKey } : {}),
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

    if (newBannerKey && user.channel.bannerKey) {
      await storage.remove(user.channel.bannerKey);
    }
  } else {
    await prisma.channel.create({
      data: { ...data, userId: user.id },
    });
  }

  revalidatePath("/estudio");
  revalidatePath(channelPath(handle));

  if (previousHandle && previousHandle !== handle) {
    revalidatePath(channelPath(previousHandle));
  }

  return { ok: true };
}

export async function createInviteAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [admin, locale] = await Promise.all([requireAdmin(), getLocale()]);
  const note =
    String(formData.get("note") ?? "")
      .trim()
      .slice(0, 80) || null;

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

  return { error: studioErrors[locale].inviteFailed };
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
// Cuenta
// ---------------------------------------------------------------------------

export async function clearPlaybackHistoryAction(): Promise<void> {
  const user = await requireUser();

  await prisma.playbackProgress.deleteMany({ where: { userId: user.id } });

  revalidatePath("/estudio/cuenta");
  redirect("/estudio/cuenta?historial=1");
}

/**
 * Elimina la cuenta y su contenido. Requiere contraseña actual y escribir el
 * email. No aplica a administradores para no dejar la plataforma sin acceso.
 */
export async function deleteAccountAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioAccountContent[locale];

  if (user.role === "admin") {
    return { error: content.errors.deleteAdmin };
  }

  if (!take(`delete-account:${user.id}`, 5, 15 * 60 * 1000)) {
    return { error: content.errors.deleteLimit };
  }

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  const acknowledge = formData.get("acknowledge") === "on";

  if (!acknowledge || confirmation.toLowerCase() !== user.email.toLowerCase()) {
    return { error: content.errors.deleteConfirmation };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return { error: content.errors.deletePassword };
  }

  const channel = await prisma.channel.findUnique({
    where: { userId: user.id },
    select: {
      avatarKey: true,
      bannerKey: true,
      episodes: { select: { id: true, audioPath: true, coverKey: true } },
    },
  });

  const episodeIds = channel?.episodes.map((episode) => episode.id) ?? [];
  const mediaKeys = [
    channel?.avatarKey,
    channel?.bannerKey,
    ...(channel?.episodes.flatMap((episode) => [
      episode.audioPath,
      episode.coverKey,
    ]) ?? []),
  ].filter((key): key is string => Boolean(key));

  try {
    await prisma.$transaction([
      // Los reportes son historial de moderación: se conservan sin quién los
      // envió.
      prisma.report.updateMany({
        where: { reporterId: user.id },
        data: { reporterId: null, reporterEmail: null },
      }),
      prisma.waitlistEntry.deleteMany({ where: { email: user.email } }),
      // La invitación usada por la cuenta no debe quedar reutilizable, y las
      // invitaciones sin usar que creó se revocan con la cuenta.
      prisma.invite.deleteMany({
        where: {
          OR: [{ usedById: user.id }, { createdById: user.id, usedById: null }],
        },
      }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  } catch (error) {
    console.error("[account] No se pudo eliminar la cuenta:", error);
    return { error: content.errors.deleteGeneric };
  }

  // Efectos secundarios best-effort: la cuenta ya no existe.
  try {
    for (const id of episodeIds) removeFromIndex(id);
    purgeEpisodes(episodeIds);
  } catch (error) {
    console.error("[account] No se pudo limpiar el índice/analítica:", error);
  }

  try {
    await deleteUserPushSubscriptions(user.id);
  } catch (error) {
    console.error(
      "[account] No se pudieron borrar las suscripciones push:",
      error,
    );
  }

  await Promise.all(mediaKeys.map((key) => storage.remove(key)));
  await destroySession();

  redirect("/cuenta-eliminada");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/estudio/cuenta?error=invalid");
  }

  const { currentPassword, newPassword } = parsed.data;

  const valid = await verifyPassword(currentPassword, user.passwordHash);

  if (!valid) {
    redirect("/estudio/cuenta?error=current");
  }

  if (currentPassword === newPassword) {
    redirect("/estudio/cuenta?error=same");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Cierra el resto de las sesiones y deja viva solo la actual.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);

  redirect("/estudio/cuenta?ok=1");
}
