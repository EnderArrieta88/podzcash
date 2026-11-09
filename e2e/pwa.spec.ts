import { test, expect } from "@playwright/test";

test("expone manifest, iconos y service worker instalable", async ({
  request,
  page,
}) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.status()).toBe(200);

  const manifest = await manifestResponse.json();

  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.scope).toBe("/");
  expect(manifest.theme_color).toBe("#0b0d11");
  expect(
    manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === "maskable",
    ),
  ).toBe(true);

  for (const icon of manifest.icons as Array<{ src: string }>) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.status(), icon.src).toBe(200);
  }

  const worker = await request.get("/sw.js");
  expect(worker.status()).toBe(200);
  expect(worker.headers()["service-worker-allowed"]).toBe("/");

  const offline = await request.get("/offline");
  expect(offline.status()).toBe(200);
  expect(await offline.text()).toContain("Sin conexión");

  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    /manifest\.webmanifest/,
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#0b0d11",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    /apple-touch-icon\.png/,
  );
});

test("muestra la pantalla offline cuando no hay conexión", async ({
  page,
  context,
}) => {
  await page.goto("/");

  const scriptUrl = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL ?? null;
  });

  expect(scriptUrl).toContain("/sw.js");

  // La primera visita no está controlada por el service worker: recarga para
  // que intercepte las navegaciones.
  await page.reload();
  await page.waitForFunction(
    () => Boolean(navigator.serviceWorker.controller),
    undefined,
    { timeout: 15_000 },
  );

  await context.setOffline(true);

  try {
    await page.goto("/explorar");
    await expect(
      page.getByRole("heading", { name: "Sin conexión" }),
    ).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
