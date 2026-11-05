import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Bundle autónomo para desplegar en hosting con Node (cPanel/Passenger).
  output: "standalone",
  // No revelar el framework en las respuestas.
  poweredByHeader: false,
  // better-sqlite3 es un módulo nativo: no debe pasar por el bundler.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Sin el indicador flotante de Next en desarrollo: estorba en las capturas.
  devIndicators: false,
  experimental: {
    // Los avatares viajan en Server Actions; el límite por defecto es 1 MB.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
