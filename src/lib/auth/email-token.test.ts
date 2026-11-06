import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createEmailToken,
  emailFingerprint,
  verifyEmailToken,
} from "./email-token";

const previous = process.env.AUTH_SECRET;

describe("tokens de verificación de email", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret-with-enough-entropy";
  });

  afterEach(() => {
    if (previous === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previous;
  });

  const user = { id: "user-1", email: "Persona@Ejemplo.com" };

  it("crea y verifica un token", () => {
    const token = createEmailToken(user);
    const payload = verifyEmailToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user-1");
    expect(payload?.emailFingerprint).toBe(emailFingerprint(user.email));
  });

  it("normaliza el email al calcular la huella", () => {
    expect(emailFingerprint("Persona@Ejemplo.com")).toBe(
      emailFingerprint(" persona@ejemplo.com "),
    );
  });

  it("rechaza una firma manipulada", () => {
    const token = createEmailToken(user);
    const [body, signature] = token.split(".");
    const tampered = `${body}x.${signature}`;

    expect(verifyEmailToken(tampered)).toBeNull();
  });

  it("rechaza un token caducado", () => {
    const token = createEmailToken(user, 1_000);
    const payload = verifyEmailToken(token, 1_000 + 48 * 60 * 60 * 1000 + 1);

    expect(payload).toBeNull();
  });

  it("no crea tokens sin AUTH_SECRET", () => {
    delete process.env.AUTH_SECRET;

    expect(() => createEmailToken(user)).toThrow();
    expect(verifyEmailToken("payload.signature")).toBeNull();
  });
});
