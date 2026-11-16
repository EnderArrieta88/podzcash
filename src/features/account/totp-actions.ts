"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { verifyPassword } from "@/lib/auth/password";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  totpUri,
  verifyTotpCode,
} from "@/lib/auth/totp";
import { getLocale } from "@/lib/i18n/locale";
import { take } from "@/lib/rate-limit";
import { studioSecurityContent } from "@/lib/i18n/studio-security";

export type TotpActionState = {
  ok?: boolean;
  error?: string;
  secret?: string;
  uri?: string;
  recoveryCodes?: string[];
} | null;

function recoveryCodesJson(codes: string[]): string {
  return JSON.stringify(codes.map(hashRecoveryCode));
}

export async function startTotpSetupAction(
  _previous: TotpActionState,
  formData: FormData,
): Promise<TotpActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioSecurityContent[locale];

  if (user.totpEnabled) return { error: content.errors.already };

  if (!take(`totp-start:${user.id}`, 10, 15 * 60 * 1000)) {
    return { error: content.errors.tooMany };
  }

  const password = String(formData.get("password") ?? "");

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: content.errors.password };
  }

  try {
    const secret = generateTotpSecret();

    await prisma.user.update({
      where: { id: user.id },
      data: { totpPendingSecret: encryptTotpSecret(secret) },
    });

    return { secret, uri: totpUri(secret, user.email) };
  } catch (error) {
    console.error("[totp] No se pudo iniciar la configuración:", error);
    return { error: content.errors.crypto };
  }
}

export async function confirmTotpAction(
  _previous: TotpActionState,
  formData: FormData,
): Promise<TotpActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioSecurityContent[locale];
  const code = String(formData.get("code") ?? "").trim();

  if (!user.totpPendingSecret) return { error: content.errors.missing };

  if (!take(`totp-confirm:${user.id}`, 10, 15 * 60 * 1000)) {
    return { error: content.errors.tooMany };
  }

  try {
    const secret = decryptTotpSecret(user.totpPendingSecret);

    if (!verifyTotpCode(secret, code)) {
      return { error: content.errors.invalid };
    }

    const recoveryCodes = generateRecoveryCodes();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: encryptTotpSecret(secret),
        totpEnabled: true,
        totpPendingSecret: null,
        totpRecoveryCodes: recoveryCodesJson(recoveryCodes),
      },
    });

    revalidatePath("/estudio/cuenta");
    return { ok: true, recoveryCodes };
  } catch (error) {
    console.error("[totp] No se pudo activar 2FA:", error);
    return { error: content.errors.generic };
  }
}

export async function manageTotpAction(
  _previous: TotpActionState,
  formData: FormData,
): Promise<TotpActionState> {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioSecurityContent[locale];
  const intent = String(formData.get("intent") ?? "");
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!take(`totp-manage:${user.id}`, 10, 15 * 60 * 1000)) {
    return { error: content.errors.tooMany };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: content.errors.password };
  }

  if (!user.totpEnabled || !user.totpSecret) {
    return { error: content.errors.already };
  }

  if (intent === "disable") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
        totpRecoveryCodes: null,
        totpPendingSecret: null,
      },
    });

    revalidatePath("/estudio/cuenta");
    return { ok: true };
  }

  let secret: string;

  try {
    secret = decryptTotpSecret(user.totpSecret);
  } catch (error) {
    console.error("[totp] No se pudo leer el secreto:", error);
    return { error: content.errors.noSecret };
  }

  if (intent !== "regenerate") return { error: content.errors.generic };

  if (!verifyTotpCode(secret, code)) {
    return { error: content.errors.invalid };
  }

  const recoveryCodes = generateRecoveryCodes();

  await prisma.user.update({
    where: { id: user.id },
    data: { totpRecoveryCodes: recoveryCodesJson(recoveryCodes) },
  });

  revalidatePath("/estudio/cuenta");
  return { ok: true, recoveryCodes };
}
