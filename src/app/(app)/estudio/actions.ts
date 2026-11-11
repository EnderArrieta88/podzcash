"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { destroySession } from "@/lib/auth/session";
import { generateInviteCode } from "@/lib/links";
import { getLocale } from "@/lib/i18n/locale";
import { studioErrors } from "@/lib/i18n/studio-errors";
import type { ActionState } from "@/lib/action-state";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
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
