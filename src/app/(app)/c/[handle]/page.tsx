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
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";
import { EpisodeRow } from "@/components/content/episode-row";
import { formatDate } from "@/lib/format";

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
        select: {
          id: true,
          slug: true,
          title: true,
          kind: true,
          durationSec: true,
          publishedAt: true,
          createdAt: true,
          coverKey: true,
          audioPath: true,
          channel: {
            select: { handle: true, displayName: true, avatarKey: true },
          },
        },
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
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative h-40 sm:h-52">
          {channel.bannerKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storage.url(channel.bannerKey)}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-[radial-gradient(120%_120%_at_20%_0%,rgba(244,183,40,0.28),rgba(16,185,129,0.08)_45%,transparent_75%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        </div>

        <div className="px-5 pb-6 sm:px-7">
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

            <div className="flex flex-wrap items-center gap-2">
              {isOwner ? (
                <Link
                  href="/estudio/canal"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-sm transition-colors hover:bg-surface-3"
                >
                  <PencilLine size={15} />
                  Editar canal
                </Link>
              ) : (
                channel.zcashAddress && (
                  <Link
                    href={`/c/${channel.handle}/donar`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
                  >
                    <ShieldCheck size={15} />
                    Apoyar con ZEC
                  </Link>
                )
              )}
            </div>
          </div>

          <h1 className="mt-5 font-display text-5xl leading-none tracking-tight">
            {channel.displayName}
          </h1>

          <p className="mt-2 font-mono text-xs text-subtle">
            @{channel.handle} · desde {formatDate(channel.createdAt)}
          </p>

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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade-soft px-3 py-1 text-xs text-jade-bright">
                <span className="size-1.5 animate-pulse rounded-full bg-jade" />
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

            <a
              href={`/c/${channel.handle}/feed.xml`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-brand/40 hover:text-brand"
              title="Feed RSS del canal"
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
              Episodios
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
                Silencio en el estudio
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                {isOwner
                  ? "Tu canal está listo. Sube tu primer episodio desde el estudio."
                  : "Este canal está empezando. Vuelve pronto para escucharlo."}
              </p>
              {isOwner && (
                <Link
                  href="/estudio/episodios/nuevo"
                  className="mt-5 inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
                >
                  Subir episodio
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {channel.episodes.map((episode, index) => (
                <EpisodeRow key={episode.id} episode={episode} index={index} />
              ))}
            </ul>
          )}
        </section>

        <aside className="hidden space-y-4 xl:block">
          {channel.zcashAddress ? (
            <div className="rounded-xl border border-jade/25 bg-jade-soft p-4">
              <ShieldCheck size={18} className="text-jade-bright" />
              <p className="mt-2 font-heading text-sm font-semibold text-jade-bright">
                Apoyá este canal
              </p>
              <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
                ZEC directo a la wallet del creador, sin intermediarios.
              </p>
              <Link
                href={`/c/${channel.handle}/donar`}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
              >
                Enviar ZEC
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="font-heading text-sm font-semibold">
                Donaciones
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Este canal todavía no configuró una dirección Zcash.
              </p>
            </div>
          )}

          {links.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                Enlaces
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

