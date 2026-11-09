export type CspMode = "report-only" | "enforce";

export type CspOptions = {
  nonce: string;
  embed: boolean;
  mode: CspMode;
  /** Solo en HTTPS: en local/HTTP rompería los assets. */
  https?: boolean;
  reportUri?: string;
};

/**
 * Política CSP de la app.
 *
 * `style-src 'unsafe-inline'` es deliberado: React usa atributos `style` en
 * barras de progreso, QR y portadas, y `style-src` también los cubre. Los
 * scripts no usan `unsafe-inline`: van con nonce y `strict-dynamic`.
 */
export function cspPolicy({
  nonce,
  embed,
  mode,
  https = true,
  reportUri = "/api/csp-report",
}: CspOptions): { name: string; value: string } {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    `frame-ancestors ${embed ? "*" : "'none'"}`,
    ...(https ? ["upgrade-insecure-requests"] : []),
    `report-uri ${reportUri}`,
  ];

  return {
    name:
      mode === "report-only"
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy",
    value: directives.join("; "),
  };
}

export function cspMode(value: string | undefined): CspMode {
  return value === "report-only" ? "report-only" : "enforce";
}

export function randomNonce(): string {
  return crypto.randomUUID().replaceAll("-", "");
}
