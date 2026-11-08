import { test, expect } from "@playwright/test";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const CHANNEL = "e2e-canal";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("el feed real valida y la página declara autodiscovery", async ({
  request,
  page,
}) => {
  const response = await request.get(`/canal/@${CHANNEL}/feed.xml`);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");

  const xml = await response.text();
  expect(XMLValidator.validate(xml)).toBe(true);

  const channel = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    parseAttributeValue: false,
  }).parse(xml).rss.channel;

  expect(channel.language).toBe("es");
  expect(channel["itunes:category"]?.["@_text"]).toBe("Technology");
  expect(channel["podcast:guid"]).toMatch(UUID);
  expect(channel["podcast:locked"]?.["@_owner"]).toBe("hola@podzcash.online");
  expect(channel["itunes:image"]?.["@_href"]).toContain("/media/");

  const item = Array.isArray(channel.item) ? channel.item[0] : channel.item;
  expect(item?.enclosure?.["@_url"]).toContain("/media/audio/");
  expect(item?.["itunes:episode"]).toMatch(/^\d+$/);
  expect(item?.["itunes:episodeType"]).toBe("full");

  await page.goto(`/canal/@${CHANNEL}`);
  const alternate = page.locator(
    'link[rel="alternate"][type="application/rss+xml"]',
  );
  await expect(alternate).toHaveCount(1);
  await expect(alternate).toHaveAttribute(
    "href",
    new RegExp(`/canal/@${CHANNEL}/feed\\.xml$`),
  );
});
