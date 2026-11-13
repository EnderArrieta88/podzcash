import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  episode: { findFirst: vi.fn() },
}));
const analytics = vi.hoisted(() => ({ recordProgress: vi.fn() }));
const rate = vi.hoisted(() => ({ take: vi.fn() }));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-forwarded-for": "198.51.100.7",
      "user-agent": "TestAgent/1.0",
    }),
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/features/analytics", () => ({
  recordProgress: analytics.recordProgress,
}));
vi.mock("@/lib/rate-limit", () => ({ take: rate.take }));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/analytics/progress", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/analytics/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rate.take.mockReturnValue(true);
  });

  it("rechaza cuerpos inválidos", async () => {
    expect((await POST(request("{invalido"))).status).toBe(400);
    expect((await POST(request({ id: "e1", position: 0 }))).status).toBe(400);
    expect(
      (await POST(request({ id: "e1", position: 1, duration: 0 }))).status,
    ).toBe(400);
    expect(db.episode.findFirst).not.toHaveBeenCalled();
  });

  it("responde ok sin registrar cuando hay rate limit", async () => {
    rate.take.mockReturnValueOnce(false);

    const response = await POST(
      request({ id: "e1", position: 10, duration: 100 }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(analytics.recordProgress).not.toHaveBeenCalled();
  });

  it("devuelve 404 para episodios no publicados", async () => {
    db.episode.findFirst.mockResolvedValueOnce(null);

    const response = await POST(
      request({ id: "e1", position: 10, duration: 100 }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });

  it("registra el porcentaje y el contexto del cliente", async () => {
    db.episode.findFirst.mockResolvedValueOnce({ channelId: "ch1" });

    const response = await POST(
      request({ id: "e1", position: 25, duration: 100 }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(analytics.recordProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        episodeId: "e1",
        channelId: "ch1",
        percent: 25,
        ip: "198.51.100.7",
      }),
    );
  });
});
