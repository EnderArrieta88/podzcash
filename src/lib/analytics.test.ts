import { describe, expect, it } from "vitest";
import {
  analyticsRetentionDays,
  classifyUserAgent,
  isPrefetchRequest,
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
