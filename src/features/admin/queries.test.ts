import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findMany: vi.fn() },
  episode: { findMany: vi.fn(), count: vi.fn() },
  report: { findMany: vi.fn() },
  channel: { count: vi.fn() },
  episodeComment: { findMany: vi.fn() },
}));

const deps = vi.hoisted(() => ({
  findOrphans: vi.fn(),
  countWaitlist: vi.fn(),
  listWaitlist: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/media-cleanup", () => ({
  findOrphans: deps.findOrphans,
}));
vi.mock("@/features/waitlist/queries", () => ({
  countWaitlist: deps.countWaitlist,
  listWaitlist: deps.listWaitlist,
}));

import { getAdminDashboard } from "./queries";

describe("admin queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compone usuarios, episodios, reportes y listas resueltas", async () => {
    const users = [{ id: "u1", name: "Ana" }];
    const episodes = [{ id: "e2", title: "Reciente" }];
    const reports = [
      { targetType: "episode", targetId: "e1", reporterId: "u1" },
      { targetType: "comment", targetId: "c1", reporterId: "u1" },
      { targetType: "episode", targetId: "e2", reporterId: null },
    ];

    db.user.findMany
      .mockResolvedValueOnce(users)
      .mockResolvedValueOnce([{ id: "u1", name: "Ana" }]);
    db.episode.findMany.mockResolvedValueOnce(episodes).mockResolvedValueOnce([
      { id: "e1", title: "Reportado", slug: "reportado" },
      { id: "e2", title: "Reciente", slug: "reciente" },
    ]);
    db.report.findMany.mockResolvedValueOnce(reports);
    db.channel.count.mockResolvedValueOnce(4);
    db.episode.count.mockResolvedValueOnce(12);
    db.episodeComment.findMany.mockResolvedValueOnce([
      { id: "c1", body: "Comentario" },
    ]);
    deps.findOrphans.mockResolvedValueOnce(["huérfano"]);
    deps.countWaitlist.mockResolvedValueOnce(3);
    deps.listWaitlist.mockResolvedValueOnce([{ email: "a@example.com" }]);

    const data = await getAdminDashboard();

    expect(data.users).toBe(users);
    expect(data.episodes).toBe(episodes);
    expect(data.reports).toBe(reports);
    expect(data.channels).toBe(4);
    expect(data.publishedCount).toBe(12);
    expect(data.orphans).toEqual(["huérfano"]);
    expect(data.waiting).toBe(3);
    expect(data.waitlist).toEqual([{ email: "a@example.com" }]);

    expect([...data.reportedEpisodes.keys()]).toEqual(["e1", "e2"]);
    expect([...data.reportedComments.keys()]).toEqual(["c1"]);
    expect(data.reporters.get("u1")).toBe("Ana");

    expect(db.episode.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: { in: ["e1", "e2"] } } }),
    );
    expect(db.episodeComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["c1"] } } }),
    );
    expect(db.user.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: { in: ["u1"] } } }),
    );
  });
});
