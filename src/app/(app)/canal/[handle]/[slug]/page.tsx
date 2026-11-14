import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Mic2, Radio, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate, formatDuration } from "@/lib/format";
import { PlayButton } from "@/components/player/play-button";
import { DownloadButton } from "@/components/player/download-button";
import { QueueButton } from "@/components/player/queue-button";
import { getLocale } from "@/lib/i18n/locale";
import { episodeContent } from "@/lib/i18n/episode";
import { offlineAudioContent } from "@/lib/i18n/offline-audio";
import { playerContent } from "@/lib/i18n/player";
import { sharedLabels } from "@/lib/i18n/shared";
import { channelPath, donatePath, episodePath, feedPath } from "@/lib/routes";
import { episodeEmbedCode } from "@/lib/embed";
import { EmbedCode } from "@/components/embed/embed-code";
import {
  absoluteUrl,
  isoDuration,
  jsonLd,
  SITE_URL,
  socialMetadata,
} from "@/lib/seo";
import { pageParam } from "@/lib/pagination";
import { listEpisodeComments } from "@/features/comments/queries";
import { EpisodeComments } from "@/features/comments/components/episode-comments";
import { getEpisodePageData } from "@/features/episodes/queries";

type PageProps = {
  params: Promise<{ handle: string; slug: string }>;
  searchParams: Promise<{ comentarios?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const locale = await getLocale();
  const content = episodeContent[locale];
  const data = await getEpisodePageData(handle, slug);

  if (!data) return { title: content.notFound };

  const { episode, channel } = data;

  const social = socialMetadata({
    title: `${episode.title} · ${channel.displayName}`,
    description: episode.description,
    path: episodePath(channel.handle, episode.slug),
    image: `${episodePath(channel.handle, episode.slug)}/og`,
    imageAlt: episode.title,
    locale,
    type: "article",
  });

  return {
    title: `${episode.title} · ${channel.displayName}`,
    description: episode.description ?? undefined,
    ...social,
    alternates: {
      ...social.alternates,
      types: {
        "application/rss+xml": absoluteUrl(feedPath(channel.handle)),
      },
    },
  };
}

export default async function EpisodePage({ params, searchParams }: PageProps) {
  const [{ handle, slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const content = episodeContent[locale];
  const download = offlineAudioContent[locale];
  const player = playerContent[locale];
  const kind = sharedLabels[locale];
  const data = await getEpisodePageData(handle, slug);

  if (!data) notFound();

  const { channel, episode, cover, audioUrl, ogImage } = data;

  const viewer = await getCurrentUser();
  const isOwner = viewer?.channel?.id === channel.id;

  if (episode.status !== "published" && !isOwner) notFound();

  const comments =
    episode.status === "published"
      ? await listEpisodeComments(episode.id, pageParam(query.comentarios))
      : null;

  const episodeLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.description ?? undefined,
    url: absoluteUrl(episodePath(channel.handle, episode.slug)),
    datePublished: (episode.publishedAt ?? episode.createdAt).toISOString(),
    duration: isoDuration(episode.durationSec),
    image: ogImage ? absoluteUrl(ogImage) : undefined,
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: absoluteUrl(audioUrl),
      encodingFormat: episode.mimeType ?? undefined,
      duration: isoDuration(episode.durationSec),
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: channel.displayName,
      url: absoluteUrl(channelPath(channel.handle)),
    },
  };

  const embed = episodeEmbedCode({
    origin: SITE_URL,
    id: episode.id,
    title: episode.title,
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(episodeLd)}
      />
      <Link
        href={channelPath(channel.handle)}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {channel.displayName}
      </Link>

      {episode.status !== "published" && (
        <p className="mt-5 rounded-xl border border-brand/30 bg-brand-soft px-4 py-2.5 text-sm text-brand">
          {content.draft}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="size-48 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:size-56">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <Mic2 size={32} />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
              <Radio size={13} />
              {episode.kind === "music" ? kind.musicTitle : kind.podcastTitle}
            </span>
            <span className="font-mono text-xs tabular text-subtle">
              {formatDuration(episode.durationSec)}
            </span>
            <span className="font-mono text-xs text-subtle">
              {formatDate(episode.publishedAt ?? episode.createdAt, locale)}
            </span>
          </div>

          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {episode.title}
          </h1>

          <p className="mt-3 text-sm text-muted">{channel.displayName}</p>

          <div className="mt-6">
            <PlayButton
              size="lg"
              label
              locale={locale}
              track={{
                id: episode.id,
                title: episode.title,
                channelName: channel.displayName,
                channelHandle: channel.handle,
                coverUrl: cover,
                src: audioUrl,
                durationSec: episode.durationSec,
              }}
            />
          </div>

          {episode.status === "published" && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QueueButton
                track={{
                  id: episode.id,
                  title: episode.title,
                  channelName: channel.displayName,
                  channelHandle: channel.handle,
                  coverUrl: cover,
                  src: audioUrl,
                  durationSec: episode.durationSec,
                }}
                labels={player}
              />
              <DownloadButton
                download={{
                  id: episode.id,
                  title: episode.title,
                  channelName: channel.displayName,
                  channelHandle: channel.handle,
                  coverUrl: cover,
                  src: audioUrl,
                  size: episode.fileSize ?? 0,
                }}
                labels={download}
              />
              <Link
                href="/descargas"
                className="text-xs text-subtle transition-colors hover:text-text"
              >
                {download.manage}
              </Link>
            </div>
          )}
        </div>
      </div>

      {episode.description && (
        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            {content.description}
          </h2>
          <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-muted">
            {episode.description}
          </p>
        </div>
      )}

      {episode.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {episode.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full border border-border px-3 py-1 text-xs text-subtle"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {episode.status === "published" && comments && (
        <EpisodeComments
          comments={comments.items}
          total={comments.total}
          page={comments.page}
          pageCount={comments.pageCount}
          episodePath={episodePath(channel.handle, episode.slug)}
          episodeChannelId={channel.id}
          viewerId={viewer?.id ?? null}
          viewerChannelId={viewer?.channel?.id ?? null}
          isAdmin={viewer?.role === "admin"}
          episodeId={episode.id}
          labels={content.comments}
          locale={locale}
        />
      )}

      <Link
        href={`/reportar/${episode.id}`}
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-subtle transition-colors hover:text-text"
      >
        <Flag size={12} />
        {content.report}
      </Link>

      {episode.status === "published" && (
        <div className="mt-6">
          <EmbedCode code={embed} labels={content.embed} />
        </div>
      )}

      {channel.zcashAddress && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-jade/25 bg-jade-soft p-5">
          {" "}
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-jade-bright" />
            <div>
              <p className="font-heading text-sm font-semibold text-jade-bright">
                {content.helpTitle}
              </p>
              <p className="mt-1 text-xs text-jade-bright/70">
                {content.helpBody(channel.displayName)}
              </p>
            </div>
          </div>
          <Link
            href={donatePath(channel.handle)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {content.support}
          </Link>
        </div>
      )}
    </div>
  );
}
