import "server-only";
import { createHash } from "node:crypto";

const PODCAST_NAMESPACE = "2f8c1f0e-6b3a-4d9c-8e7f-1a2b3c4d5e6f";

export function podcastGuid(seed: string): string {
  const namespace = Buffer.from(PODCAST_NAMESPACE.replaceAll("-", ""), "hex");
  const hash = createHash("sha1").update(namespace).update(seed).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export function cdata(value: string): string {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export function rfc822(date: Date): string {
  return date.toUTCString();
}

export function itunesDuration(seconds: number | null | undefined): string {
  const total = Math.max(0, Math.round(seconds ?? 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;

  return [hours, minutes, rest]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

/**
 * Base pública del sitio. Se puede fijar con SITE_URL; si no, se deriva de la
 * petición. Detrás de Passenger el `request.url` puede apuntar al host interno
 * (0.0.0.0:3000), así que se prefieren las cabeceras del proxy.
 */
export function siteOrigin(request: Request): string {
  const configured = process.env.SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  const isInternal =
    !host ||
    host.startsWith("0.0.0.0") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost");

  if (isInternal) return url.origin;

  return `${proto === "http" ? "http" : "https"}://${host}`;
}
