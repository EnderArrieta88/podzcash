import Link from "next/link";
import { Mic2 } from "lucide-react";
import { PlayButton } from "@/components/player/play-button";
import { formatDuration, relativeDate } from "@/lib/format";
import { storage } from "@/lib/storage";
import type { EpisodeCard as EpisodeCardData } from "@/lib/catalog";

export function EpisodeCard({ episode }: { episode: EpisodeCardData }) {
  const cover = episode.coverKey ? storage.url(episode.coverKey) : null;
  const href = `/c/${episode.channel.handle}/${episode.slug}`;

  return (
    <article className="group">
      <div className="relative">
        <Link
          href={href}
          className="block aspect-square overflow-hidden rounded-xl border border-border bg-surface-2"
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-subtle">
              <Mic2 size={26} />
            </span>
          )}
        </Link>

        <div className="absolute bottom-3 right-3 translate-y-1 opacity-100 transition-all duration-200 sm:translate-y-0 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <PlayButton
            track={{
              id: episode.id,
              title: episode.title,
              channelName: episode.channel.displayName,
              channelHandle: episode.channel.handle,
              coverUrl: cover,
              src: storage.url(episode.audioPath),
              durationSec: episode.durationSec,
            }}
            className="shadow-[0_0_24px_rgba(244,183,40,0.35)]"
          />
        </div>
      </div>

      <Link href={href} className="mt-3 block">
        <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
          {episode.title}
        </h3>
      </Link>

      <p className="mt-1 truncate text-xs text-muted">
        {episode.channel.displayName}
      </p>

      <p className="mt-1 font-mono text-[11px] tabular text-subtle">
        {episode.kind === "music" ? "MÚSICA" : "PODCAST"} ·{" "}
        {formatDuration(episode.durationSec)} ·{" "}
        {relativeDate(episode.publishedAt ?? episode.createdAt)}
      </p>
    </article>
  );
}
