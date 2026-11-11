import { describe, expect, it } from "vitest";
import {
  loginSchema,
  passwordResetSchema,
  registerSchema,
  resetRequestSchema,
} from "./schemas";

describe("esquemas de autenticación", () => {
  it("normaliza el email del registro", () => {
    const parsed = registerSchema.safeParse({
      name: "  Ana  ",
      email: "ANA@Example.com",
      password: "12345678",
      inviteCode: "ABC",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.name).toBe("Ana");
    expect(parsed.success && parsed.data.email).toBe("ana@example.com");
  });

  it("rechaza contraseñas cortas y emails inválidos", () => {
    expect(
      registerSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        password: "corta",
      }).success,
    ).toBe(false);

    expect(
      registerSchema.safeParse({
        name: "Ana",
        email: "no-es-email",
        password: "12345678",
      }).success,
    ).toBe(false);
  });

  it("normaliza el email del login", () => {
    const parsed = loginSchema.safeParse({
      email: "ANA@Example.com",
      password: "12345678",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.email).toBe("ana@example.com");
  });

  it("valida la solicitud de recuperación", () => {
    expect(
      resetRequestSchema.safeParse({ email: "ana@example.com" }).success,
    ).toBe(true);
    expect(resetRequestSchema.safeParse({ email: "no-es-email" }).success).toBe(
      false,
    );
  });

  it("exige que las contraseñas nuevas coincidan", () => {
    expect(
      passwordResetSchema.safeParse({
        newPassword: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);

    expect(
      passwordResetSchema.safeParse({
        newPassword: "12345678",
        confirmPassword: "87654321",
      }).success,
    ).toBe(false);
  });
});
