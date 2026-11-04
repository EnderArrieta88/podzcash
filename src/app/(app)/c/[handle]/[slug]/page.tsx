import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mic2, Radio, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate, formatDuration } from "@/lib/format";
import { storage } from "@/lib/storage";
import { PlayButton } from "@/components/player/play-button";

type PageProps = { params: Promise<{ handle: string; slug: string }> };

async function load(handle: string, slug: string) {
  const channel = await prisma.channel.findUnique({
    where: { handle: handle.toLowerCase() },
    select: {
      id: true,
      handle: true,
      displayName: true,
      avatarKey: true,
      zcashAddress: true,
    },
  });

  if (!channel) return null;

  const episode = await prisma.episode.findUnique({
    where: { channelId_slug: { channelId: channel.id, slug } },
    include: { tags: { include: { tag: true } } },
  });

  if (!episode) return null;

  return { channel, episode };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const data = await load(handle, slug);

  if (!data) return { title: "Episodio no encontrado" };

  return {
    title: `${data.episode.title} · ${data.channel.displayName}`,
    description: data.episode.description ?? undefined,
  };
}

export default async function EpisodePage({ params }: PageProps) {
  const { handle, slug } = await params;
  const data = await load(handle, slug);

  if (!data) notFound();

  const { channel, episode } = data;

  const viewer = await getCurrentUser();
  const isOwner = viewer?.channel?.id === channel.id;

  if (episode.status !== "published" && !isOwner) notFound();

  const cover = episode.coverKey ? storage.url(episode.coverKey) : null;
  const audioUrl = storage.url(episode.audioPath);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href={`/c/${channel.handle}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {channel.displayName}
      </Link>

      {episode.status !== "published" && (
        <p className="mt-5 rounded-xl border border-brand/30 bg-brand-soft px-4 py-2.5 text-sm text-brand">
          Este episodio es un borrador: solo tú puedes verlo.
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
              {episode.kind === "music" ? "Música" : "Podcast"}
            </span>
            <span className="font-mono text-xs tabular text-subtle">
              {formatDuration(episode.durationSec)}
            </span>
            <span className="font-mono text-xs text-subtle">
              {formatDate(episode.publishedAt ?? episode.createdAt)}
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
        </div>
      </div>

      {episode.description && (
        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            Descripción
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

      {channel.zcashAddress && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-jade/25 bg-jade-soft p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-jade-bright" />
            <div>
              <p className="font-heading text-sm font-semibold text-jade-bright">
                ¿Te sirvió este episodio?
              </p>
              <p className="mt-1 text-xs text-jade-bright/70">
                Apoyá a {channel.displayName} directo en ZEC, sin intermediarios.
              </p>
            </div>
          </div>

          <Link
            href={`/c/${channel.handle}/donar`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            Apoyar con ZEC
          </Link>
        </div>
      )}
    </div>
  );
}

