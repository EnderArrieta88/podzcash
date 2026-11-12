import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Mic2, PencilLine, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { formatDate, formatDuration } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button-link";
import { DeleteEpisodeButton } from "@/features/episodes/components/delete-episode-button";
import { listStudioEpisodes } from "@/features/episodes/queries";
import { getLocale } from "@/lib/i18n/locale";
import { studioEpisodesContent } from "@/lib/i18n/studio-episodes";
import { episodePath } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return { title: studioEpisodesContent[locale].meta.list };
}

export default async function EpisodesPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const content = studioEpisodesContent[locale];
  const labels = content.list;

  if (!user.channel) redirect("/estudio/canal");

  const channel = user.channel;

  const { episodes, publishedCount } = await listStudioEpisodes(channel.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {labels.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {episodes.length === 0
              ? labels.emptyIntro
              : `${episodes.length} ${labels.countPrefix} ${publishedCount} ${labels.publishedSuffix}`}
          </p>
        </div>

        <ButtonLink href="/estudio/episodios/nuevo">
          <Plus size={16} />
          {labels.upload}
        </ButtonLink>
      </div>

      {episodes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
            <Mic2 size={20} />
          </span>
          <p className="mt-4 text-sm font-medium">{labels.emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            {labels.emptyBody}
          </p>
          <ButtonLink href="/estudio/episodios/nuevo" className="mt-6">
            <Plus size={16} />
            {labels.upload}
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {episodes.map((episode) => {
            const isPublished = episode.status === "published";

            return (
              <li key={episode.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:size-14">
                      {episode.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={episode.coverUrl}
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
                      <p className="line-clamp-2 font-display text-lg leading-tight sm:truncate sm:text-xl">
                        {episode.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] tabular text-subtle">
                        <span>{formatDuration(episode.durationSec)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {formatDate(
                            episode.publishedAt ?? episode.createdAt,
                            locale,
                          )}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {episode.playCount}{" "}
                          {episode.playCount === 1
                            ? labels.playOne
                            : labels.playMany}
                        </span>
                      </div>
                      {episode.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
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
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3 sm:w-auto sm:border-0 sm:pt-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                        isPublished
                          ? "bg-success/10 text-success"
                          : "bg-surface-2 text-subtle"
                      }`}
                    >
                      {isPublished ? labels.published : labels.draft}
                    </span>

                    <div className="flex items-center gap-1 sm:gap-3">
                      {isPublished && (
                        <Link
                          href={episodePath(channel.handle, episode.slug)}
                          target="_blank"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
                          aria-label={labels.viewAria}
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      <Link
                        href={`/estudio/episodios/${episode.id}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
                        aria-label={labels.editAria}
                      >
                        <PencilLine size={15} />
                      </Link>

                      <DeleteEpisodeButton
                        id={episode.id}
                        labels={content.delete}
                      />
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
