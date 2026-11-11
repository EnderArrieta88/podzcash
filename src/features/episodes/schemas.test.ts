import { describe, expect, it } from "vitest";
import { toFieldErrors } from "@/lib/validation";
import { episodeSchema } from "./schemas";

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
