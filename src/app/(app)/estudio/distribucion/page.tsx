import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Rss } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { CopyButton } from "@/components/ui/copy-button";

export const metadata: Metadata = { title: "Distribución" };

const SITE = (process.env.SITE_URL ?? "https://podzcash.online").replace(
  /\/+$/,
  "",
);

export default async function DistributionPage() {
  const user = await requireUser();

  if (!user.channel) redirect("/estudio/canal");

  const channel = user.channel;
  const feedUrl = `${SITE}/c/${channel.handle}/feed.xml`;

  const latest = await prisma.episode.findFirst({
    where: { channelId: channel.id, status: "published" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
  });

  const embedCode = latest
    ? `<iframe src="${SITE}/embed/${latest.id}" width="100%" height="190" style="border:0;border-radius:12px" loading="lazy" title="${latest.title.replaceAll('"', "&quot;")}"></iframe>`
    : "";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Distribución
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tu feed RSS lleva el canal a Apple Podcasts, Spotify y cualquier
          reproductor de podcasts.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2">
          <Rss size={16} className="text-brand" />
          <h2 className="font-heading text-sm font-semibold">Feed RSS</h2>
        </div>
        <p className="mt-1 text-xs text-muted">
          Es público y se actualiza solo cuando publicás un episodio.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-text">
            {feedUrl}
          </code>
          <CopyButton value={feedUrl} />
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
          En Apple y Spotify elegís “añadir podcast por RSS” y pegás esta URL.
          La verificación puede tardar unas horas. Tu portada debe ser cuadrada
          y de al menos 1400×1400 px.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-sm font-semibold">
          Reproductor embebible
        </h2>
        <p className="mt-1 text-xs text-muted">
          Pegá este código en tu web para que cualquiera escuche sin salir de
          ella.{" "}
          {latest ? (
            <>
              Corresponde al episodio más reciente:{" "}
              <span className="text-text">{latest.title}</span>.
            </>
          ) : (
            <>Publicá un episodio para generar el código.</>
          )}
        </p>

        {latest ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-text">
              {embedCode}
            </code>
            <CopyButton value={embedCode} />
          </div>
        ) : (
          <Link
            href="/estudio/episodios/nuevo"
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-[#17130a]"
          >
            Subir episodio
          </Link>
        )}
      </section>

      <section className="rounded-xl border border-jade/25 bg-jade-soft p-5">
        <p className="font-heading text-sm font-semibold text-jade-bright">
          Donaciones en el feed
        </p>
        <p className="mt-1 text-xs leading-relaxed text-jade-bright/70">
          Los oyentes que lleguen desde Apple o Spotify también pueden apoyarte:
          el enlace de cada episodio abre tu página de donación en PodZcash.
        </p>
      </section>
    </div>
  );
}
