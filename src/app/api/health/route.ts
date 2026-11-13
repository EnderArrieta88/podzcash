import { NextResponse } from "next/server";
import { getDatabaseCounts } from "@/lib/health";
import { APP_COMMIT, APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { channels, episodes } = await getDatabaseCounts();

    return NextResponse.json({
      ok: true,
      database: "sqlite",
      // release-please actualiza la versión; el commit se inyecta al compilar.
      version: APP_VERSION,
      commit: APP_COMMIT,
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
