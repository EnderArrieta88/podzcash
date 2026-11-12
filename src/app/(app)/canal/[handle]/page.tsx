import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Mic2,
  PencilLine,
  Radio,
  Rss,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { channelPath, donatePath, feedPath } from "@/lib/routes";
import { EpisodeRow } from "@/components/content/episode-row";
import { formatDate } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { channelContent } from "@/lib/i18n/channel";
import { absoluteUrl, jsonLd, socialMetadata } from "@/lib/seo";
import { getChannelPageData } from "@/features/channels/queries";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const locale = await getLocale();
  const content = channelContent[locale];
  const data = await getChannelPageData(handle);

  if (!data) return { title: content.notFound };

  const { channel, image } = data;
  const description =
    channel.bio ?? content.metaDescription(channel.displayName);

  const social = socialMetadata({
    title: channel.displayName,
    description,
    path: channelPath(channel.handle),
    image,
    imageAlt: channel.displayName,
    locale,
  });

  return {
    title: channel.displayName,
    description,
    ...social,
    alternates: {
      ...social.alternates,
      types: {
        "application/rss+xml": absoluteUrl(feedPath(channel.handle)),
      },
    },
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { handle } = await params;
  const locale = await getLocale();
  const content = channelContent[locale];
  const data = await getChannelPageData(handle);

  if (!data) notFound();

  const { channel, links, image, avatarUrl, bannerUrl } = data;
  const viewer = await getCurrentUser();
  const isOwner = viewer?.channel?.id === channel.id;

  const seriesLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: channel.displayName,
    description: channel.bio ?? undefined,
    url: absoluteUrl(channelPath(channel.handle)),
    webFeed: absoluteUrl(feedPath(channel.handle)),
    image: image ? absoluteUrl(image) : undefined,
    author: { "@type": "Person", name: channel.displayName },
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(seriesLd)}
      />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative h-40 sm:h-52">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-[radial-gradient(120%_120%_at_20%_0%,rgba(244,183,40,0.28),rgba(16,185,129,0.08)_45%,transparent_75%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={content.avatarAlt(channel.displayName)}
                className="relative z-10 size-24 rounded-full border-4 border-surface object-cover"
              />
            ) : (
              <span className="relative z-10 flex size-24 items-center justify-center rounded-full border-4 border-surface bg-brand-soft font-display text-3xl text-brand">
                {channel.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {isOwner ? (
                <Link
                  href="/estudio/canal"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-surface-3"
                >
                  <PencilLine size={15} />
                  {content.edit}
                </Link>
              ) : (
                channel.zcashAddress && (
                  <Link
                    href={donatePath(channel.handle)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
                  >
                    <ShieldCheck size={15} />
                    {content.support}
                  </Link>
                )
              )}
            </div>
          </div>

          <h1 className="mt-5 break-words font-display text-5xl leading-none tracking-tight">
            {channel.displayName}
          </h1>

          <p className="mt-2 font-mono text-xs text-subtle">
            @{channel.handle} · {content.since}{" "}
            {formatDate(channel.createdAt, locale)}
          </p>

          {channel.bio && (
            <p className="mt-4 max-w-2xl break-words text-pretty leading-relaxed text-muted">
              {channel.bio}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
              <Radio size={13} />
              {content.episodeLabel(channel._count.episodes)}
            </span>

            {channel.zcashAddress && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade-soft px-3 py-1 text-xs text-jade-bright">
                <span className="size-1.5 animate-pulse rounded-full bg-jade" />
                {content.acceptsZec}
              </span>
            )}

            {links.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-brand/40 hover:text-brand"
              >
                {link.label}
                <ArrowUpRight size={12} />
              </a>
            ))}

            <a
              href={feedPath(channel.handle)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-brand/40 hover:text-brand"
              title={content.rssTitle}
            >
              <Rss size={12} />
              RSS
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              {content.episodes}
            </h2>
            <span className="font-mono text-[11px] text-subtle">
              {channel._count.episodes}
            </span>
          </div>

          {channel.episodes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
                <Mic2 size={20} />
              </span>
              <p className="mt-4 font-heading text-sm font-semibold">
                {content.emptyTitle}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                {isOwner ? content.emptyOwner : content.emptyVisitor}
              </p>
              {isOwner && (
                <Link
                  href="/estudio/episodios/nuevo"
                  className="mt-5 inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
                >
                  {content.upload}
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {channel.episodes.map((episode, index) => (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  index={index}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </section>

        <aside className="hidden space-y-4 xl:block">
          {channel.zcashAddress ? (
            <div className="rounded-xl border border-jade/25 bg-jade-soft p-4">
              <ShieldCheck size={18} className="text-jade-bright" />
              <p className="mt-2 font-heading text-sm font-semibold text-jade-bright">
                {content.supportPanelTitle}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
                {content.supportPanelBody}
              </p>
              <Link
                href={donatePath(channel.handle)}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
              >
                {content.sendZec}
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="font-heading text-sm font-semibold">
                {content.donations}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {content.noAddress}
              </p>
            </div>
          )}

          {links.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                {content.links}
              </p>
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
                    >
                      {link.label}
                      <ArrowUpRight size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
