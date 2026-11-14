import Link from "next/link";
import { storage } from "@/lib/storage";
import type { ChannelSummary } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/config";
import { sharedLabels } from "@/lib/i18n/shared";
import { channelPath } from "@/lib/routes";

export function ChannelCard({
  channel,
  locale,
}: {
  channel: ChannelSummary;
  locale: Locale;
}) {
  const text = sharedLabels[locale];

  return (
    <Link
      href={channelPath(channel.handle)}
      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
    >
      {channel.avatarKey ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storage.url(channel.avatarKey)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-9 shrink-0 rounded-full border border-border object-cover"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
          {channel.displayName.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0">
        <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
          {channel.displayName}
        </p>
        <p className="truncate font-mono text-[11px] text-subtle">
          @{channel.handle} · {channel.episodeCount}{" "}
          {channel.episodeCount === 1 ? text.episodeOne : text.episodeMany}
        </p>
      </div>
    </Link>
  );
}
