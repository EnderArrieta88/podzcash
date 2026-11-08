import Link from "next/link";
import { ArrowUpRight, Mic2, Radio } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { ButtonLink } from "@/components/ui/button-link";
import { getLocale } from "@/lib/i18n/locale";
import { studioShellContent } from "@/lib/i18n/studio-shell";
import { channelPath } from "@/lib/routes";

export default async function StudioPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioShellContent[locale].dashboard;

  if (!user.channel) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
          {content.step}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          {content.createTitle}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          {content.createBody}
        </p>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          {content.bullets.map((bullet, index) => (
            <li className="flex gap-2.5" key={bullet}>
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              {index === 0 ? (
                <span>
                  {bullet} <code className="text-text">{content.bulletCode}</code>
                </span>
              ) : (
                bullet
              )}
            </li>
          ))}
        </ul>

        <ButtonLink href="/estudio/canal" className="mt-7">
          {content.createCta}
        </ButtonLink>
      </div>
    );
  }

  const channel = user.channel;
  const [episodes, playSum] = await Promise.all([
    prisma.episode.count({ where: { channelId: channel.id } }),
    prisma.episode.aggregate({
      where: { channelId: channel.id },
      _sum: { playCount: true },
    }),
  ]);
  const plays = playSum._sum.playCount ?? 0;
  const links = parseLinks(channel.links);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {channel.avatarKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storage.url(channel.avatarKey)}
              alt=""
              className="size-20 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-2xl text-brand">
              {channel.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="break-words font-display text-2xl tracking-tight sm:text-3xl">
              {channel.displayName}
            </h1>
            <p className="mt-1 break-all font-mono text-xs text-subtle sm:text-sm">
              {channelPath(channel.handle)}
            </p>
            <p className="mt-3 max-w-xl break-words text-sm text-muted">
              {channel.bio ?? content.noBio}
            </p>

            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-text"
                  >
                    {link.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            {content.episodes}
          </p>
          <p className="mt-2 font-display text-3xl">{episodes}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            {content.plays}
          </p>
          <p className="mt-2 font-display text-3xl">{plays}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            {content.status}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-success" />
            {content.active}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand/25 bg-brand-soft/40 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Mic2 size={17} />
          </span>
          <div>
            <p className="text-sm font-medium">{content.nextTitle}</p>
            <p className="mt-1 text-sm text-muted">{content.nextBody}</p>
          </div>
        </div>
        <Link
          href="/estudio/canal"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm transition-colors hover:bg-surface-2"
        >
          <Radio size={14} />
          {content.edit}
        </Link>
      </div>
    </div>
  );
}

