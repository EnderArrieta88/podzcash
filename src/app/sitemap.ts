import type { MetadataRoute } from "next";
import { listSitemapChannels } from "@/features/channels/queries";
import { listSitemapEpisodes } from "@/features/episodes/queries";

// El sitemap consulta la base en cada petición: en el build la base está vacía.
export const dynamic = "force-dynamic";

function baseUrl(): string {
  return (process.env.SITE_URL ?? "https://podzcash.online").replace(
    /\/+$/,
    "",
  );
}

const staticPaths: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/explorar", changeFrequency: "daily", priority: 0.9 },
  { path: "/proyecto", changeFrequency: "monthly", priority: 0.7 },
  { path: "/acerca", changeFrequency: "monthly", priority: 0.6 },
  { path: "/lista-de-espera", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const [channels, episodes] = await Promise.all([
    listSitemapChannels(),
    listSitemapEpisodes(),
  ]);

  return [
    ...staticPaths.map((entry) => ({
      url: `${base}${entry.path}`,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
    ...channels.map((channel) => ({
      url: `${base}/canal/@${channel.handle}`,
      lastModified: channel.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...episodes.map((episode) => ({
      url: `${base}/canal/@${episode.channel.handle}/${episode.slug}`,
      lastModified: episode.publishedAt ?? episode.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
