export type MediaEventInput = {
  episodeId: string;
  channelId: string;
  method: string;
  status: number;
  rangeStart: number | null;
  rangeEnd: number | null;
  bytes: number;
  totalBytes: number;
  durationSec: number | null;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  isPrefetch: boolean;
};

export type ListenEventInput = {
  episodeId: string;
  channelId: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
};

export type ProgressEventInput = {
  episodeId: string;
  channelId: string;
  percent: number;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
};

export type AnalyticsEvent = {
  requestId: string;
  method: string;
  bytes: number;
  totalBytes: number;
  durationSec: number | null;
  ipHash: string | null;
  uaHash: string | null;
  isBot: number;
  isPrefetch: number;
};

export type ListenEvent = {
  requestId: string;
  episodeId: string;
  channelId: string;
  ipHash: string | null;
  uaHash: string | null;
  isBot: number;
  day?: string;
};

export type ProgressEvent = ListenEvent & {
  percent: number;
  device: string | null;
  app: string | null;
  country: string | null;
};

export type EpisodeStats = {
  days: number;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type DailyStats = {
  day: string;
  episodeId: string;
  channelId: string;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type AnalyticsFilters = {
  episodeId: string;
  from: string;
  to: string;
  country?: string;
  device?: string;
  app?: string;
};

export type AnalyticsSummary = {
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type DailyPoint = {
  day: string;
  rawDownloads: number;
  validDownloads: number;
  starts: number;
  verifiedListens: number;
  uniqueClients: number;
  bytes: number;
};

export type BreakdownItem = {
  label: string;
  requests: number;
  clients: number;
  bytes: number;
};

export type RetentionPoint = {
  percent: number;
  clients: number;
};

export type DashboardData = {
  summary: AnalyticsSummary;
  daily: DailyPoint[];
  countries: BreakdownItem[];
  devices: BreakdownItem[];
  apps: BreakdownItem[];
  retention: RetentionPoint[];
  filterOptions: {
    countries: string[];
    devices: string[];
    apps: string[];
  };
};
