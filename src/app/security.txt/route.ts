import { NextResponse } from "next/server";

// Se sirve desde una ruta y no desde /public porque el hosting no publica
// directorios que empiezan con punto.
const BODY = `Contact: mailto:hola@podzcash.online
Expires: 2027-11-05T00:00:00.000Z
Preferred-Languages: es, en
Canonical: https://podzcash.online/.well-known/security.txt
Policy: https://github.com/EnderArrieta88/podzcash/blob/main/SECURITY.md
`;

export function GET() {
  return new NextResponse(BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
