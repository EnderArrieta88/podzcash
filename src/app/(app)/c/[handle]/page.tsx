import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Mic2,
  Music2,
  PencilLine,
  Radio,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDuration, relativeDate } from "@/lib/format";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { PlayButton } from "@/components/player/play-button";

type PageProps = { params: Promise<{ handle: string }> };

async function loadChannel(handle: string) {
  return prisma.channel.findUnique({
    where: { handle: handle.toLowerCase() },
    include: {
      _count: {
        select: { episodes: { where: { status: "published" } } },
      },
      episodes: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 24,
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const channel = await loadChannel(handle);

  if (!channel) return { title: "Canal no encontrado" };

  return {
    title: channel.displayName,
    description:
      channel.bio ??
      `Escucha a ${channel.displayName} en PodZcash. Podcasts y música del ecosistema Zcash.`,
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { handle } = await params;
  const channel = await loadChannel(handle);

  if (!channel) notFound();

  const links = parseLinks(channel.links);
  const viewer = await getCurrentUser();
  const isOwner = viewer?.channel?.id === channel.id;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="relative h-36 sm:h-48">
          {channel.bannerKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storage.url(channel.bannerKey)}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-brand/25 via-brand-soft/60 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        </div>

        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            {channel.avatarKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storage.url(channel.avatarKey)}
                alt={`Avatar de ${channel.displayName}`}
                className="size-24 rounded-full border-4 border-surface object-cover"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-full border-4 border-surface bg-brand-soft font-display text-3xl text-brand">
                {channel.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}

            {isOwner && (
              <Link
                href="/estudio/canal"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-border"
              >
                <PencilLine size={14} />
                Editar canal
              </Link>
            )}

            {channel.zcashAddress && !isOwner && (
              <Link
                href={`/c/${channel.handle}/donar`}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-[#17130a] text-[9px] font-bold text-brand">
                  Z
                </span>
                Apoyar con ZEC
              </Link>
            )}
          </div>

          <h1 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
            {channel.displayName}
          </h1>
          <p className="mt-1 font-mono text-sm text-subtle">/c/{channel.handle}</p>

          {channel.bio && (
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted">
              {channel.bio}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
              <Radio size={13} />
              {channel._count.episodes === 1
                ? "1 episodio"
                : `${channel._count.episodes} episodios`}
            </span>

            {channel.zcashAddress && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/35 bg-brand-soft/50 px-3 py-1 text-xs text-brand">
                Acepta ZEC
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
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Episodios</h2>

        {channel.episodes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
              <Mic2 size={20} />
            </span>
            <p className="mt-4 text-sm font-medium">Todavía no hay episodios</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              {isOwner
                ? "Tu canal está listo. Sube tu primer episodio desde el estudio."
                : "Este canal está empezando. Vuelve pronto para escucharlo."}
            </p>
            {isOwner && (
              <Link
                href="/estudio/episodios/nuevo"
                className="mt-5 inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
              >
                Subir episodio
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {channel.episodes.map((episode) => {
              const cover = episode.coverKey
                ? storage.url(episode.coverKey)
                : null;

              return (
                <li
                  key={episode.id}
                  className="group flex items-center gap-2 pr-4 transition-colors hover:bg-surface-2"
                >
                  <Link
                    href={`/c/${channel.handle}/${episode.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-4 p-4"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-subtle">
                          <Music2 size={18} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-xl">
                        {episode.title}
                      </p>
                      <p className="mt-1 font-mono text-xs tabular text-subtle">
                        {episode.kind === "music" ? "Música" : "Podcast"} ·{" "}
                        {formatDuration(episode.durationSec)} ·{" "}
                        {relativeDate(episode.publishedAt ?? episode.createdAt)}
                      </p>
                    </div>
                  </Link>

                  <PlayButton
                    track={{
                      id: episode.id,
                      title: episode.title,
                      channelName: channel.displayName,
                      channelHandle: channel.handle,
                      coverUrl: cover,
                      src: storage.url(episode.audioPath),
                      durationSec: episode.durationSec,
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

