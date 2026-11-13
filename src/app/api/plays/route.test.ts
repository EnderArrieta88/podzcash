import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  episode: { findFirst: vi.fn(), updateMany: vi.fn() },
}));
const analytics = vi.hoisted(() => ({ recordListenStart: vi.fn() }));
const rate = vi.hoisted(() => ({ take: vi.fn() }));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "user-agent": "TestAgent/1.0",
    }),
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/features/analytics", () => ({
  recordListenStart: analytics.recordListenStart,
}));
vi.mock("@/lib/rate-limit", () => ({ take: rate.take }));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/plays", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/plays", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rate.take.mockReturnValue(true);
  });

  it("rechaza JSON inválido y cuerpos sin id", async () => {
    expect((await POST(request("{invalido"))).status).toBe(400);
    expect((await POST(request({}))).status).toBe(400);
    expect(db.episode.findFirst).not.toHaveBeenCalled();
  });

  it("responde ok sin tocar la base cuando hay rate limit", async () => {
    rate.take.mockReturnValueOnce(false);

    const response = await POST(request({ id: "e1" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(db.episode.findFirst).not.toHaveBeenCalled();
  });

  it("no cuenta episodios inexistentes o no publicados", async () => {
    db.episode.findFirst.mockResolvedValueOnce(null);

    const response = await POST(request({ id: "e1" }));

    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(db.episode.updateMany).not.toHaveBeenCalled();
  });

  it("incrementa y registra la escucha cuando el episodio está publicado", async () => {
    db.episode.findFirst.mockResolvedValueOnce({ channelId: "ch1" });
    db.episode.updateMany.mockResolvedValueOnce({ count: 1 });

    const response = await POST(request({ id: "e1" }));

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(db.episode.updateMany).toHaveBeenCalledWith({
      where: { id: "e1", status: "published" },
      data: { playCount: { increment: 1 } },
    });
    expect(analytics.recordListenStart).toHaveBeenCalledWith(
      expect.objectContaining({
        episodeId: "e1",
        channelId: "ch1",
        ip: "203.0.113.10",
      }),
    );
  });

  it("no registra analítica si la actualización no afecta filas", async () => {
    db.episode.findFirst.mockResolvedValueOnce({ channelId: "ch1" });
    db.episode.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(request({ id: "e1" }));

    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(analytics.recordListenStart).not.toHaveBeenCalled();
  });
});
