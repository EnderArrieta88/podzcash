import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import {
  analyticsDay,
  getDashboardData,
  type BreakdownItem,
} from "@/lib/analytics";
import { getStudioEpisodeSummary } from "@/features/episodes/queries";
import { formatBytes } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { studioAnalyticsContent } from "@/lib/i18n/studio-analytics";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: studioAnalyticsContent[locale].title };
}

function dayParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null;
}

function textParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function defaultRange() {
  const now = Date.now();

  return {
    from: analyticsDay(new Date(now - 29 * 86_400_000)),
    to: analyticsDay(new Date(now)),
  };
}

function Breakdown({
  title,
  items,
  empty,
  labels,
}: {
  title: string;
  items: BreakdownItem[];
  empty: string;
  labels: { clients: string; requests: string };
}) {
  const max = Math.max(1, ...items.map((item) => item.clients));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-text">{item.label}</span>
                <span className="shrink-0 font-mono text-xs text-subtle">
                  {item.clients} {labels.clients} · {item.requests}{" "}
                  {labels.requests}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(item.clients / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function EpisodeAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const [user, locale, query, { id }] = await Promise.all([
    requireUser(),
    getLocale(),
    searchParams,
    params,
  ]);

  if (!user.channel) redirect("/estudio/canal");

  const labels = studioAnalyticsContent[locale];

  const episode = await getStudioEpisodeSummary(user.channel.id, id);

  if (!episode) notFound();

  const range = defaultRange();
  let from = dayParam(query.from) ?? range.from;
  let to = dayParam(query.to) ?? range.to;

  if (from > to) {
    [from, to] = [to, from];
  }

  const country = textParam(query.country);
  const device = textParam(query.device);
  const app = textParam(query.app);
  const data = getDashboardData({
    episodeId: episode.id,
    from,
    to,
    country,
    device,
    app,
  });

  const exportQuery = new URLSearchParams({ from, to });
  if (country) exportQuery.set("country", country);
  if (device) exportQuery.set("device", device);
  if (app) exportQuery.set("app", app);

  const summary = [
    { key: "raw", label: labels.raw, value: String(data.summary.rawDownloads) },
    {
      key: "valid",
      label: labels.valid,
      value: String(data.summary.validDownloads),
    },
    { key: "starts", label: labels.starts, value: String(data.summary.starts) },
    {
      key: "verified",
      label: labels.verified,
      value: String(data.summary.verifiedListens),
    },
    {
      key: "clients",
      label: labels.clients,
      value: String(data.summary.uniqueClients),
    },
    {
      key: "bytes",
      label: labels.bytes,
      value: formatBytes(data.summary.bytes),
    },
  ];

  const maxDaily = Math.max(
    1,
    ...data.daily.map((point) =>
      Math.max(point.rawDownloads, point.validDownloads),
    ),
  );
  const maxRetention = Math.max(
    1,
    ...data.retention.map((point) => point.clients),
  );
  const hasDaily = data.daily.some(
    (point) => point.rawDownloads > 0 || point.validDownloads > 0,
  );
  const hasRetention = data.retention.some((point) => point.clients > 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <Link
          href={`/estudio/episodios/${episode.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={14} />
          {labels.back}
        </Link>
        <h1 className="mt-3 font-display text-3xl tracking-tight">
          {labels.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{episode.title}</p>
        <p className="mt-2 flex flex-wrap gap-3 text-xs">
          <a
            href="https://github.com/EnderArrieta88/podzcash/blob/main/docs/analytics.md"
            target="_blank"
            rel="noreferrer"
            className="text-brand transition-colors hover:underline"
          >
            {labels.docsLink}
          </a>
          <Link
            href="/privacidad"
            className="text-muted transition-colors hover:text-text"
          >
            {labels.privacyLink}
          </Link>
        </p>
      </div>

      <form
        method="get"
        className="rounded-xl border border-border bg-surface p-5"
      >
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {labels.filters}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">{labels.from}</span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">{labels.to}</span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">{labels.country}</span>
            <select
              name="country"
              defaultValue={country ?? ""}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              <option value="">{labels.all}</option>
              <option value="__unknown__">{labels.unknown}</option>
              {data.filterOptions.countries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">{labels.device}</span>
            <select
              name="device"
              defaultValue={device ?? ""}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              <option value="">{labels.all}</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
              <option value="unknown">{labels.unknown}</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted">{labels.app}</span>
            <select
              name="app"
              defaultValue={app ?? ""}
              className="h-10 w-full rounded-[10px] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-brand"
            >
              <option value="">{labels.all}</option>
              {data.filterOptions.apps.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-[#17130a] transition-colors hover:bg-brand-strong"
          >
            {labels.apply}
          </button>
          <Link
            href={`/estudio/episodios/${episode.id}/analitica`}
            className="text-sm text-muted transition-colors hover:text-text"
          >
            {labels.reset}
          </Link>
          <Link
            href={`/estudio/episodios/${episode.id}/analitica/export?${exportQuery.toString()}`}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 text-sm text-text transition-colors hover:bg-surface-3"
          >
            <Download size={14} />
            {labels.export}
          </Link>
        </div>
      </form>

      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {labels.summary}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">
                {item.label}
              </p>
              <p
                className="mt-1 font-display text-2xl"
                data-testid={`summary-${item.key}`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {labels.daily}
        </h2>

        {!hasDaily ? (
          <p className="mt-3 text-sm text-muted">{labels.empty}</p>
        ) : (
          <div className="mt-5 flex h-44 items-end gap-1 overflow-x-auto">
            {data.daily.map((point) => (
              <div
                key={point.day}
                className="flex min-w-7 flex-1 flex-col items-center gap-1"
                title={`${point.day}: ${point.rawDownloads} / ${point.validDownloads}`}
              >
                <div className="flex h-36 w-full items-end justify-center gap-0.5">
                  <div
                    className="w-1.5 rounded-t bg-border"
                    style={{
                      height: `${(point.rawDownloads / maxDaily) * 100}%`,
                    }}
                  />
                  <div
                    className="w-1.5 rounded-t bg-brand"
                    style={{
                      height: `${(point.validDownloads / maxDaily) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] text-subtle">
                  {point.day.slice(8)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Breakdown
          title={labels.countries}
          items={data.countries}
          empty={labels.noBreakdown}
          labels={{ clients: labels.clients, requests: labels.requests }}
        />
        <Breakdown
          title={labels.devices}
          items={data.devices}
          empty={labels.noBreakdown}
          labels={{ clients: labels.clients, requests: labels.requests }}
        />
        <Breakdown
          title={labels.apps}
          items={data.apps}
          empty={labels.noBreakdown}
          labels={{ clients: labels.clients, requests: labels.requests }}
        />
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          {labels.retention}
        </h2>

        {!hasRetention ? (
          <p className="mt-3 text-sm text-muted">{labels.noRetention}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {data.retention.map((point) => (
              <div key={point.percent} className="flex items-center gap-3">
                <span className="w-10 shrink-0 font-mono text-xs text-subtle">
                  {point.percent}%
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-jade"
                    style={{
                      width: `${(point.clients / maxRetention) * 100}%`,
                    }}
                  />
                </div>
                <span
                  className="w-10 shrink-0 text-right font-mono text-xs text-subtle"
                  data-testid={`retention-${point.percent}`}
                >
                  {point.clients}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {labels.retentionHint}
        </p>
      </section>
    </div>
  );
}
