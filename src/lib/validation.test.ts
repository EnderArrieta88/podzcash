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

  it("aplica valores por defecto al feed del episodio", () => {
    const parsed = episodeSchema.parse({
      title: "Episodio",
      description: "",
      kind: "podcast",
    });

    expect(parsed.season).toBeUndefined();
    expect(parsed.episodeNumber).toBeUndefined();
    expect(parsed.episodeType).toBe("full");
    expect(parsed.explicit).toBeUndefined();
  });

  it("convierte temporada, número y explicit del formulario", () => {
    const parsed = episodeSchema.parse({
      title: "Episodio",
      description: "",
      kind: "podcast",
      season: "2",
      episodeNumber: "7",
      episodeType: "bonus",
      explicit: "false",
    });

    expect(parsed.season).toBe(2);
    expect(parsed.episodeNumber).toBe(7);
    expect(parsed.episodeType).toBe("bonus");
    expect(parsed.explicit).toBe(false);
  });

  it("rechaza temporada, número y tipo inválidos", () => {
    const parsed = episodeSchema.safeParse({
      title: "Episodio",
      description: "",
      kind: "podcast",
      season: "-1",
      episodeNumber: "0",
      episodeType: "otro",
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const errors = toFieldErrors(parsed.error, "es");
    expect(errors.season).toContain("temporada");
    expect(errors.episodeNumber).toContain("número de episodio");
    expect(errors.episodeType).toContain("tipo de episodio");
  });
});
