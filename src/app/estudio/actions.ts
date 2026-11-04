"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { destroySession } from "@/lib/auth/session";
import { generateInviteCode, linkListSchema } from "@/lib/links";
import { IMAGE_MIME, storage } from "@/lib/storage";
import { channelSchema, toFieldErrors } from "@/lib/validation";
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
