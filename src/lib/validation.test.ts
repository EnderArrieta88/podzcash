import { describe, expect, it } from "vitest";
import { channelSchema, toFieldErrors } from "./validation";

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

  it("aplica valores por defecto al feed", () => {
    const parsed = channelSchema.parse({
      displayName: "Nora Vela",
      handle: "nora-vela",
      bio: "",
      zcashAddress: "",
    });

    expect(parsed.feedLanguage).toBe("es");
    expect(parsed.feedCategory).toBe("Technology");
    expect(parsed.feedExplicit).toBe(false);
    expect(parsed.block).toBe(false);
    expect(parsed.ownerEmail).toBeUndefined();
    expect(parsed.newFeedUrl).toBeUndefined();
  });

  it("rechaza un idioma, email o URL de feed inválidos", () => {
    const parsed = channelSchema.safeParse({
      displayName: "Nora Vela",
      handle: "nora-vela",
      bio: "",
      zcashAddress: "",
      feedLanguage: "Español!",
      ownerEmail: "no-es-un-email",
      newFeedUrl: "no-es-una-url",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const errors = toFieldErrors(parsed.error, "es");
    expect(errors.feedLanguage).toContain("código de idioma");
    expect(errors.ownerEmail).toContain("email de propietario");
    expect(errors.newFeedUrl).toContain("URL válida");
  });
});
