"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { normalizeInviteCode } from "@/lib/links";
import {
  loginSchema,
  registerSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";
import { clearLimit, take } from "@/lib/rate-limit";

class InviteTakenError extends Error {}

export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Honeypot: los bots completan campos ocultos.
  if (String(formData.get("website") ?? "").trim()) {
    return { error: "No se pudo crear la cuenta." };
  }
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode") ?? undefined,
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error) };
  }

  const { name, email, password } = parsed.data;
  const isFirstUser = (await prisma.user.count()) === 0;

  let inviteId: string | null = null;

  if (!isFirstUser) {
    const code = normalizeInviteCode(parsed.data.inviteCode ?? "");

    if (!code) {
      return { fields: { inviteCode: "Necesitas un código de invitación." } };
    }

    const invite = await prisma.invite.findUnique({ where: { code } });

    if (
      !invite ||
      invite.usedById ||
      (invite.expiresAt && invite.expiresAt.getTime() < Date.now())
    ) {
      return {
        fields: { inviteCode: "El código no es válido o ya fue usado." },
      };
    }

    inviteId = invite.id;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fields: { email: "Ese email ya tiene una cuenta." } };
  }

  const passwordHash = await hashPassword(password);

  let userId: string;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: isFirstUser ? "admin" : "creator",
          status: "active",
        },
      });

      if (inviteId) {
        const claimed = await tx.invite.updateMany({
          where: { id: inviteId, usedById: null },
          data: { usedById: created.id, usedAt: new Date() },
        });

        if (claimed.count === 0) throw new InviteTakenError();
      }

      return created;
    });

    userId = user.id;
  } catch (error) {
    if (error instanceof InviteTakenError) {
      return {
        fields: {
          inviteCode: "Alguien acaba de usar ese código. Pide otro.",
        },
      };
    }

    console.error("No se pudo crear la cuenta:", error);
    return { error: "No se pudo crear la cuenta. Inténtalo otra vez." };
  }

  await createSession(userId);
  redirect("/estudio");
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error) as FieldErrors };
  }

  const { email, password } = parsed.data;

  const limitKey = `login:${email}`;

  if (!take(limitKey, 10, 15 * 60 * 1000)) {
    return { error: "Demasiados intentos. Esperá unos minutos." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return { error: "Email o contraseña incorrectos." };
  }

  if (user.status !== "active") {
    return { error: "Esta cuenta está suspendida." };
  }

  clearLimit(limitKey);

  await createSession(user.id);
  redirect("/estudio");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
