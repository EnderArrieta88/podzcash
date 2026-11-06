import { describe, expect, it } from "vitest";
import { channelSchema, episodeSchema, toFieldErrors } from "./validation";

describe("validación de canal", () => {
  it("traduce el nombre de usuario reservado", () => {
    const parsed = channelSchema.safeParse({
      displayName: "Nora Vela",
      handle: "Admin",
      bio: "",
      zcashAddress: "",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(toFieldErrors(parsed.error, "en").handle).toBe(
      "That username is reserved. Choose another one.",
    );
  });

  it("rechaza un nombre de usuario con caracteres inválidos", () => {
    const parsed = channelSchema.safeParse({
      displayName: "Nora Vela",
      handle: "Nora Vela!",
      bio: "",
      zcashAddress: "",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(toFieldErrors(parsed.error, "es").handle).toBe(
      "Solo minúsculas, números y guiones. No puede empezar ni terminar con guion.",
    );
  });
});

describe("validación de episodio", () => {
  it("traduce el límite de etiquetas", () => {
    const parsed = episodeSchema.safeParse({
      title: "Episodio",
      description: "",
      kind: "podcast",
      tags: "x".repeat(241),
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(toFieldErrors(parsed.error, "en").tags).toBe(
      "The tags are too long.",
    );
  });
});
