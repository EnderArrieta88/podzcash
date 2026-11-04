import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Music2, Radio } from "lucide-react";
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
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href={`/c/${channel.handle}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {channel.displayName}
      </Link>

      {episode.status !== "published" && (
        <p className="mt-5 rounded-[10px] border border-brand/30 bg-brand-soft/50 px-3.5 py-2.5 text-sm text-brand">
          Este episodio es un borrador: solo tú puedes verlo.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="size-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-2">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <Music2 size={28} />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted">
              <Radio size={13} />
              {episode.kind === "music" ? "Música" : "Podcast"}
            </span>
            <span className="font-mono text-xs tabular text-subtle">
              {formatDuration(episode.durationSec)}
            </span>
          </div>

          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            {episode.title}
          </h1>

          <p className="mt-2 text-sm text-subtle">
            {formatDate(episode.publishedAt ?? episode.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4">
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
        <div className="min-w-0">
          <p className="font-mono text-xs tabular text-subtle">
            {formatDuration(episode.durationSec)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Sigue navegando: la reproducción no se corta.
          </p>
        </div>
      </div>

      {episode.description && (
        <div className="mt-8">
          <h2 className="font-display text-2xl tracking-tight">Descripción</h2>
          <p className="mt-3 whitespace-pre-line text-pretty leading-relaxed text-muted">
            {episode.description}
          </p>
        </div>
      )}

      {episode.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
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
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/25 bg-brand-soft/40 p-5">
          <div>
            <p className="text-sm font-medium">¿Te sirvió este episodio?</p>
            <p className="mt-1 text-xs text-muted">
              Apoyá a {channel.displayName} directo en ZEC, sin intermediarios.
            </p>
          </div>

          <Link
            href={`/c/${channel.handle}/donar`}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-[#17130a] text-[9px] font-bold text-brand">
              Z
            </span>
            Apoyar con ZEC
          </Link>
        </div>
      )}
    </div>
  );
}

