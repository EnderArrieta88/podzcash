"use server";

import { after } from "next/server";
import type { ActionState } from "@/lib/action-state";
import { take, clearLimit } from "@/lib/rate-limit";
import { toFieldErrors, waitlistSchema } from "@/lib/validation";
import { addWaitlistEntry } from "@/lib/waitlist";
import { getLocale } from "@/lib/i18n/locale";
import { waitlistContent } from "@/lib/i18n/waitlist";
import { sendWaitlistNotificationEmail } from "@/lib/email";
import { sendWaitlistPush } from "@/lib/push";

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
      const to =
        process.env.WAITLIST_NOTIFY_EMAIL?.trim() ||
        "invitaciones@podzcash.online";

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
