"use server";

import "server-only";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { take, clearLimit } from "@/lib/rate-limit";
import { toFieldErrors } from "@/lib/validation";
import {
  addWaitlistEntry,
  deleteWaitlistEntry,
  getWaitlistEntry,
} from "./queries";
import { waitlistSchema } from "./schemas";
import { getLocale } from "@/lib/i18n/locale";
import { waitlistContent } from "@/lib/i18n/waitlist";
import { sendWaitlistNotificationEmail, sendInviteEmail } from "@/lib/email";
import { sendWaitlistPush } from "@/lib/push";
import { formatInviteCode, generateInviteCode } from "@/lib/links";
import { getSiteOrigin } from "@/lib/origin";
import { env } from "@/lib/env";

export async function joinWaitlistAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const content = waitlistContent[locale];

  // Honeypot: los bots completan campos ocultos.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const parsed = waitlistSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const { name, email, role } = parsed.data;
  const note = parsed.data.note?.trim() || null;

  const limitKey = `waitlist:${email}`;

  // Respuesta genérica: no revelamos si el email ya estaba anotado.
  if (!take(limitKey, 3, 15 * 60 * 1000)) {
    return { ok: true };
  }

  try {
    const result = await addWaitlistEntry({ name, email, role, note });
    clearLimit(limitKey);

    if (result === "created") {
      const to = env.WAITLIST_NOTIFY_EMAIL;

      await sendWaitlistNotificationEmail({
        to,
        entry: { name, email, role, note },
      });

      // El push no debe retrasar la respuesta del formulario.
      after(() => sendWaitlistPush({ name, email, role, note }));
    }
  } catch (error) {
    console.error("[waitlist] No se pudo guardar la solicitud:", error);
    return { error: content.errors.retry };
  }

  return { ok: true };
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
