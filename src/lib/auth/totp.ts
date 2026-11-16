import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { Secret, TOTP } from "otpauth";

const ISSUER = "PodZcash";
const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("AUTH_SECRET es obligatorio para activar 2FA.");
  }

  return createHash("sha256").update(secret).digest();
}

/** Cifra el secreto TOTP antes de guardarlo. */
export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return ["v1", iv, tag, encrypted]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(":");
}

export function decryptTotpSecret(value: string): string {
  const [version, ivPart, tagPart, dataPart] = value.split(":");

  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new Error("Secreto TOTP inválido.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpUri(secret: string, email: string): string {
  return new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  }).toString();
}

/** Valida un código TOTP, aceptando un periodo anterior o posterior. */
export function verifyTotpCode(secret: string, token: string): boolean {
  const clean = token.replace(/\s/g, "");

  if (!/^\d{6}$/.test(clean)) return false;

  return (
    new TOTP({
      issuer: ISSUER,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    }).validate({ token: clean, window: 1 }) !== null
  );
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    const raw = randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

/**
 * Hash con clave de los códigos de recuperación. La clave deriva de
 * AUTH_SECRET, así que una filtración de la base de datos no basta para
 * probar códigos offline.
 */
export function hashRecoveryCode(code: string): string {
  const normalized = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return createHmac("sha256", encryptionKey()).update(normalized).digest("hex");
}

/**
 * Comprueba un código de recuperación y devuelve el JSON restante. Un código
 * solo se puede usar una vez.
 */
export function consumeRecoveryCode(
  stored: string | null,
  code: string,
): { ok: boolean; remaining: string | null } {
  if (!stored) return { ok: false, remaining: stored };

  let codes: string[];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return { ok: false, remaining: stored };
    codes = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return { ok: false, remaining: stored };
  }

  const hash = hashRecoveryCode(code);
  const index = codes.indexOf(hash);

  if (index === -1) return { ok: false, remaining: stored };

  codes.splice(index, 1);
  return {
    ok: true,
    remaining: codes.length > 0 ? JSON.stringify(codes) : null,
  };
}
