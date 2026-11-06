import Link from "next/link";
import { Mic2 } from "lucide-react";
import { PlayButton } from "@/components/player/play-button";
import { formatDuration, relativeDate } from "@/lib/format";
import { storage } from "@/lib/storage";
import type { EpisodeCard as EpisodeCardData } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/config";
import { sharedLabels } from "@/lib/i18n/shared";
import { episodePath } from "@/lib/routes";

export function EpisodeRow({
  episode,
  index,
  locale,
}: {
  episode: EpisodeCardData;
  index?: number;
  locale: Locale;
}) {
  const cover = episode.coverKey ? storage.url(episode.coverKey) : null;
  const href = episodePath(episode.channel.handle, episode.slug);
  const text = sharedLabels[locale];

  return (
    <li className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2">
      {typeof index === "number" && (
        <span className="w-6 shrink-0 text-center font-mono text-xs tabular text-subtle">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-subtle">
            <Mic2 size={16} />
          </span>
        )}
      </div>

      <Link href={href} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
          {episode.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {episode.channel.displayName} ·{" "}
          {episode.kind === "music" ? text.musicTitle : text.podcastTitle}
        </p>
      </Link>

      <span className="hidden font-mono text-[11px] tabular text-subtle sm:block">
        {formatDuration(episode.durationSec)}
      </span>

      <span className="hidden font-mono text-[11px] tabular text-subtle md:block">
        {relativeDate(episode.publishedAt ?? episode.createdAt, locale)}
      </span>

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
        locale={locale}
      />
    </li>
  );
}
