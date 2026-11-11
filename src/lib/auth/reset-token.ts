import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const RESET_TTL_MS = 60 * 60 * 1000;

type ResetPayload = {
  v: 1;
  uid: string;
  exp: number;
  pwd: string;
};

function secret(): string | null {
  const value = process.env.AUTH_SECRET?.trim();
  return value ? value : null;
}

export function isResetTokenConfigured(): boolean {
  return Boolean(secret());
}

export function passwordFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

function encode(payload: ResetPayload, key: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function createResetToken(
  user: { id: string; passwordHash: string },
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
      exp: now + RESET_TTL_MS,
      pwd: passwordFingerprint(user.passwordHash),
    },
    key,
  );
}

export function verifyResetToken(
  token: string,
  now = Date.now(),
): { userId: string; passwordFingerprint: string } | null {
  const key = secret();
  if (!key || token.length > 2048) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const providedBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  let payload: ResetPayload;

  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    payload.v !== 1 ||
    typeof payload.uid !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.pwd !== "string" ||
    payload.exp <= now
  ) {
    return null;
  }

  return { userId: payload.uid, passwordFingerprint: payload.pwd };
}
