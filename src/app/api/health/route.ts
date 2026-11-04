import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [channels, episodes] = await Promise.all([
      prisma.channel.count(),
      prisma.episode.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: "sqlite",
      channels,
      episodes,
    });
  } catch (error) {
    console.error("Health check falló:", error);
    return NextResponse.json(
      { ok: false, error: "database_unavailable" },
      { status: 500 },
    );
  }
}
