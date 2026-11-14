import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  channel: { findUnique: vi.fn() },
  episode: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: db }));

import {
  findEpisodeByAudioPath,
  getEmbedEpisode,
  getEpisodePageData,
  getEpisodeTitle,
  getLatestPublishedEpisode,
  getStudioDashboard,
  getStudioEpisode,
  listSitemapEpisodes,
  listStudioEpisodes,
} from "./queries";

describe("episodes queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve null si el canal o el episodio no existen", async () => {
    db.channel.findUnique.mockResolvedValueOnce(null);
    await expect(getEpisodePageData("canal", "slug")).resolves.toBeNull();

    db.channel.findUnique.mockResolvedValueOnce({ id: "ch1" });
    db.episode.findUnique.mockResolvedValueOnce(null);
    await expect(getEpisodePageData("canal", "slug")).resolves.toBeNull();
  });

  it("resuelve portada, audio e imagen social con fallback al avatar", async () => {
    db.channel.findUnique.mockResolvedValueOnce({
      id: "ch1",
      handle: "canal",
      displayName: "Canal",
      avatarKey: "avatars/canal.jpg",
      zcashAddress: null,
    });
    db.episode.findUnique.mockResolvedValueOnce({
      id: "e1",
      slug: "episodio",
      coverKey: null,
      audioPath: "audio/e1.mp3",
      tags: [],
    });

    const data = await getEpisodePageData("canal", "episodio");

    expect(data?.cover).toBeNull();
    expect(data?.audioUrl).toBe("/media/audio/e1.mp3");
    expect(data?.ogImage).toBe("/media/avatars/canal.jpg");
  });

  it("mapea el embed y el título del episodio", async () => {
    db.episode.findUnique.mockResolvedValueOnce(null);
    await expect(getEmbedEpisode("missing")).resolves.toBeNull();

    db.episode.findUnique.mockResolvedValueOnce({
      id: "e1",
      title: "Episodio",
      coverKey: "covers/e1.jpg",
      audioPath: "audio/e1.mp3",
      channel: { handle: "canal", displayName: "Canal" },
    });
    await expect(getEmbedEpisode("e1")).resolves.toEqual({
      episode: expect.objectContaining({ id: "e1" }),
      cover: "/media/covers/e1.jpg",
      audioUrl: "/media/audio/e1.mp3",
    });

    db.episode.findUnique.mockResolvedValueOnce({ title: "Episodio" });
    await expect(getEpisodeTitle("e1")).resolves.toBe("Episodio");
    db.episode.findUnique.mockResolvedValueOnce(null);
    await expect(getEpisodeTitle("missing")).resolves.toBeNull();
  });

  it("prepara la edición del episodio y la lista del estudio", async () => {
    db.episode.findFirst.mockResolvedValueOnce(null);
    await expect(getStudioEpisode("ch1", "e1")).resolves.toBeNull();

    db.episode.findFirst.mockResolvedValueOnce({
      id: "e1",
      coverKey: "covers/e1.jpg",
      tags: [],
    });
    await expect(getStudioEpisode("ch1", "e1")).resolves.toEqual({
      episode: expect.objectContaining({ id: "e1" }),
      coverUrl: "/media/covers/e1.jpg",
    });

    db.episode.findMany.mockResolvedValueOnce([
      { id: "e1", coverKey: "covers/e1.jpg", status: "published" },
      { id: "e2", coverKey: null, status: "draft" },
    ]);
    await expect(listStudioEpisodes("ch1")).resolves.toEqual({
      episodes: [
        expect.objectContaining({ coverUrl: "/media/covers/e1.jpg" }),
        expect.objectContaining({ coverUrl: null }),
      ],
      publishedCount: 1,
    });
  });

  it("consulta la portada y el sitemap con los filtros correctos", async () => {
    db.episode.findFirst.mockResolvedValueOnce(null);
    await getLatestPublishedEpisode();
    expect(db.episode.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { status: "published" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    );

    db.episode.findMany.mockResolvedValueOnce([]);
    await listSitemapEpisodes();
    expect(db.episode.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 1000,
      }),
    );
  });

  it("cachea la búsqueda de audio por ruta", async () => {
    db.episode.findFirst.mockResolvedValueOnce({
      id: "e1",
      channelId: "ch1",
      durationSec: 120,
    });

    const first = await findEpisodeByAudioPath("audio/cache-test.mp3");
    const second = await findEpisodeByAudioPath("audio/cache-test.mp3");

    expect(first).toEqual({ id: "e1", channelId: "ch1", durationSec: 120 });
    expect(second).toBe(first);
    expect(db.episode.findFirst).toHaveBeenCalledTimes(1);
  });

  it("suma reproducciones del panel del estudio", async () => {
    db.episode.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);
    db.episode.aggregate.mockResolvedValueOnce({ _sum: { playCount: 42 } });

    await expect(
      getStudioDashboard({
        id: "ch1",
        avatarKey: "avatars/canal.jpg",
        links: null,
      }),
    ).resolves.toEqual({
      episodes: 5,
      publishedEpisodes: 3,
      plays: 42,
      links: [],
      avatarUrl: "/media/avatars/canal.jpg",
    });
  });
});
