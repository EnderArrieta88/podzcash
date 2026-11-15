import "server-only";
import { prisma } from "@/lib/db";
import {
  consumeRecoveryCode,
  decryptTotpSecret,
  verifyTotpCode,
} from "@/lib/auth/totp";

/**
 * Valida el segundo factor durante el login. Si el TOTP no es válido, prueba
 * con un código de recuperación y lo consume.
 */
export async function verifyLoginTotp(
  user: {
    id: string;
    totpSecret: string | null;
    totpRecoveryCodes: string | null;
  },
  code: string,
): Promise<boolean> {
  if (user.totpSecret) {
    try {
      if (verifyTotpCode(decryptTotpSecret(user.totpSecret), code)) {
        return true;
      }
    } catch (error) {
      console.error("[totp] No se pudo verificar el código:", error);
    }
  }

  const recovery = consumeRecoveryCode(user.totpRecoveryCodes, code);

  if (!recovery.ok) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: { totpRecoveryCodes: recovery.remaining },
  });

  return true;
}
