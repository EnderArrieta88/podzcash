"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { normalizeInviteCode } from "@/lib/links";
import {
  loginSchema,
  passwordResetSchema,
  registerSchema,
  resetRequestSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";
import { clearLimit, take } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n/locale";
import { authContent } from "@/lib/i18n/auth";
import {
  createResetToken,
  isResetTokenConfigured,
  passwordFingerprint,
  verifyResetToken,
} from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSiteOrigin } from "@/lib/origin";

class InviteTakenError extends Error {}

export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const content = authContent[locale].register;

  // Honeypot: los bots completan campos ocultos.
  if (String(formData.get("website") ?? "").trim()) {
    return { error: content.errors.generic };
  }

  if (formData.get("terms") !== "on") {
    return { fields: { terms: content.errors.termsRequired } };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode") ?? undefined,
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const { name, email, password } = parsed.data;
  const isFirstUser = (await prisma.user.count()) === 0;

  let inviteId: string | null = null;

  if (!isFirstUser) {
    const code = normalizeInviteCode(parsed.data.inviteCode ?? "");

    if (!code) {
      return { fields: { inviteCode: content.errors.inviteRequired } };
    }

    const invite = await prisma.invite.findUnique({ where: { code } });

    if (
      !invite ||
      invite.usedById ||
      (invite.expiresAt && invite.expiresAt.getTime() < Date.now())
    ) {
      return {
        fields: { inviteCode: content.errors.inviteInvalid },
      };
    }

    inviteId = invite.id;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fields: { email: content.errors.emailExists } };
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
          inviteCode: content.errors.inviteTaken,
        },
      };
    }

    console.error("No se pudo crear la cuenta:", error);
    return { error: content.errors.retry };
  }

  await createSession(userId);
  redirect("/estudio");
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const content = authContent[locale].login;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) as FieldErrors };
  }

  const { email, password } = parsed.data;

  const limitKey = `login:${email}`;

  if (!take(limitKey, 10, 15 * 60 * 1000)) {
    return { error: content.errors.tooMany };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return { error: content.errors.invalid };
  }

  if (user.status !== "active") {
    return { error: content.errors.suspended };
  }

  clearLimit(limitKey);

  await createSession(user.id);
  redirect("/estudio");
}

export async function requestPasswordResetAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();

  const parsed = resetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const email = parsed.data.email;

  // Límite silencioso: no revelamos si el email existe o si se alcanzó el límite.
  if (!take(`reset:${email}`, 3, 15 * 60 * 1000)) {
    return { ok: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.status === "active") {
    if (!isResetTokenConfigured()) {
      console.warn("[auth] AUTH_SECRET no está configurado; no se envía el enlace.");
      return { ok: true };
    }

    try {
      const token = createResetToken(user);
      const origin = await getSiteOrigin();
      const url = `${origin}/restablecer?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({ to: user.email, url, locale });
    } catch (error) {
      console.error("[auth] No se pudo preparar el email de recuperación:", error);
    }
  }

  return { ok: true };
}

export async function resetPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = await getLocale();
  const content = authContent[locale].reset;
  const token = String(formData.get("token") ?? "").trim();

  const payload = verifyResetToken(token);
  if (!payload) {
    return { error: content.errors.invalidToken };
  }

  const parsed = passwordResetSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fields: toFieldErrors(parsed.error, locale) };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (
    !user ||
    user.status !== "active" ||
    passwordFingerprint(user.passwordHash) !== payload.passwordFingerprint
  ) {
    return { error: content.errors.invalidToken };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  const updated = await prisma.user.updateMany({
    where: { id: user.id, passwordHash: user.passwordHash },
    data: { passwordHash },
  });

  if (updated.count !== 1) {
    return { error: content.errors.invalidToken };
  }

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  redirect("/estudio");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
