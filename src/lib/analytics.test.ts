import { describe, expect, it } from "vitest";
import {
  aggregateDay,
  analyticsDay,
  analyticsRetentionDays,
  classifyUserAgent,
  isPrefetchRequest,
  summarizeMediaEvents,
  type AnalyticsEvent,
  type ListenEvent,
} from "./analytics";

describe("classifyUserAgent", () => {
  it("detecta bots y crawlers", () => {
    for (const ua of [
      "Googlebot/2.1 (+http://www.google.com/bot.html)",
      "curl/8.0",
      "python-requests/2.31",
      "facebookexternalhit/1.1",
      "",
    ]) {
      expect(classifyUserAgent(ua).isBot).toBe(true);
    }
  });

  it("detecta apps y dispositivos de clientes reales", () => {
    expect(
      classifyUserAgent(
        "AppleCoreMedia/1.0.0.21G93 (iPhone; U; CPU OS 17_0 like Mac OS X)",
      ),
    ).toMatchObject({ isBot: false, device: "mobile", app: "Apple Podcasts" });

    expect(classifyUserAgent("Spotify/8.9 Android/34")).toMatchObject({
      isBot: false,
      device: "mobile",
      app: "Spotify",
    });

    expect(
      classifyUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      ),
    ).toMatchObject({ isBot: false, device: "desktop", app: "Web" });
  });
});

describe("isPrefetchRequest", () => {
  it("detecta los encabezados de prefetch", () => {
    expect(
      isPrefetchRequest(new Headers({ purpose: "prefetch" })),
    ).toBe(true);
    expect(
      isPrefetchRequest(new Headers({ "sec-purpose": "prefetch" })),
    ).toBe(true);
    expect(isPrefetchRequest(new Headers({ "x-moz": "prefetch" }))).toBe(true);
    expect(isPrefetchRequest(new Headers({ purpose: "playback" }))).toBe(false);
  });
});

describe("retención", () => {
  it("conserva los eventos crudos 90 días", () => {
    expect(analyticsRetentionDays).toBe(90);
  });
});

describe("analyticsDay", () => {
  it("agrupa según la zona horaria configurada", () => {
    const original = process.env.ANALYTICS_TIMEZONE;
    const date = new Date("2026-11-08T02:30:00.000Z");

    process.env.ANALYTICS_TIMEZONE = "America/Argentina/Buenos_Aires";
    expect(analyticsDay(date)).toBe("2026-11-07");

    process.env.ANALYTICS_TIMEZONE = "UTC";
    expect(analyticsDay(date)).toBe("2026-11-08");

    if (original === undefined) delete process.env.ANALYTICS_TIMEZONE;
    else process.env.ANALYTICS_TIMEZONE = original;
  });
});

function event(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    requestId: "request",
    method: "GET",
    bytes: 0,
    totalBytes: 64_044,
    durationSec: 4,
    ipHash: "ip-a",
    uaHash: "ua-a",
    isBot: 0,
    isPrefetch: 0,
    ...overrides,
  };
}

describe("summarizeMediaEvents", () => {
  it("deduplica rangos del mismo cliente en una descarga válida", () => {
    const stats = summarizeMediaEvents([
      event({ requestId: "r1", bytes: 20_000 }),
      event({ requestId: "r2", bytes: 20_000 }),
    ]);

    expect(stats.rawDownloads).toBe(2);
    expect(stats.validDownloads).toBe(1);
    expect(stats.uniqueClients).toBe(1);
    expect(stats.bytes).toBe(40_000);
  });

  it("excluye bots, prefetch y HEAD de las descargas válidas", () => {
    const stats = summarizeMediaEvents([
      event({ ipHash: "ip-a", bytes: 64_044 }),
      event({ ipHash: "ip-bot", isBot: 1, bytes: 64_044 }),
      event({ ipHash: "ip-prefetch", isPrefetch: 1, bytes: 64_044 }),
      event({ ipHash: "ip-head", method: "HEAD", bytes: 0 }),
    ]);

    expect(stats.rawDownloads).toBe(3);
    expect(stats.validDownloads).toBe(1);
    expect(stats.uniqueClients).toBe(1);
  });

  it("aplica el umbral de consumo mínimo", () => {
    const stats = summarizeMediaEvents([
      event({ ipHash: "ip-short", bytes: 5_000 }),
      event({ ipHash: "ip-long", bytes: 64_044 }),
    ]);

    expect(stats.rawDownloads).toBe(2);
    expect(stats.validDownloads).toBe(1);
    expect(stats.uniqueClients).toBe(2);
  });
});

describe("aggregateDay", () => {
  it("combina descargas, inicios y escuchas verificadas", () => {
    const media = [
      { ...event({ requestId: "r1", bytes: 20_000 }), episodeId: "e1", channelId: "c1" },
      { ...event({ requestId: "r2", bytes: 20_000 }), episodeId: "e1", channelId: "c1" },
      {
        ...event({ requestId: "r3", ipHash: "ip-short", uaHash: "ua-short", bytes: 5_000 }),
        episodeId: "e1",
        channelId: "c1",
      },
      {
        ...event({ requestId: "r4", ipHash: "ip-bot", isBot: 1, bytes: 64_044 }),
        episodeId: "e1",
        channelId: "c1",
      },
      {
        ...event({ requestId: "r5", ipHash: "ip-prefetch", isPrefetch: 1, bytes: 64_044 }),
        episodeId: "e1",
        channelId: "c1",
      },
    ];
    const listens: ListenEvent[] = [
      {
        requestId: "s1",
        episodeId: "e1",
        channelId: "c1",
        ipHash: "ip-a",
        uaHash: "ua-a",
        isBot: 0,
      },
      {
        requestId: "s2",
        episodeId: "e1",
        channelId: "c1",
        ipHash: "ip-short",
        uaHash: "ua-short",
        isBot: 0,
      },
      {
        requestId: "s3",
        episodeId: "e1",
        channelId: "c1",
        ipHash: "ip-bot",
        uaHash: "ua-bot",
        isBot: 1,
      },
    ];

    expect(aggregateDay("2026-11-08", media, listens)).toEqual([
      {
        day: "2026-11-08",
        episodeId: "e1",
        channelId: "c1",
        rawDownloads: 5,
        validDownloads: 1,
        starts: 2,
        verifiedListens: 1,
        uniqueClients: 2,
        bytes: 173_088,
      },
    ]);
  });
});
