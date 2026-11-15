import { describe, expect, it } from "vitest";
import {
  buildPaymentUri,
  encodeMemo,
  MAX_MEMO_BYTES,
  memoByteLength,
} from "./zip321";

describe("ZIP-321", () => {
  it("codifica el memo en base64url sin padding", () => {
    expect(encodeMemo("hola")).toBe("aG9sYQ");
    expect(encodeMemo("ñ")).toBe("w7E");
  });

  it("mide el memo en bytes UTF-8, no en caracteres", () => {
    expect(memoByteLength("hola")).toBe(4);
    expect(memoByteLength("ñ")).toBe(2);
    expect(memoByteLength("🎧")).toBe(4);
  });

  it("acepta hasta 512 bytes y rechaza uno más", () => {
    expect(() => encodeMemo("a".repeat(MAX_MEMO_BYTES))).not.toThrow();
    expect(() => encodeMemo("a".repeat(MAX_MEMO_BYTES + 1))).toThrow(
      RangeError,
    );
    expect(() => encodeMemo("🎧".repeat(128))).not.toThrow();
    expect(() => encodeMemo("🎧".repeat(129))).toThrow(RangeError);
  });

  it("rechaza un memo demasiado largo al construir la URI", () => {
    expect(() =>
      buildPaymentUri({ address: "u1ejemplo", memo: "🎧".repeat(129) }),
    ).toThrow(RangeError);
  });

  it("construye una URI con monto, memo y mensaje", () => {
    expect(
      buildPaymentUri({
        address: "u1ejemplo",
        amount: 0.1,
        memo: "hola",
        message: "Gracias",
      }),
    ).toBe("zcash:u1ejemplo?amount=0.1&memo=aG9sYQ&message=Gracias");
  });

  it("omite parámetros vacíos", () => {
    expect(buildPaymentUri({ address: "u1ejemplo" })).toBe("zcash:u1ejemplo");
    expect(buildPaymentUri({ address: "u1ejemplo", amount: 0 })).toBe(
      "zcash:u1ejemplo",
    );
  });

  it("conserva precisión de ZEC", () => {
    expect(buildPaymentUri({ address: "u1ejemplo", amount: 0.00000001 })).toBe(
      "zcash:u1ejemplo?amount=0.00000001",
    );
  });
});
