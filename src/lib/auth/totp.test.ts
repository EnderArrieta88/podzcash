import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Secret, TOTP } from "otpauth";
import {
  consumeRecoveryCode,
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  totpUri,
  verifyTotpCode,
} from "./totp";

const originalSecret = process.env.AUTH_SECRET;

beforeEach(() => {
  process.env.AUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
});

afterEach(() => {
  process.env.AUTH_SECRET = originalSecret;
});

function currentCode(secret: string): string {
  return new TOTP({ secret: Secret.fromBase32(secret) }).generate();
}

describe("TOTP", () => {
  it("cifra y descifra el secreto", () => {
    const secret = generateTotpSecret();
    const encrypted = encryptTotpSecret(secret);

    expect(encrypted).not.toContain(secret);
    expect(decryptTotpSecret(encrypted)).toBe(secret);
  });

  it("valida un código actual y rechaza uno incorrecto", () => {
    const secret = generateTotpSecret();

    expect(verifyTotpCode(secret, currentCode(secret))).toBe(true);
    expect(verifyTotpCode(secret, "000000")).toBe(false);
    expect(verifyTotpCode(secret, "abc")).toBe(false);
  });

  it("genera una URI otpauth válida", () => {
    const secret = generateTotpSecret();
    const uri = totpUri(secret, "persona@example.com");

    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("issuer=PodZcash");
    expect(uri).toContain(encodeURIComponent(secret));
  });

  it("consume un código de recuperación una sola vez", () => {
    const [code, ...rest] = generateRecoveryCodes();
    const stored = JSON.stringify([code, ...rest].map(hashRecoveryCode));

    const first = consumeRecoveryCode(stored, code);
    expect(first.ok).toBe(true);
    expect(first.remaining?.split(",").length).toBeLessThan(
      stored.split(",").length,
    );

    expect(consumeRecoveryCode(first.remaining, code).ok).toBe(false);
    expect(consumeRecoveryCode(stored, "AAAAA-BBBBB").ok).toBe(false);
  });
});
