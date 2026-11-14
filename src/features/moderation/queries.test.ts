import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  episode: { findUnique: vi.fn() },
  episodeComment: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: db }));

import { getReportableComment, getReportableEpisode } from "./queries";

describe("moderation queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("solo devuelve episodios publicados", async () => {
    db.episode.findUnique.mockResolvedValueOnce({
      id: "e1",
      status: "draft",
    });
    await expect(getReportableEpisode("e1")).resolves.toBeNull();

    const published = { id: "e2", status: "published" };
    db.episode.findUnique.mockResolvedValueOnce(published);
    await expect(getReportableEpisode("e2")).resolves.toBe(published);
  });

  it("devuelve null si el episodio no existe", async () => {
    db.episode.findUnique.mockResolvedValueOnce(null);
    await expect(getReportableEpisode("missing")).resolves.toBeNull();
  });

  it("consulta el comentario con su contexto", async () => {
    const comment = { id: "c1", body: "Hola" };
    db.episodeComment.findUnique.mockResolvedValueOnce(comment);

    await expect(getReportableComment("c1")).resolves.toBe(comment);
    expect(db.episodeComment.findUnique).toHaveBeenCalledWith({
      where: { id: "c1" },
      select: expect.objectContaining({
        id: true,
        body: true,
        user: { select: { name: true } },
      }),
    });
  });
});
