import { describe, expect, it } from "vitest";
import { buildPaymentUri, encodeMemo } from "./zip321";

describe("ZIP-321", () => {
  it("codifica el memo en base64url sin padding", () => {
    expect(encodeMemo("hola")).toBe("aG9sYQ");
    expect(encodeMemo("ñ")).toBe("w7E");
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
