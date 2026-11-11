import { describe, expect, it } from "vitest";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import {
  buildChannelFeed,
  type FeedChannel,
  type FeedEpisode,
} from "./feed-xml";
import { podcastGuid } from "./rss";

const ORIGIN = "https://podzcash.online";
const CREATED = new Date("2026-11-01T10:00:00.000Z");

function channel(overrides: Partial<FeedChannel> = {}): FeedChannel {
  return {
    id: "channel-one",
    handle: "uno",
    displayName: "Canal Uno",
    bio: "Un canal de prueba.",
    avatarKey: "avatars/one/avatar.jpg",
    zcashAddress:
      "u1xfe95y0lw3eznadwvv5k4f26xq0h5ppucyeucmnzuff2r8l2jmg7v5pqlvnvkl645ucpejjvsgg8rh2zpw9f055cp0zpl7w8hqt6pwsy",
    feedLanguage: "es",
    feedCategory: "Technology",
    feedExplicit: false,
    ownerEmail: null,
    block: false,
    newFeedUrl: null,
    createdAt: CREATED,
    ...overrides,
  };
}

function episode(overrides: Partial<FeedEpisode> = {}): FeedEpisode {
  return {
    id: "episode-one",
    title: "Episodio uno",
    slug: "episodio-uno",
    description: "Descripción del episodio.",
    audioPath: "audio/one/episode.mp3",
    coverKey: "covers/one/cover.jpg",
    durationSec: 125,
    fileSize: 2_000_000,
    publishedAt: new Date("2026-11-02T12:00:00.000Z"),
    createdAt: CREATED,
    season: 1,
    episodeNumber: 3,
    episodeType: "full",
    explicit: null,
    tags: [{ tag: { name: "privacidad" } }],
    ...overrides,
  };
}

function parse(xml: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    parseAttributeValue: false,
  });
  return parser.parse(xml).rss.channel;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function validateFeed(xml: string): string[] {
  const missing: string[] = [];
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    return [`XML inválido: ${validation.err.msg}`];
  }

  const root = parse(xml);
  const require = (value: unknown, label: string) => {
    if (value == null || value === "") missing.push(label);
  };

  require(root.title, "channel.title");
  require(root.link, "channel.link");
  require(root.description, "channel.description");
  require(root.language, "channel.language");
  require(root["atom:link"]?.["@_href"], "atom:link@href");
  require(root["itunes:author"], "itunes:author");
  require(root["itunes:owner"]?.["itunes:name"], "itunes:owner/itunes:name");
  require(root["itunes:owner"]?.["itunes:email"], "itunes:owner/itunes:email");
  require(root["itunes:category"]?.["@_text"], "itunes:category@text");
  require(root["itunes:explicit"], "itunes:explicit");
  require(root["itunes:image"]?.["@_href"], "itunes:image@href");
  require(root["podcast:locked"]?.["@_owner"], "podcast:locked@owner");
  require(root["podcast:guid"], "podcast:guid");

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      String(root["podcast:guid"]),
    )
  ) {
    missing.push("podcast:guid no es un UUID v5");
  }

  const items = asArray(root.item);
  if (items.length === 0) missing.push("channel.item");

  for (const [index, item] of items.entries()) {
    const prefix = `item[${index}]`;
    require(item.title, `${prefix}.title`);
    require(item.link, `${prefix}.link`);
    require(item.guid, `${prefix}.guid`);
    require(item.pubDate, `${prefix}.pubDate`);
    require(item.description, `${prefix}.description`);
    require(item.enclosure?.["@_url"], `${prefix}.enclosure@url`);
    require(item.enclosure?.["@_length"], `${prefix}.enclosure@length`);
    require(item.enclosure?.["@_type"], `${prefix}.enclosure@type`);
    require(item["itunes:duration"], `${prefix}.itunes:duration`);
    require(item["itunes:episode"], `${prefix}.itunes:episode`);
    require(item["itunes:episodeType"], `${prefix}.itunes:episodeType`);
    require(item["itunes:explicit"], `${prefix}.itunes:explicit`);
  }

  return missing;
}

describe("podcastGuid", () => {
  it("genera un UUID v5 estable y distinto por canal", () => {
    const first = podcastGuid("channel-one");
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(podcastGuid("channel-one")).toBe(first);
    expect(podcastGuid("channel-two")).not.toBe(first);
  });
});

describe("buildChannelFeed", () => {
  it("genera el feed del canal uno", () => {
    const xml = buildChannelFeed({
      channel: channel(),
      episodes: [episode()],
      origin: ORIGIN,
      ownerFallback: "hola@podzcash.online",
    });

    expect(xml).toMatchSnapshot();
    expect(validateFeed(xml)).toEqual([]);
  });

  it("genera el feed del canal dos con block y new-feed-url", () => {
    const xml = buildChannelFeed({
      channel: channel({
        id: "channel-two",
        handle: "dos",
        displayName: "Channel Two",
        avatarKey: "avatars/two/avatar.jpg",
        zcashAddress: null,
        feedLanguage: "en-US",
        feedCategory: "Society & Culture",
        feedExplicit: true,
        ownerEmail: "owner@example.com",
        block: true,
        newFeedUrl: "https://example.com/new-feed.xml",
      }),
      episodes: [
        episode({
          id: "episode-two",
          title: "Episode two",
          slug: "episode-two",
          audioPath: "audio/two/episode.m4a",
          coverKey: null,
          season: null,
          episodeNumber: null,
          episodeType: "trailer",
          explicit: false,
          tags: [],
        }),
      ],
      origin: ORIGIN,
      ownerFallback: "hola@podzcash.online",
    });

    expect(xml).toMatchSnapshot();
    expect(validateFeed(xml)).toEqual([]);

    const parsed = parse(xml);
    expect(parsed.language).toBe("en-US");
    expect(parsed["itunes:category"]?.["@_text"]).toBe("Society & Culture");
    expect(parsed["itunes:explicit"]).toBe("true");
    expect(parsed["itunes:owner"]?.["itunes:email"]).toBe("owner@example.com");
    expect(parsed["itunes:block"]).toBe("yes");
    expect(parsed["itunes:new-feed-url"]).toBe(
      "https://example.com/new-feed.xml",
    );
    expect(parsed["podcast:locked"]?.["@_owner"]).toBe("owner@example.com");
    expect(parsed["podcast:funding"]).toBeUndefined();

    const item = asArray(parsed.item)[0];
    expect(item["itunes:episode"]).toBe("1");
    expect(item["itunes:episodeType"]).toBe("trailer");
    expect(item["itunes:explicit"]).toBe("false");
    expect(item["itunes:season"]).toBeUndefined();
    expect(item.enclosure?.["@_type"]).toBe("audio/mp4");
  });
});
