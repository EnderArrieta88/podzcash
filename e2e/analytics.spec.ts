import { test, expect, type Page } from "@playwright/test";
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

const ANALYTICS_DB = path.join(process.cwd(), ".data-e2e", "analytics.db");
const AUDIO = "/media/audio/e2e_channel/e2e.wav";
const ANALYTICS_AUDIO = "/media/audio/e2e_channel/analytics.wav";

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", "e2e@podzcash.local");
  await page.fill("#password", "e2e-password-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

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

  await expect.poll(() => eventFor(userAgent), { timeout: 5_000 }).toBeTruthy();

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

  await expect.poll(() => eventFor(botAgent), { timeout: 5_000 }).toBeTruthy();
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

test("el dashboard muestra descargas brutas, válidas y clientes únicos", async ({
  request,
  page,
}) => {
  const statsAgent = "E2E Stats Client";
  const shortAgent = "E2E Stats Short";
  const botAgent = "E2E Stats Bot/1.0 (Googlebot/2.1)";
  const prefetchAgent = "E2E Stats Prefetch";

  await request.get(ANALYTICS_AUDIO, {
    headers: {
      Range: "bytes=0-19999",
      "user-agent": statsAgent,
      "x-forwarded-for": "198.51.100.7",
    },
  });
  await request.get(ANALYTICS_AUDIO, {
    headers: {
      Range: "bytes=20000-39999",
      "user-agent": statsAgent,
      "x-forwarded-for": "198.51.100.7",
    },
  });
  await request.get(ANALYTICS_AUDIO, {
    headers: {
      Range: "bytes=0-999",
      "user-agent": shortAgent,
      "x-forwarded-for": "198.51.100.8",
    },
  });
  await request.get(ANALYTICS_AUDIO, {
    headers: { "user-agent": botAgent },
  });
  await request.get(ANALYTICS_AUDIO, {
    headers: { "user-agent": prefetchAgent, purpose: "prefetch" },
  });

  for (const agent of [statsAgent, shortAgent, botAgent, prefetchAgent]) {
    await expect.poll(() => eventFor(agent), { timeout: 5_000 }).toBeTruthy();
  }

  await login(page);
  await page.goto("/estudio/episodios/e2e_analytics_episode");

  await expect(page.getByTestId("analytics-raw")).toHaveText("5");
  await expect(page.getByTestId("analytics-valid")).toHaveText("1");
  await expect(page.getByTestId("analytics-clients")).toHaveText("2");

  const dailyStats = () => {
    const db = new Database(ANALYTICS_DB, { readonly: true });

    try {
      return db
        .prepare(
          `SELECT day, episodeId, rawDownloads, validDownloads, starts, verifiedListens, uniqueClients, bytes
           FROM daily_stats WHERE episodeId = ?`,
        )
        .all("e2e_analytics_episode") as Array<Record<string, unknown>>;
    } finally {
      db.close();
    }
  };

  const first = dailyStats();
  expect(first).toHaveLength(1);
  expect(first[0]).toMatchObject({
    episodeId: "e2e_analytics_episode",
    rawDownloads: 5,
    validDownloads: 1,
    starts: 0,
    verifiedListens: 0,
    uniqueClients: 2,
  });

  await page.reload();
  await expect(page.getByTestId("analytics-raw")).toHaveText("5");
  expect(dailyStats()).toEqual(first);
});

test("dashboard completo, retención y exportación CSV", async ({
  request,
  page,
}) => {
  const progressA = "E2E Progress A";
  const progressB = "E2E Progress B";

  await request.post("/api/analytics/progress", {
    headers: { "user-agent": progressA, "x-forwarded-for": "198.51.100.30" },
    data: { id: "e2e_analytics_episode", position: 2, duration: 4 },
  });
  await request.post("/api/analytics/progress", {
    headers: { "user-agent": progressB, "x-forwarded-for": "198.51.100.31" },
    data: { id: "e2e_analytics_episode", position: 4, duration: 4 },
  });

  await login(page);
  await page.goto("/estudio/episodios/e2e_analytics_episode/analitica");

  await expect(page.getByTestId("summary-raw")).toHaveText("5");
  await expect(page.getByTestId("summary-valid")).toHaveText("1");
  await expect(page.getByTestId("summary-clients")).toHaveText("2");
  await expect(page.getByTestId("retention-50")).toHaveText("2");
  await expect(page.getByTestId("retention-100")).toHaveText("1");

  const csv = await page.request.get(
    "/estudio/episodios/e2e_analytics_episode/analitica/export",
  );
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const body = await csv.text();
  expect(body).toContain("day,rawDownloads");
  expect(body).toContain("total");
});
