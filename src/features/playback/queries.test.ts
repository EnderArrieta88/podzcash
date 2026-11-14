import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  episode: { findFirst: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
  playbackProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: db }));

import {
  clearPlaybackProgress,
  episodeExists,
  findPublishedEpisodeChannel,
  getPlaybackProgress,
  incrementEpisodePlayCount,
  savePlaybackProgress,
} from "./queries";

describe("playback queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca el canal solo de episodios publicados", async () => {
    db.episode.findFirst.mockResolvedValueOnce({ channelId: "ch1" });

    await expect(findPublishedEpisodeChannel("e1")).resolves.toEqual({
      channelId: "ch1",
    });
    expect(db.episode.findFirst).toHaveBeenCalledWith({
      where: { id: "e1", status: "published" },
      select: { channelId: true },
    });
  });

  it("incrementa reproducciones sin tocar borradores", async () => {
    db.episode.updateMany.mockResolvedValueOnce({ count: 1 });

    await expect(incrementEpisodePlayCount("e1")).resolves.toEqual({
      count: 1,
    });
    expect(db.episode.updateMany).toHaveBeenCalledWith({
      where: { id: "e1", status: "published" },
      data: { playCount: { increment: 1 } },
    });
  });

  it("lee y guarda el progreso por usuario y episodio", async () => {
    db.playbackProgress.findUnique.mockResolvedValueOnce(null);
    db.playbackProgress.upsert.mockResolvedValueOnce({
      updatedAt: new Date("2026-11-13T00:00:00Z"),
    });

    await getPlaybackProgress("u1", "e1");
    expect(db.playbackProgress.findUnique).toHaveBeenCalledWith({
      where: { userId_episodeId: { userId: "u1", episodeId: "e1" } },
    });

    await savePlaybackProgress({
      userId: "u1",
      episodeId: "e1",
      positionSec: 42,
      durationSec: 120,
    });
    expect(db.playbackProgress.upsert).toHaveBeenCalledWith({
      where: { userId_episodeId: { userId: "u1", episodeId: "e1" } },
      update: { positionSec: 42, durationSec: 120 },
      create: {
        userId: "u1",
        episodeId: "e1",
        positionSec: 42,
        durationSec: 120,
      },
      select: { updatedAt: true },
    });
  });

  it("comprueba existencia y borra el historial", async () => {
    db.episode.findUnique.mockResolvedValueOnce({ id: "e1" });
    await expect(episodeExists("e1")).resolves.toBe(true);

    db.episode.findUnique.mockResolvedValueOnce(null);
    await expect(episodeExists("missing")).resolves.toBe(false);

    db.playbackProgress.deleteMany.mockResolvedValueOnce({ count: 3 });
    await expect(clearPlaybackProgress("u1")).resolves.toEqual({ count: 3 });
    expect(db.playbackProgress.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
  });
});
