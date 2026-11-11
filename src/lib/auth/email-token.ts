import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// 48 horas: suficiente para revisar el correo sin dejar el enlace abierto
// para siempre.
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

type VerifyPayload = {
  v: 1;
  uid: string;
  exp: number;
  mail: string;
};

function secret(): string | null {
  const value = process.env.AUTH_SECRET?.trim();
  return value ? value : null;
}

export function isEmailTokenConfigured(): boolean {
  return Boolean(secret());
}

export function emailFingerprint(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

function encode(payload: VerifyPayload, key: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function createEmailToken(
  user: { id: string; email: string },
  now = Date.now(),
): string {
  const key = secret();

  if (!key) {
    throw new Error("AUTH_SECRET no está configurado.");
  }

  return encode(
    {
      v: 1,
      uid: user.id,
      exp: now + VERIFY_TTL_MS,
      mail: emailFingerprint(user.email),
    },
    key,
  );
}

export function verifyEmailToken(
  token: string,
  now = Date.now(),
): { userId: string; emailFingerprint: string } | null {
  const key = secret();
  if (!key || token.length > 2048) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const providedBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  let payload: VerifyPayload;

  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    payload.v !== 1 ||
    typeof payload.uid !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.mail !== "string" ||
    payload.exp <= now
  ) {
    return null;
  }

  return { userId: payload.uid, emailFingerprint: payload.mail };
}
