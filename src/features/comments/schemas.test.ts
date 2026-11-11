import { describe, expect, it } from "vitest";
import {
  commentNotifySchema,
  commentSchema,
  deleteCommentSchema,
} from "./schemas";

describe("comentarios", () => {
  it("valida episodio y cuerpo", () => {
    const parsed = commentSchema.safeParse({
      episodeId: "episodio",
      body: "  Un comentario  ",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.body).toBe("Un comentario");
  });

  it("rechaza cuerpos fuera del rango", () => {
    expect(
      commentSchema.safeParse({ episodeId: "episodio", body: "a" }).success,
    ).toBe(false);

    expect(
      commentSchema.safeParse({
        episodeId: "episodio",
        body: "a".repeat(601),
      }).success,
    ).toBe(false);
  });

  it("normaliza las preferencias de aviso", () => {
    expect(commentNotifySchema.safeParse("email").success).toBe(true);
    expect(commentNotifySchema.safeParse("off").success).toBe(true);
    expect(commentNotifySchema.safeParse("otra").success).toBe(false);
  });

  it("valida el borrado por id", () => {
    expect(
      deleteCommentSchema.safeParse({ id: "comentario", path: "/canal/x" })
        .success,
    ).toBe(true);
    expect(deleteCommentSchema.safeParse({ id: "" }).success).toBe(false);
  });
});
