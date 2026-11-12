import { NextResponse } from "next/server";
import { getDatabaseCounts } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { channels, episodes } = await getDatabaseCounts();

    return NextResponse.json({
      ok: true,
      database: "sqlite",
      // Marcador para verificar qué build está sirviendo el servidor.
      build: "2026-11-05-b",
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
