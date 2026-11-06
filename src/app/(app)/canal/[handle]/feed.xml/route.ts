import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { contentTypeFor } from "@/lib/media-types";
import { cdata, escapeXml, itunesDuration, rfc822, siteOrigin } from "@/lib/rss";
import { channelPath, feedPath, normalizeHandleParam } from "@/lib/routes";

export const dynamic = "force-dynamic";

const OWNER_EMAIL = process.env.FEED_OWNER_EMAIL ?? "hola@podzcash.online";

type RouteContext = { params: Promise<{ handle: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { handle } = await context.params;

  const channel = await prisma.channel.findUnique({
    where: { handle: normalizeHandleParam(handle) },
    include: {
      episodes: {
        where: { status: "published" },
        orderBy: { publishedAt: "asc" },
        include: { tags: { include: { tag: true } } },
      },
    },
  });

  if (!channel) {
    return new Response("Canal no encontrado", { status: 404 });
  }

  const origin = siteOrigin(request);
  const channelUrl = `${origin}${channelPath(channel.handle)}`;
  const feedUrl = `${origin}${feedPath(channel.handle)}`;
  const description =
    channel.bio ?? `Podcasts y música de ${channel.displayName} en PodZcash.`;

  const latestCover = [...channel.episodes]
    .reverse()
    .find((episode) => episode.coverKey)?.coverKey;
  const imageKey = latestCover ?? channel.avatarKey;
  const imageUrl = imageKey ? `${origin}${storage.url(imageKey)}` : null;

  const items = channel.episodes
    .map((episode, index) => {
      const url = `${channelUrl}/${episode.slug}`;
      const cover = episode.coverKey ? `${origin}${storage.url(episode.coverKey)}` : null;
      const audio = `${origin}${storage.url(episode.audioPath)}`;
      const published = episode.publishedAt ?? episode.createdAt;

      const categories = episode.tags
        .map(({ tag }) => `      <category>${escapeXml(tag.name)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(episode.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${escapeXml(episode.id)}</guid>
      <pubDate>${rfc822(published)}</pubDate>
      <description>${escapeXml(episode.description ?? "")}</description>
      <content:encoded>${cdata(episode.description ?? "")}</content:encoded>
      <enclosure url="${escapeXml(audio)}" length="${episode.fileSize ?? 0}" type="${contentTypeFor(episode.audioPath)}"/>
      <itunes:duration>${itunesDuration(episode.durationSec)}</itunes:duration>
      <itunes:episode>${index + 1}</itunes:episode>
      <itunes:explicit>false</itunes:explicit>
${cover ? `      <itunes:image href="${escapeXml(cover)}"/>\n` : ""}${categories}
    </item>`;
    })
    .join("\n");

  const lastBuild = channel.episodes.length
    ? rfc822(
        channel.episodes[channel.episodes.length - 1].publishedAt ??
          channel.episodes[channel.episodes.length - 1].createdAt,
      )
    : rfc822(channel.createdAt);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:podcast="https://podcastindex.org/namespace/1.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.displayName)}</title>
    <link>${escapeXml(channelUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(description)}</description>
    <language>es</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>PodZcash</generator>
    <itunes:author>${escapeXml(channel.displayName)}</itunes:author>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:owner>
      <itunes:name>${escapeXml(channel.displayName)}</itunes:name>
      <itunes:email>${escapeXml(OWNER_EMAIL)}</itunes:email>
    </itunes:owner>
    <itunes:category text="Technology"/>
${imageUrl ? `    <itunes:image href="${escapeXml(imageUrl)}"/>\n    <image><url>${escapeXml(imageUrl)}</url><title>${escapeXml(channel.displayName)}</title><link>${escapeXml(channelUrl)}</link></image>\n` : ""}    <podcast:locked>no</podcast:locked>
    <podcast:guid>${escapeXml(channel.id)}</podcast:guid>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
