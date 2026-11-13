import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  invite: { findMany: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma: db }));

import { listAdminInvites } from "./queries";

describe("invites queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista las invitaciones del admin con el usuario que las usó", async () => {
    const invites = [
      {
        id: "i1",
        code: "ABCDE12345",
        usedBy: { name: "Ana", email: "ana@example.com" },
      },
    ];
    db.invite.findMany.mockResolvedValueOnce(invites);

    await expect(listAdminInvites("admin-1")).resolves.toBe(invites);
    expect(db.invite.findMany).toHaveBeenCalledWith({
      where: { createdById: "admin-1" },
      orderBy: { createdAt: "desc" },
      include: { usedBy: { select: { name: true, email: true } } },
    });
  });
});
