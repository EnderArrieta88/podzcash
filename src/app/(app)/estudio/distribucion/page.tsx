import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Rss } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { CopyButton } from "@/components/ui/copy-button";
import { getLocale } from "@/lib/i18n/locale";
import { studioDistributionContent } from "@/lib/i18n/studio-distribution";
import { feedPath } from "@/lib/routes";
import { escapeXml } from "@/lib/rss";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioDistributionContent[locale].metaTitle };
}

const SITE = (process.env.SITE_URL ?? "https://podzcash.online").replace(
  /\/+$/,
  "",
);

export default async function DistributionPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioDistributionContent[locale];

  if (!user.channel) redirect("/estudio/canal");

  const channel = user.channel;
  const feedUrl = `${SITE}${feedPath(channel.handle)}`;

  const latest = await prisma.episode.findFirst({
    where: { channelId: channel.id, status: "published" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
  });

  const embedCode = latest
    ? `<iframe src="${SITE}/embed/${latest.id}" width="100%" height="190" style="border:0;border-radius:12px" loading="lazy" title="${escapeXml(latest.title)}"></iframe>`
    : "";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{content.intro}</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2">
          <Rss size={16} className="text-brand" />
          <h2 className="font-heading text-sm font-semibold">
            {content.feedTitle}
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted">{content.feedHint}</p>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-text">
            {feedUrl}
          </code>
          <CopyButton
            value={feedUrl}
            copyLabel={content.copy}
            copiedLabel={content.copied}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://podcastsconnect.apple.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 text-sm transition-colors hover:bg-surface-3"
          >
            Apple Podcasts Connect
            <ExternalLink size={13} />
          </a>
          <a
            href="https://creators.spotify.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 text-sm transition-colors hover:bg-surface-3"
          >
            Spotify for Creators
            <ExternalLink size={13} />
          </a>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {content.howTo}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          {content.embedTitle}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {content.embedHint}{" "}
          {latest ? (
            <>
              {content.latestPrefix}{" "}
              <span className="text-text">{latest.title}</span>.
            </>
          ) : (
            <>{content.noEpisode}</>
          )}
        </p>

        {latest ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-text">
              {embedCode}
            </code>
            <CopyButton
              value={embedCode}
              copyLabel={content.copy}
              copiedLabel={content.copied}
            />
          </div>
        ) : (
          <Link
            href="/estudio/episodios/nuevo"
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a]"
          >
            {content.upload}
          </Link>
        )}
      </section>

      <section className="rounded-xl border border-jade/25 bg-jade-soft p-5">
        <p className="font-heading text-sm font-semibold text-jade-bright">
          {content.donationsTitle}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
          {content.donationsBody}
        </p>
      </section>
    </div>
  );
}
