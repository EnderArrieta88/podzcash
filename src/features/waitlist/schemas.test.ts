import { describe, expect, it } from "vitest";
import { waitlistSchema } from "./schemas";

describe("esquema de lista de espera", () => {
  it("normaliza nombre, email y nota", () => {
    const parsed = waitlistSchema.safeParse({
      name: "  Ana  ",
      email: "ANA@Example.com",
      role: "podcast",
      note: "  Quiere publicar  ",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.name).toBe("Ana");
    expect(parsed.success && parsed.data.email).toBe("ana@example.com");
    expect(parsed.success && parsed.data.note).toBe("Quiere publicar");
  });

  it("rechaza roles y emails inválidos", () => {
    expect(
      waitlistSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        role: "video",
      }).success,
    ).toBe(false);

    expect(
      waitlistSchema.safeParse({
        name: "Ana",
        email: "no-es-email",
        role: "podcast",
      }).success,
    ).toBe(false);
  });

  it("limita la nota a 400 caracteres", () => {
    expect(
      waitlistSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        role: "music",
        note: "a".repeat(401),
      }).success,
    ).toBe(false);
  });
});
