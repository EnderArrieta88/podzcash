import Link from "next/link";
import { storage } from "@/lib/storage";
import type { ChannelSummary } from "@/lib/catalog";

export function ChannelCard({ channel }: { channel: ChannelSummary }) {
  return (
    <Link
      href={`/c/${channel.handle}`}
      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
    >
      {channel.avatarKey ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storage.url(channel.avatarKey)}
          alt=""
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
          {channel.episodeCount === 1 ? "episodio" : "episodios"}
        </p>
      </div>
    </Link>
  );
}
