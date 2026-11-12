import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { take } from "@/lib/rate-limit";
import { buildAccountExport } from "@/features/account/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const viewer = await getCurrentUser();

  if (!viewer) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  if (!take(`export-account:${viewer.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "rateLimited" },
      { status: 429, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const payload = await buildAccountExport(viewer.id, viewer.email);

  if (!payload) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `podzcash-cuenta-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
