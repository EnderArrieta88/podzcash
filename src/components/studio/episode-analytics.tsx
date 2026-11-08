import { getEpisodeStats } from "@/lib/analytics";
import { formatBytes } from "@/lib/format";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";

export function EpisodeAnalytics({
  episodeId,
  labels,
}: {
  episodeId: string;
  labels: StudioEpisodesContent["analytics"];
}) {
  const stats = getEpisodeStats(episodeId);

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
        {labels.title}
      </h2>

      {stats.rawDownloads === 0 ? (
        <p className="mt-4 text-sm text-muted">{labels.empty}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "raw", label: labels.raw, value: String(stats.rawDownloads) },
              {
                key: "valid",
                label: labels.valid,
                value: String(stats.validDownloads),
              },
              {
                key: "clients",
                label: labels.clients,
                value: String(stats.uniqueClients),
              },
              {
                key: "bytes",
                label: labels.bytes,
                value: formatBytes(stats.bytes),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-border bg-surface-2 p-3"
              >
                <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">
                  {item.label}
                </p>
                <p
                  className="mt-1 font-display text-2xl"
                  data-testid={`analytics-${item.key}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-subtle">
            {labels.hint}
          </p>
        </>
      )}
    </section>
  );
}
