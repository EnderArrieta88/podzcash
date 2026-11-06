import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { take } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Registra una reproducción. Es un contador agregado y sin cookies: el cliente
 * evita duplicados por sesión y aquí se limita el abuso por IP.
 */
export async function POST(request: Request) {
  let payload: { id?: unknown };

  try {
    payload = (await request.json()) as { id?: unknown };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";

  if (!id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!take(`play:${ip}`, 120, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }

  const result = await prisma.episode.updateMany({
    where: { id, status: "published" },
    data: { playCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: result.count > 0 });
}
