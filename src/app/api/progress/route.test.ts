import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  episode: { findUnique: vi.fn() },
  playbackProgress: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
const auth = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const rate = vi.hoisted(() => ({ take: vi.fn() }));

vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: auth.getCurrentUser,
}));
vi.mock("@/lib/rate-limit", () => ({ take: rate.take }));

import { clampProgress } from "@/lib/playback-progress";
import { DELETE, GET, PUT } from "./route";

function getRequest(episodeId?: string) {
  const url = new URL("http://localhost/api/progress");
  if (episodeId) url.searchParams.set("episodeId", episodeId);
  return new Request(url);
}

function putRequest(body: unknown) {
  return new Request("http://localhost/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("/api/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getCurrentUser.mockResolvedValue({ id: "u1" });
    rate.take.mockReturnValue(true);
  });

  it("exige sesión", async () => {
    auth.getCurrentUser.mockResolvedValue(null);
    expect((await GET(getRequest("e1"))).status).toBe(401);
    expect((await PUT(putRequest({}))).status).toBe(401);
    expect((await DELETE()).status).toBe(401);
  });

  it("valida el episodio en GET y devuelve el progreso", async () => {
    expect((await GET(getRequest())).status).toBe(400);

    db.playbackProgress.findUnique.mockResolvedValueOnce(null);
    const empty = await GET(getRequest("e1"));
    await expect(empty.json()).resolves.toBeNull();

    db.playbackProgress.findUnique.mockResolvedValueOnce({
      positionSec: 42,
      durationSec: 120,
      updatedAt: new Date("2026-11-13T10:00:00Z"),
    });
    const response = await GET(getRequest("e1"));
    await expect(response.json()).resolves.toEqual({
      positionSec: 42,
      durationSec: 120,
      updatedAt: "2026-11-13T10:00:00.000Z",
    });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("valida el cuerpo y el rate limit en PUT", async () => {
    expect((await PUT(putRequest("{invalido"))).status).toBe(400);
    expect(
      (
        await PUT(
          putRequest({ episodeId: "e1", positionSec: -1, durationSec: 100 }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await PUT(
          putRequest({ episodeId: "e1", positionSec: 10, durationSec: 999999 }),
        )
      ).status,
    ).toBe(400);

    rate.take.mockReturnValueOnce(false);
    expect(
      (
        await PUT(
          putRequest({ episodeId: "e1", positionSec: 10, durationSec: 100 }),
        )
      ).status,
    ).toBe(429);
  });

  it("devuelve 404 si el episodio no existe", async () => {
    db.episode.findUnique.mockResolvedValueOnce(null);
    rate.take.mockReturnValueOnce(true);

    const response = await PUT(
      putRequest({ episodeId: "e1", positionSec: 10, durationSec: 100 }),
    );

    expect(response.status).toBe(404);
    expect(db.playbackProgress.upsert).not.toHaveBeenCalled();
  });

  it("guarda la posición ajustada a la duración", async () => {
    db.episode.findUnique.mockResolvedValueOnce({ id: "e1" });
    db.playbackProgress.upsert.mockResolvedValueOnce({
      updatedAt: new Date("2026-11-13T10:00:00Z"),
    });

    const response = await PUT(
      putRequest({ episodeId: "e1", positionSec: 90, durationSec: 100 }),
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
      updatedAt: "2026-11-13T10:00:00.000Z",
    });
    expect(db.playbackProgress.upsert).toHaveBeenCalledWith({
      where: { userId_episodeId: { userId: "u1", episodeId: "e1" } },
      update: {
        positionSec: clampProgress(90, 100),
        durationSec: 100,
      },
      create: {
        userId: "u1",
        episodeId: "e1",
        positionSec: clampProgress(90, 100),
        durationSec: 100,
      },
      select: { updatedAt: true },
    });
  });

  it("borra todo el historial", async () => {
    db.playbackProgress.deleteMany.mockResolvedValueOnce({ count: 5 });

    const response = await DELETE();

    await expect(response.json()).resolves.toEqual({ ok: true, deleted: 5 });
  });
});
