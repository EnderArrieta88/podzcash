import { chromium } from "@playwright/test";

const base = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3100";
const paths = (
  process.env.PERF_PATHS ??
  "/,/explorar,/canal/@e2e-canal,/canal/@e2e-canal/episodio-de-prueba-e2e"
)
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const browser = await chromium.launch();

for (const path of paths) {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0 };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perf.lcp = Math.max(window.__perf.lcp, entry.startTime);
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__perf.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  const started = Date.now();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  const loadMs = Date.now() - started;
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const sum = (type) =>
      resources
        .filter((entry) => entry.initiatorType === type)
        .reduce((total, entry) => total + (entry.transferSize ?? 0), 0);
    const navigation = performance.getEntriesByType("navigation")[0];

    return {
      jsBytes: sum("script"),
      cssBytes: sum("stylesheet"),
      imageBytes: sum("img"),
      totalBytes: resources.reduce(
        (total, entry) => total + (entry.transferSize ?? 0),
        0,
      ),
      domContentLoadedMs: Math.round(navigation?.domContentLoadedEventEnd ?? 0),
      loadEventMs: Math.round(navigation?.loadEventEnd ?? 0),
      lcpMs: Math.round(window.__perf.lcp),
      cls: Number(window.__perf.cls.toFixed(4)),
    };
  });

  console.log(JSON.stringify({ path, loadMs, ...metrics }, null, 2));

  await context.close();
}

await browser.close();
