import type { MetadataRoute } from "next";

function baseUrl(): string {
  return (process.env.SITE_URL ?? "https://podzcash.online").replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/estudio",
          "/api/",
          "/entrar",
          "/registro",
          "/verificar",
          "/recuperar",
          "/restablecer",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
