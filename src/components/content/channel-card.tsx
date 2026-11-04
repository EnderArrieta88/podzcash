import Link from "next/link";
import { Radio } from "lucide-react";
import { storage } from "@/lib/storage";
import type { ChannelSummary } from "@/lib/catalog";

export function ChannelCard({ channel }: { channel: ChannelSummary }) {
  return (
    <Link
      href={`/c/${channel.handle}`}
      className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-brand/30"
    >
      {channel.avatarKey ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storage.url(channel.avatarKey)}
          alt=""
          className="size-12 shrink-0 rounded-full border border-border object-cover"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-lg text-brand">
          {channel.displayName.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0">
        <p className="truncate font-display text-lg leading-tight transition-colors group-hover:text-brand">
          {channel.displayName}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-subtle">
          @{channel.handle}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Radio size={12} />
          {channel.episodeCount}{" "}
          {channel.episodeCount === 1 ? "episodio" : "episodios"}
        </p>
      </div>
    </Link>
  );
}
