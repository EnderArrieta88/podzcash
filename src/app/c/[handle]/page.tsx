import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mic2, PencilLine, Radio } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { parseLinks } from "@/lib/links";
import { storage } from "@/lib/storage";

type PageProps = { params: Promise<{ handle: string }> };

async function loadChannel(handle: string) {
  return prisma.channel.findUnique({
    where: { handle: handle.toLowerCase() },
    include: {
      _count: {
        select: { episodes: { where: { status: "published" } } },
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
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
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

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-subtle">
              ZEC próximamente
            </span>

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

        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
            <Mic2 size={20} />
          </span>
          <p className="mt-4 text-sm font-medium">Todavía no hay episodios</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            {isOwner
              ? "Tu canal está listo. En la próxima fase vas a poder subir tu primer audio."
              : "Este canal está empezando. Vuelve pronto para escucharlo."}
          </p>
        </div>
      </section>
    </div>
  );
}
