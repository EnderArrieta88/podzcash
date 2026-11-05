import { NextResponse, type NextRequest } from "next/server";

/**
 * Los embeds deben poder insertarse en webs de terceros; el resto de la app
 * no. X-Frame-Options se aplica solo fuera de /embed.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/embed")) {
    response.headers.set("Content-Security-Policy", "frame-ancestors *");
  } else {
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media|api|favicon.ico).*)"],
};
