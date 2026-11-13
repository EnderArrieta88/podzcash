export type UserAgentInfo = {
  isBot: boolean;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  app: string;
};

const BASE_BOT_PATTERN =
  "bot|crawler|spider|preview|facebookexternalhit|slackbot|twitterbot|discordbot|telegrambot|whatsapp|curl|wget|python-requests|go-http-client|headless|monitoring|uptime|pingdom|statuscake|semrush|ahrefs|mj12bot";

function botPattern(): RegExp {
  const extra = (process.env.ANALYTICS_BOT_PATTERNS ?? "")
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean);

  try {
    return new RegExp([BASE_BOT_PATTERN, ...extra].join("|"), "i");
  } catch {
    return new RegExp(BASE_BOT_PATTERN, "i");
  }
}

export function classifyUserAgent(userAgent: string | null): UserAgentInfo {
  const ua = (userAgent ?? "").trim();
  const lower = ua.toLowerCase();

  if (!ua || botPattern().test(lower)) {
    return {
      isBot: true,
      device: "unknown",
      app: ua ? "Bot" : "Unknown",
    };
  }

  const device = /ipad|tablet/.test(lower)
    ? "tablet"
    : /iphone|ipod|android|mobile/.test(lower)
      ? "mobile"
      : "desktop";

  const app = /applecoremedia|itunes/.test(lower)
    ? "Apple Podcasts"
    : /spotify/.test(lower)
      ? "Spotify"
      : /pocketcasts/.test(lower)
        ? "Pocket Casts"
        : /overcast/.test(lower)
          ? "Overcast"
          : /podcastaddict/.test(lower)
            ? "Podcast Addict"
            : /castbox/.test(lower)
              ? "Castbox"
              : /vlc/.test(lower)
                ? "VLC"
                : /mozilla|chrome|safari|firefox|edg\//.test(lower)
                  ? "Web"
                  : "Other";

  return { isBot: false, device, app };
}

export function isPrefetchRequest(headers: Headers): boolean {
  const purpose =
    headers.get("purpose") ??
    headers.get("sec-purpose") ??
    headers.get("x-purpose") ??
    headers.get("x-moz") ??
    "";

  return /prefetch|preview/i.test(purpose);
}
