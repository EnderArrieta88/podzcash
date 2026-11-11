import { describe, expect, it } from "vitest";
import { passwordChangeSchema } from "./schemas";

describe("esquema de cambio de contraseña", () => {
  it("acepta una contraseña nueva válida y confirmada", () => {
    expect(
      passwordChangeSchema.safeParse({
        currentPassword: "actual",
        newPassword: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
  });

  it("rechaza contraseñas nuevas cortas", () => {
    expect(
      passwordChangeSchema.safeParse({
        currentPassword: "actual",
        newPassword: "corta",
        confirmPassword: "corta",
      }).success,
    ).toBe(false);
  });

  it("rechaza una confirmación distinta", () => {
    const parsed = passwordChangeSchema.safeParse({
      currentPassword: "actual",
      newPassword: "12345678",
      confirmPassword: "87654321",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});
