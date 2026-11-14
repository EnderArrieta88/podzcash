import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  channel: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ prisma: db }));

import {
  getChannelDonationData,
  getChannelFeedData,
  getChannelPageData,
  getFeaturedChannel,
  listSitemapChannels,
} from "./queries";

describe("channels queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normaliza el handle y devuelve null si el canal no existe", async () => {
    db.channel.findUnique.mockResolvedValueOnce(null);

    await expect(getChannelPageData("@NoExiste")).resolves.toBeNull();
    expect(db.channel.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { handle: "noexiste" } }),
    );
  });

  it("usa la portada más antigua disponible y cae al avatar", async () => {
    db.channel.findUnique.mockResolvedValueOnce({
      id: "c1",
      handle: "canal",
      avatarKey: "avatars/canal.jpg",
      bannerKey: null,
      links: JSON.stringify([{ label: "Web", url: "https://example.com" }]),
      episodes: [
        { id: "e3", coverKey: null },
        { id: "e2", coverKey: "covers/e2.jpg" },
        { id: "e1", coverKey: "covers/e1.jpg" },
      ],
    });

    const data = await getChannelPageData("canal");

    expect(data?.image).toBe("/media/covers/e1.jpg");
    expect(data?.avatarUrl).toBe("/media/avatars/canal.jpg");
    expect(data?.bannerUrl).toBeNull();
    expect(data?.links).toEqual([{ label: "Web", url: "https://example.com" }]);
  });

  it("devuelve los datos de donación con avatar resuelto", async () => {
    db.channel.findUnique.mockResolvedValueOnce({
      handle: "canal",
      displayName: "Canal",
      avatarKey: null,
      zcashAddress: "zs1test",
    });

    await expect(getChannelDonationData("canal")).resolves.toEqual({
      channel: expect.objectContaining({ zcashAddress: "zs1test" }),
      avatarUrl: null,
    });
  });

  it("consulta el feed y el sitemap con los filtros esperados", async () => {
    db.channel.findUnique.mockResolvedValueOnce(null);
    db.channel.findMany.mockResolvedValueOnce([]);
    db.channel.findFirst.mockResolvedValueOnce(null);

    await getChannelFeedData("canal");
    await listSitemapChannels();
    await getFeaturedChannel();

    expect(db.channel.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { handle: "canal" },
        include: expect.objectContaining({
          episodes: expect.objectContaining({
            where: { status: "published" },
            orderBy: { publishedAt: "asc" },
          }),
        }),
      }),
    );
    expect(db.channel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 500, orderBy: { updatedAt: "desc" } }),
    );
    expect(db.channel.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { episodes: { some: { status: "published" } } },
      }),
    );
  });
});
