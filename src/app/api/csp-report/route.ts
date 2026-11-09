import { NextResponse } from "next/server";
import { take } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 20_000;

function safeUri(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 300);
  } catch {
    return null;
  }
}

type Violation = {
  directive?: unknown;
  "violated-directive"?: unknown;
  "blocked-uri"?: unknown;
  "document-uri"?: unknown;
  "source-file"?: unknown;
};

function reportViolation(violation: Violation): void {
  console.warn(
    "[csp]",
    JSON.stringify({
      directive: violation["violated-directive"] ?? violation.directive ?? null,
      blocked: safeUri(violation["blocked-uri"]),
      document: safeUri(violation["document-uri"]),
      source: safeUri(violation["source-file"]),
    }),
  );
}

/**
 * Recibe reportes `report-uri` (application/csp-report) y `Report-To`
 * (application/reports+json). No guarda IPs ni cuerpos completos: solo la
 * directiva y rutas, para detectar qué rompe la política.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  // Un sitio malicioso podría inundar el endpoint; se corta en silencio.
  if (!take(`csp-report:${ip}`, 120, 60 * 60 * 1000)) {
    return new NextResponse(null, { status: 204 });
  }

  let raw = "";

  try {
    raw = (await request.text()).slice(0, MAX_BODY);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!raw) return new NextResponse(null, { status: 204 });

  try {
    const payload: unknown = JSON.parse(raw);

    if (
      payload &&
      typeof payload === "object" &&
      "csp-report" in payload &&
      payload["csp-report"] &&
      typeof payload["csp-report"] === "object"
    ) {
      reportViolation(payload["csp-report"] as Violation);
    } else if (Array.isArray(payload)) {
      for (const entry of payload.slice(0, 5)) {
        if (
          entry &&
          typeof entry === "object" &&
          "body" in entry &&
          entry.body &&
          typeof entry.body === "object"
        ) {
          reportViolation(entry.body as Violation);
        }
      }
    }
  } catch {
    // Un reporte malformado no debe romper nada.
  }

  return new NextResponse(null, { status: 204 });
}
