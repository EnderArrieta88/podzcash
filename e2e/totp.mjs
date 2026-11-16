import {
  createCipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { Secret, TOTP } from "otpauth";

export const E2E_AUTH_SECRET =
  "e2e-secret-0123456789abcdef0123456789abcdef0123456789abcdef";

// Secreto fijo solo para E2E. En producción se genera uno por usuario.
export const TOTP_SECRET = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
export const TOTP_RECOVERY_CODE = "E2E01-23456";

/**
 * Cifra el secreto TOTP con el mismo formato que `src/lib/auth/totp.ts`, para
 * sembrar la base de datos de E2E sin depender del bundle de la app.
 */
export function encryptTotpSecret(secret, authSecret = E2E_AUTH_SECRET) {
  const key = createHash("sha256").update(authSecret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

/** Código TOTP actual para el secreto de E2E. */
export function currentTotp(secret = TOTP_SECRET) {
  return new TOTP({ secret: Secret.fromBase32(secret) }).generate();
}

/** Hash de un código de recuperación, igual que `src/lib/auth/totp.ts`. */
export function hashRecoveryCode(code, authSecret = E2E_AUTH_SECRET) {
  const key = createHash("sha256").update(authSecret).digest();
  const normalized = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return createHmac("sha256", key).update(normalized).digest("hex");
}
