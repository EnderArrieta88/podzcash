import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

const ANALYTICS_DB = path.join(process.cwd(), ".data-e2e", "analytics.db");
const AUDIO = "/media/audio/e2e_channel/e2e.wav";

function eventFor(userAgent: string) {
  if (!existsSync(ANALYTICS_DB)) return undefined;

  const db = new Database(ANALYTICS_DB, { readonly: true });

  try {
    return db
      .prepare(
        `SELECT * FROM media_events WHERE userAgent = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(userAgent) as Record<string, unknown> | undefined;
  } finally {
    db.close();
  }
}

test("registra descargas con rango y hash de IP", async ({ request }) => {
  const userAgent = "E2E Range Client";
  const response = await request.get(AUDIO, {
    headers: {
      Range: "bytes=0-99",
      "user-agent": userAgent,
      "x-forwarded-for": "203.0.113.9",
    },
  });

  expect(response.status()).toBe(206);
  expect((await response.body()).length).toBe(100);

  await expect
    .poll(() => eventFor(userAgent), { timeout: 5_000 })
    .toBeTruthy();

  const event = eventFor(userAgent)!;

  expect(event.episodeId).toBe("e2e_episode");
  expect(event.channelId).toBe("e2e_channel");
  expect(event.method).toBe("GET");
  expect(event.status).toBe(206);
  expect(event.rangeStart).toBe(0);
  expect(event.rangeEnd).toBe(99);
  expect(event.bytes).toBe(100);
  expect(event.isBot).toBe(0);
  expect(event.isPrefetch).toBe(0);
  expect(String(event.ipHash)).toHaveLength(64);
  expect(String(event.ipHash)).not.toContain("203.0.113.9");
});

test("marca bots y prefetch sin contarlos como clientes", async ({
  request,
}) => {
  const botAgent = "Googlebot/2.1 (+http://www.google.com/bot.html)";
  const prefetchAgent = "E2E Prefetch Client";

  await request.get(AUDIO, {
    headers: { "user-agent": botAgent },
  });
  await request.get(AUDIO, {
    headers: {
      "user-agent": prefetchAgent,
      purpose: "prefetch",
    },
  });

  await expect
    .poll(() => eventFor(botAgent), { timeout: 5_000 })
    .toBeTruthy();
  await expect
    .poll(() => eventFor(prefetchAgent), { timeout: 5_000 })
    .toBeTruthy();

  const bot = eventFor(botAgent)!;
  const prefetch = eventFor(prefetchAgent)!;

  expect(bot.isBot).toBe(1);
  expect(bot.app).toBe("Bot");
  expect(prefetch.isBot).toBe(0);
  expect(prefetch.isPrefetch).toBe(1);
});
