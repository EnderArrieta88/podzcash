import { NextResponse, type NextRequest } from "next/server";
import { cspMode, cspPolicy, randomNonce } from "@/lib/csp";

/**
 * Cabeceras de seguridad por request.
 *
 * - CSP global con nonce para los scripts inline de Next.
 * - `/embed` permite que terceros lo inserten; el resto no.
 * - El nonce viaja también en la cabecera de la request para que Next lo
 *   aplique a sus scripts. La respuesta puede ser `Report-Only` sin desactivar
 *   el nonce.
 */
export function proxy(request: NextRequest) {
  const nonce = randomNonce();
  const embed = request.nextUrl.pathname.startsWith("/embed");
  const secure =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.nextUrl.protocol === "https:";
  const policy = cspPolicy({
    nonce,
    embed,
    https: secure,
    mode: cspMode(process.env.CSP_MODE),
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy.value);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set(policy.name, policy.value);

  if (!embed) {
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media|api|favicon.ico).*)"],
};
