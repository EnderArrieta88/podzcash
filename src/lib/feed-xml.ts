import "server-only";
import {
  cdata,
  escapeXml,
  itunesDuration,
  podcastGuid,
  rfc822,
} from "@/lib/rss";
import { channelPath, donatePath, feedPath } from "@/lib/routes";
import { contentTypeFor } from "@/lib/media-types";
import { storage } from "@/lib/storage";

export type FeedChannel = {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarKey: string | null;
  zcashAddress: string | null;
  feedLanguage: string;
  feedCategory: string;
  feedExplicit: boolean;
  ownerEmail: string | null;
  block: boolean;
  newFeedUrl: string | null;
  createdAt: Date;
};

export type FeedEpisode = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioPath: string;
  coverKey: string | null;
  durationSec: number | null;
  fileSize: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  season: number | null;
  episodeNumber: number | null;
  episodeType: string;
  explicit: boolean | null;
  tags: Array<{ tag: { name: string } }>;
};

export function buildChannelFeed({
  channel,
  episodes,
  origin,
  ownerFallback,
}: {
  channel: FeedChannel;
  episodes: FeedEpisode[];
  origin: string;
  ownerFallback: string;
}): string {
  const channelUrl = `${origin}${channelPath(channel.handle)}`;
  const feedUrl = `${origin}${feedPath(channel.handle)}`;
  const fundingUrl = channel.zcashAddress
    ? `${origin}${donatePath(channel.handle)}`
    : null;
  const ownerEmail = channel.ownerEmail?.trim() || ownerFallback;
  const description =
    channel.bio ?? `Podcasts y música de ${channel.displayName} en PodZcash.`;

  const latestCover = [...episodes]
    .reverse()
    .find((episode) => episode.coverKey)?.coverKey;
  const imageKey = latestCover ?? channel.avatarKey;
  const imageUrl = imageKey ? `${origin}${storage.url(imageKey)}` : null;

  const items = episodes
    .map((episode, index) => {
      const url = `${channelUrl}/${episode.slug}`;
      const cover = episode.coverKey
        ? `${origin}${storage.url(episode.coverKey)}`
        : null;
      const audio = `${origin}${storage.url(episode.audioPath)}`;
      const published = episode.publishedAt ?? episode.createdAt;
      const episodeNumber = episode.episodeNumber ?? index + 1;
      const explicit = episode.explicit ?? channel.feedExplicit;

      const categories = episode.tags
        .map(({ tag }) => `      <category>${escapeXml(tag.name)}</category>`)
        .join("\n");

      const seasonTag =
        episode.season != null
          ? `      <itunes:season>${episode.season}</itunes:season>\n`
          : "";

      return `    <item>
      <title>${escapeXml(episode.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${escapeXml(episode.id)}</guid>
      <pubDate>${rfc822(published)}</pubDate>
      <description>${escapeXml(episode.description ?? "")}</description>
      <content:encoded>${cdata(episode.description ?? "")}</content:encoded>
      <enclosure url="${escapeXml(audio)}" length="${episode.fileSize ?? 0}" type="${escapeXml(contentTypeFor(episode.audioPath))}"/>
      <itunes:duration>${itunesDuration(episode.durationSec)}</itunes:duration>
${seasonTag}      <itunes:episode>${episodeNumber}</itunes:episode>
      <itunes:episodeType>${escapeXml(episode.episodeType)}</itunes:episodeType>
      <itunes:explicit>${explicit ? "true" : "false"}</itunes:explicit>
${cover ? `      <itunes:image href="${escapeXml(cover)}"/>\n` : ""}${categories}
    </item>`;
    })
    .join("\n");

  const lastBuild = episodes.length
    ? rfc822(
        episodes[episodes.length - 1].publishedAt ??
          episodes[episodes.length - 1].createdAt,
      )
    : rfc822(channel.createdAt);

  return `<?xml version="1.0" encoding="UTF-8"?>
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
    <language>${escapeXml(channel.feedLanguage)}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>PodZcash</generator>
    <itunes:author>${escapeXml(channel.displayName)}</itunes:author>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>${channel.feedExplicit ? "true" : "false"}</itunes:explicit>
    <itunes:owner>
      <itunes:name>${escapeXml(channel.displayName)}</itunes:name>
      <itunes:email>${escapeXml(ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:category text="${escapeXml(channel.feedCategory)}"/>
${channel.block ? "    <itunes:block>yes</itunes:block>\n" : ""}${channel.newFeedUrl ? `    <itunes:new-feed-url>${escapeXml(channel.newFeedUrl)}</itunes:new-feed-url>\n` : ""}${imageUrl ? `    <itunes:image href="${escapeXml(imageUrl)}"/>\n    <image><url>${escapeXml(imageUrl)}</url><title>${escapeXml(channel.displayName)}</title><link>${escapeXml(channelUrl)}</link></image>\n` : ""}    <podcast:locked owner="${escapeXml(ownerEmail)}">no</podcast:locked>
    <podcast:guid>${podcastGuid(channel.id)}</podcast:guid>
${fundingUrl ? `    <podcast:funding url="${escapeXml(fundingUrl)}">Apoyar con ZEC</podcast:funding>\n` : ""}${items}
  </channel>
</rss>
`;
}
