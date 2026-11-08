import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run e2e:server",
    url: `${BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NODE_ENV: "production",
      DATABASE_URL: "file:./prisma/e2e.db",
      MEDIA_ROOT: "./.media-e2e",
      SEARCH_DB_PATH: "./.data-e2e/search.db",
      ANALYTICS_DB_PATH: "./.data-e2e/analytics.db",
      AUTH_SECRET:
        "e2e-secret-0123456789abcdef0123456789abcdef0123456789abcdef",
      SITE_URL: BASE_URL,
      EMAIL_FROM: "PodZcash E2E <e2e@podzcash.local>",
    },
  },
});
