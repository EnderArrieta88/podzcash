import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Mic2, PencilLine, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { formatDate, formatDuration } from "@/lib/format";
import { storage } from "@/lib/storage";
import { ButtonLink } from "@/components/ui/button-link";
import { DeleteEpisodeButton } from "@/components/studio/delete-episode-button";

export const metadata: Metadata = { title: "Episodios" };

export default async function EpisodesPage() {
  const user = await requireUser();

  if (!user.channel) redirect("/estudio/canal");

  const channel = user.channel;

  const episodes = await prisma.episode.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  const published = episodes.filter((episode) => episode.status === "published");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Episodios</h1>
          <p className="mt-2 text-sm text-muted">
            {episodes.length === 0
              ? "Tu catálogo está vacío."
              : `${episodes.length} en total · ${published.length} publicados`}
          </p>
        </div>

        <ButtonLink href="/estudio/episodios/nuevo">
          <Plus size={16} />
          Subir episodio
        </ButtonLink>
      </div>

      {episodes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
            <Mic2 size={20} />
          </span>
          <p className="mt-4 text-sm font-medium">Todavía no subiste nada</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            Sube tu primer episodio o tema. Puedes dejarlo en borrador y
            publicarlo cuando estés listo.
          </p>
          <ButtonLink href="/estudio/episodios/nuevo" className="mt-6">
            <Plus size={16} />
            Subir episodio
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {episodes.map((episode) => {
            const cover = episode.coverKey
              ? storage.url(episode.coverKey)
              : null;
            const isPublished = episode.status === "published";

            return (
              <li key={episode.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-subtle">
                        <Mic2 size={18} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl">
                      {episode.title}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular text-subtle">
                      {formatDuration(episode.durationSec)} ·{" "}
                      {formatDate(episode.publishedAt ?? episode.createdAt)}
                    </p>
                    {episode.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {episode.tags.slice(0, 4).map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="rounded-full border border-border px-2 py-0.5 text-[11px] text-subtle"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                        isPublished
                          ? "bg-success/10 text-success"
                          : "bg-surface-2 text-subtle"
                      }`}
                    >
                      {isPublished ? "Publicado" : "Borrador"}
                    </span>

                    <div className="flex items-center gap-3">
                      {isPublished && (
                        <Link
                          href={`/c/${channel.handle}/${episode.slug}`}
                          target="_blank"
                          className="text-muted transition-colors hover:text-text"
                          aria-label="Ver episodio"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      <Link
                        href={`/estudio/episodios/${episode.id}`}
                        className="text-muted transition-colors hover:text-text"
                        aria-label="Editar episodio"
                      >
                        <PencilLine size={15} />
                      </Link>

                      <DeleteEpisodeButton id={episode.id} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

