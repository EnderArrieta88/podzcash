import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createResetToken,
  passwordFingerprint,
  verifyResetToken,
} from "./reset-token";

const previous = process.env.AUTH_SECRET;

describe("tokens de recuperación", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret-with-enough-entropy";
  });

  afterEach(() => {
    if (previous === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previous;
  });

  const user = { id: "user-1", passwordHash: "hash-1" };

  it("crea y verifica un token", () => {
    const token = createResetToken(user);
    const payload = verifyResetToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user-1");
    expect(payload?.passwordFingerprint).toBe(passwordFingerprint("hash-1"));
  });

  it("rechaza una firma manipulada", () => {
    const token = createResetToken(user);
    const [body, signature] = token.split(".");
    const tampered = `${body}x.${signature}`;

    expect(verifyResetToken(tampered)).toBeNull();
  });

  it("rechaza un token caducado", () => {
    const token = createResetToken(user, 1_000);
    const payload = verifyResetToken(token, 1_000 + 60 * 60 * 1000 + 1);

    expect(payload).toBeNull();
  });

  it("no crea tokens sin AUTH_SECRET", () => {
    delete process.env.AUTH_SECRET;

    expect(() => createResetToken(user)).toThrow();
    expect(verifyResetToken("payload.signature")).toBeNull();
  });
});
