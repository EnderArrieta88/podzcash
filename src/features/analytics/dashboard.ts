import { dayListBetween } from "./dates";
import type {
  AnalyticsEvent,
  AnalyticsFilters,
  AnalyticsSummary,
  BreakdownItem,
  DailyPoint,
  DailyStats,
  DashboardData,
  EpisodeStats,
  ListenEvent,
  ProgressEvent,
  RetentionPoint,
} from "./types";

export type MediaAnalysis = {
  rawDownloads: number;
  validDownloads: number;
  uniqueClients: number;
  bytes: number;
  validClients: Set<string>;
};

export function clientKey(event: AnalyticsEvent | ListenEvent): string {
  return `${event.ipHash ?? event.requestId}|${event.uaHash ?? event.requestId}`;
}

export function analyzeMedia(events: AnalyticsEvent[]): MediaAnalysis {
  const downloads = events.filter((event) => event.method === "GET");
  const clients = new Map<
    string,
    {
      bytes: number;
      durationSec: number | null;
      totalBytes: number;
    }
  >();

  for (const event of downloads) {
    if (event.isBot || event.isPrefetch) continue;

    const key = clientKey(event);
    const current = clients.get(key) ?? {
      bytes: 0,
      durationSec: null,
      totalBytes: 0,
    };

    current.bytes += event.bytes;
    current.durationSec = current.durationSec ?? event.durationSec;
    current.totalBytes = current.totalBytes || event.totalBytes;
    clients.set(key, current);
  }

  const validClients = new Set<string>();

  for (const [key, client] of clients) {
    const duration = client.durationSec ?? 0;
    const totalBytes = client.totalBytes ?? 0;

    const thresholdBytes =
      duration > 0 && totalBytes > 0
        ? totalBytes * (Math.min(60, Math.max(1, duration * 0.1)) / duration)
        : 1_048_576;

    if (client.bytes >= thresholdBytes) validClients.add(key);
  }

  return {
    rawDownloads: downloads.length,
    validDownloads: validClients.size,
    uniqueClients: clients.size,
    bytes: downloads.reduce((sum, event) => sum + event.bytes, 0),
    validClients,
  };
}

export function summarizeMediaEvents(
  events: AnalyticsEvent[],
): Omit<EpisodeStats, "days" | "starts" | "verifiedListens"> {
  const analysis = analyzeMedia(events);

  return {
    rawDownloads: analysis.rawDownloads,
    validDownloads: analysis.validDownloads,
    uniqueClients: analysis.uniqueClients,
    bytes: analysis.bytes,
  };
}

export function aggregateDay(
  day: string,
  mediaEvents: Array<AnalyticsEvent & { episodeId: string; channelId: string }>,
  listenEvents: ListenEvent[],
): DailyStats[] {
  const mediaByEpisode = new Map<
    string,
    (AnalyticsEvent & { episodeId: string; channelId: string })[]
  >();
  const listenByEpisode = new Map<string, ListenEvent[]>();

  for (const event of mediaEvents) {
    const list = mediaByEpisode.get(event.episodeId) ?? [];
    list.push(event);
    mediaByEpisode.set(event.episodeId, list);
  }

  for (const event of listenEvents) {
    const list = listenByEpisode.get(event.episodeId) ?? [];
    list.push(event);
    listenByEpisode.set(event.episodeId, list);
  }

  const episodes = new Set([
    ...mediaByEpisode.keys(),
    ...listenByEpisode.keys(),
  ]);
  const rows: DailyStats[] = [];

  for (const episodeId of episodes) {
    const media = mediaByEpisode.get(episodeId) ?? [];
    const listens = listenByEpisode.get(episodeId) ?? [];
    const analysis = analyzeMedia(media);
    const starts = new Set(
      listens.filter((event) => !event.isBot).map((event) => clientKey(event)),
    );
    const verifiedListens = [...starts].filter((key) =>
      analysis.validClients.has(key),
    ).length;

    rows.push({
      day,
      episodeId,
      channelId: media[0]?.channelId ?? listens[0]?.channelId ?? "",
      rawDownloads: analysis.rawDownloads,
      validDownloads: analysis.validDownloads,
      starts: starts.size,
      verifiedListens,
      uniqueClients: analysis.uniqueClients,
      bytes: analysis.bytes,
    });
  }

  return rows;
}

export function filterWhere(filters: AnalyticsFilters): {
  clause: string;
  params: Array<string>;
} {
  const clause = [`episodeId = ?`, `day >= ?`, `day <= ?`];
  const params = [filters.episodeId, filters.from, filters.to];

  for (const [column, value] of [
    ["country", filters.country],
    ["device", filters.device],
    ["app", filters.app],
  ] as const) {
    if (!value) continue;

    if (value === "__unknown__") {
      clause.push(`${column} IS NULL`);
    } else {
      clause.push(`${column} = ?`);
      params.push(value);
    }
  }

  return { clause: clause.join(" AND "), params };
}

export function breakdown(
  events: Array<
    AnalyticsEvent & {
      episodeId: string;
      channelId: string;
      country: string | null;
      device: string | null;
      app: string | null;
    }
  >,
  field: "country" | "device" | "app",
): BreakdownItem[] {
  const groups = new Map<
    string,
    { requests: number; clients: Set<string>; bytes: number }
  >();

  for (const event of events) {
    if (event.method !== "GET" || event.isBot || event.isPrefetch) continue;

    const label = event[field] || "Desconocido";
    const group = groups.get(label) ?? {
      requests: 0,
      clients: new Set<string>(),
      bytes: 0,
    };

    group.requests += 1;
    group.clients.add(clientKey(event));
    group.bytes += event.bytes;
    groups.set(label, group);
  }

  return [...groups.entries()]
    .map(([label, group]) => ({
      label,
      requests: group.requests,
      clients: group.clients.size,
      bytes: group.bytes,
    }))
    .sort((a, b) => b.clients - a.clients || b.requests - a.requests)
    .slice(0, 10);
}

/**
 * Agrega los eventos del rango en la estructura que consume el panel.
 */
export function buildDashboard(
  data: {
    media: Array<
      AnalyticsEvent & {
        episodeId: string;
        channelId: string;
        day: string;
        country: string | null;
        device: string | null;
        app: string | null;
      }
    >;
    listens: ListenEvent[];
    progress: ProgressEvent[];
    filterOptions: {
      countries: string[];
      devices: string[];
      apps: string[];
    };
  },
  filters: Pick<AnalyticsFilters, "from" | "to">,
): DashboardData {
  const { media, listens, progress, filterOptions } = data;
  const analysis = analyzeMedia(media);
  const starts = new Set(
    listens.filter((event) => !event.isBot).map((event) => clientKey(event)),
  );
  const verifiedListens = [...starts].filter((key) =>
    analysis.validClients.has(key),
  ).length;

  const daily: DailyPoint[] = [];

  for (const day of dayListBetween(filters.from, filters.to)) {
    const dayMedia = media.filter((event) => event.day === day);
    const dayListens = listens.filter((event) => event.day === day);

    if (dayMedia.length === 0 && dayListens.length === 0) {
      daily.push({
        day,
        rawDownloads: 0,
        validDownloads: 0,
        starts: 0,
        verifiedListens: 0,
        uniqueClients: 0,
        bytes: 0,
      });
      continue;
    }

    const [row] = aggregateDay(day, dayMedia, dayListens);
    daily.push({
      day,
      rawDownloads: row?.rawDownloads ?? 0,
      validDownloads: row?.validDownloads ?? 0,
      starts: row?.starts ?? 0,
      verifiedListens: row?.verifiedListens ?? 0,
      uniqueClients: row?.uniqueClients ?? 0,
      bytes: row?.bytes ?? 0,
    });
  }

  const progressByClient = new Map<string, number>();

  for (const event of progress) {
    if (event.isBot) continue;
    const key = clientKey(event);
    progressByClient.set(
      key,
      Math.max(progressByClient.get(key) ?? 0, event.percent),
    );
  }

  const retention: RetentionPoint[] = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  ].map((percent) => ({
    percent,
    clients: [...progressByClient.values()].filter((value) => value >= percent)
      .length,
  }));

  const summary: AnalyticsSummary = {
    rawDownloads: analysis.rawDownloads,
    validDownloads: analysis.validDownloads,
    starts: starts.size,
    verifiedListens,
    uniqueClients: analysis.uniqueClients,
    bytes: analysis.bytes,
  };

  return {
    summary,
    daily,
    countries: breakdown(media, "country"),
    devices: breakdown(media, "device"),
    apps: breakdown(media, "app"),
    retention,
    filterOptions,
  };
}
