import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";

/**
 * Origen público para enlaces enviados por email.
 * SITE_URL manda en producción; en local se deriva de la petición.
 */
export async function getSiteOrigin(): Promise<string> {
  const configured = env.SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";

  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}
