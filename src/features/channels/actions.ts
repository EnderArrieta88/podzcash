"use server";

import "server-only";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getLocale } from "@/lib/i18n/locale";
import { studioErrors } from "@/lib/i18n/studio-errors";
import { channelSchema } from "./schemas";
import { toFieldErrors } from "@/lib/validation";
import { validateZcashAddress } from "@/lib/zcash-address";
import { linkListSchema } from "@/lib/links";
import { IMAGE_MIME } from "@/lib/media-types";
import { storage } from "@/lib/storage";
import { reindexChannel } from "@/lib/search-index";
import { channelPath } from "@/lib/routes";
import type { ActionState } from "@/lib/action-state";
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
