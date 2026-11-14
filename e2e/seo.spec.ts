import { expect, test } from "@playwright/test";

const CHANNEL = "e2e-canal";
const EPISODE = "episodio-de-prueba-e2e";

test("metadatos sociales del canal y su imagen OG", async ({ page }) => {
  await page.goto(`/canal/@${CHANNEL}`);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new RegExp(`/canal/@${CHANNEL}$`),
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /E2E/,
  );
  const image = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(image).toMatch(/\/canal\/@e2e-canal\/og$/);

  const response = await page.request.get(`/canal/@${CHANNEL}/og`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).subarray(1, 4).toString()).toBe("PNG");
});

test("metadatos sociales del episodio y su imagen OG", async ({ page }) => {
  await page.goto(`/canal/@${CHANNEL}/${EPISODE}`);

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  const image = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(image).toMatch(new RegExp(`/canal/@${CHANNEL}/${EPISODE}/og$`));

  const response = await page.request.get(`/canal/@${CHANNEL}/${EPISODE}/og`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("las imágenes OG inexistentes responden 404", async ({ page }) => {
  const channel = await page.request.get("/canal/@no-existe/og");
  expect(channel.status()).toBe(404);

  const episode = await page.request.get("/canal/@no-existe/no-existe/og");
  expect(episode.status()).toBe(404);
});

test("el sitemap incluye canal y episodio", async ({ page }) => {
  const response = await page.request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  expect(xml).toContain(`/canal/@${CHANNEL}`);
  expect(xml).toContain(`/canal/@${CHANNEL}/${EPISODE}`);
});

test("el JSON-LD de canal y episodio es válido", async ({ page }) => {
  for (const path of [`/canal/@${CHANNEL}`, `/canal/@${CHANNEL}/${EPISODE}`]) {
    await page.goto(path);
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const text = await scripts.nth(index).textContent();
      expect(() => JSON.parse(text ?? "")).not.toThrow();
    }
  }
});
