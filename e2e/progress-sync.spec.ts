import { test, expect, type Page } from "@playwright/test";

const EPISODE_PATH = "/canal/@e2e-canal/sincronizacion-e2e";
const EPISODE_TITLE = "Episodio de sincronización E2E";
const EPISODE_ID = "e2e_sync_episode";

async function loginAs(page: Page, email = "e2e@podzcash.local") {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", "e2e-password-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

async function playAndSeek(page: Page, seconds: number) {
  await page.goto(EPISODE_PATH);
  await page
    .getByRole("button", { name: `Reproducir ${EPISODE_TITLE}` })
    .first()
    .click();

  await page.waitForFunction(() => {
    const audio = document.querySelector("audio");
    return audio instanceof HTMLAudioElement && audio.duration > 20;
  });

  await page.evaluate((position) => {
    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement) audio.currentTime = position;
  }, seconds);

  // Pausar fuerza el guardado inmediato en el servidor.
  const saved = page.waitForResponse(
    (response) =>
      response.url().includes("/api/progress") &&
      response.request().method() === "PUT",
  );

  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect((await saved).status()).toBe(200);
}

test("la posición se sincroniza entre dos dispositivos", async ({
  page,
  browser,
}) => {
  await loginAs(page);
  await playAndSeek(page, 12);

  // Segundo "dispositivo": contexto limpio, misma cuenta.
  const deviceB = await browser.newContext();

  try {
    const pageB = await deviceB.newPage();
    await loginAs(pageB);
    await pageB.goto(EPISODE_PATH);
    await pageB
      .getByRole("button", { name: `Reproducir ${EPISODE_TITLE}` })
      .first()
      .click();

    await pageB.waitForFunction(
      () => {
        const audio = document.querySelector("audio");
        return audio instanceof HTMLAudioElement && audio.currentTime > 8;
      },
      undefined,
      { timeout: 15_000 },
    );
  } finally {
    await deviceB.close();
  }
});

test("el historial de progreso se puede borrar", async ({ page }) => {
  await loginAs(page);
  await playAndSeek(page, 10);

  const progress = await page.request.get(
    `/api/progress?episodeId=${EPISODE_ID}`,
  );
  expect(progress.status()).toBe(200);
  expect((await progress.json()).positionSec).toBeGreaterThanOrEqual(9);

  await page.goto("/estudio/cuenta");

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Borrar historial" }).click();

  await expect(
    page.getByText("Historial de reproducción borrado."),
  ).toBeVisible();

  const after = await page.request.get(`/api/progress?episodeId=${EPISODE_ID}`);
  expect(after.status()).toBe(200);
  expect(await after.json()).toBeNull();
});

test("sin sesión la posición sigue en localStorage y no hay errores", async ({
  page,
}) => {
  const progressRequests: string[] = [];

  page.on("request", (request) => {
    if (request.url().includes("/api/progress")) {
      progressRequests.push(request.method());
    }
  });

  await page.goto(EPISODE_PATH);
  await page
    .getByRole("button", { name: `Reproducir ${EPISODE_TITLE}` })
    .first()
    .click();

  await page.waitForFunction(() => {
    const audio = document.querySelector("audio");
    return audio instanceof HTMLAudioElement && audio.duration > 20;
  });

  await page.evaluate(() => {
    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement) audio.currentTime = 6;
  });

  // El snapshot local se guarda cada 2 s: esperar a que incluya la posición.
  await page.waitForFunction(
    () => {
      const raw = window.localStorage.getItem("podzcash:player");
      if (!raw) return false;

      try {
        const saved = JSON.parse(raw) as { time?: number };
        return typeof saved.time === "number" && saved.time > 4;
      } catch {
        return false;
      }
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.getByRole("button", { name: "Pausar", exact: true }).click();

  const saved = await page.evaluate(() =>
    window.localStorage.getItem("podzcash:player"),
  );

  expect(saved).toContain("e2e_sync_episode");
  expect(progressRequests).toEqual([]);

  // Al recargar, el reproductor restaura la posición local.
  await page.reload();
  await page.waitForFunction(
    () => {
      const audio = document.querySelector("audio");
      return audio instanceof HTMLAudioElement && audio.currentTime > 2;
    },
    undefined,
    { timeout: 15_000 },
  );
});
