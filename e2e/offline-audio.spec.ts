import { test, expect } from "@playwright/test";

const EPISODE_PATH = "/canal/@e2e-canal/episodio-de-prueba-e2e";
const AUDIO_PATH = "/media/audio/e2e_channel/e2e.wav";

test("descarga, gestiona y reproduce un episodio sin red", async ({
  page,
  context,
}) => {
  await page.goto(EPISODE_PATH);
  await page.evaluate(() => navigator.serviceWorker.ready);

  // Descarga: el botón pasa a "Descargado".
  await page.getByRole("button", { name: "Descargar" }).click();
  await expect(page.getByText("Descargado", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  // No se duplica: una sola entrada de audio en Cache Storage.
  const cached = await page.evaluate(async () => {
    const cache = await caches.open("podzcash-audio-v1");
    const keys = await cache.keys();

    return keys.map((key) => new URL(key.url).pathname);
  });

  expect(cached).toEqual([AUDIO_PATH]);

  // La página de descargas muestra el episodio y el espacio usado.
  await page.goto("/descargas");
  await expect(
    page.getByRole("heading", { name: "Descargas", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Episodio de prueba E2E")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Espacio usado" }),
  ).toBeVisible();
  await expect(page.getByText(/\d+(\.\d+)? (KB|MB) \/ /)).toBeVisible();

  // Borrar libera el espacio y deja el estado vacío.
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Borrar", exact: true }).click();
  await expect(
    page.getByText("Todavía no descargaste ningún episodio."),
  ).toBeVisible();

  const afterDelete = await page.evaluate(async () => {
    const cache = await caches.open("podzcash-audio-v1");
    return (await cache.keys()).length;
  });

  expect(afterDelete).toBe(0);

  // Descarga de nuevo para probar la reproducción offline.
  await page.goto(EPISODE_PATH);
  await page.getByRole("button", { name: "Descargar" }).click();
  await expect(page.getByText("Descargado", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  // Recarga para que el service worker controle la página.
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

    // La pantalla offline lista y reproduce la descarga sin red.
    await expect(page.getByText("Episodio de prueba E2E")).toBeVisible();
    await page.getByRole("button", { name: "Reproducir" }).click();

    await page.waitForFunction(
      () => {
        const audio = document.querySelector("audio");
        return audio instanceof HTMLAudioElement && audio.currentTime > 0;
      },
      undefined,
      { timeout: 20_000 },
    );

    // Buscar dentro del episodio sin red: el service worker responde 206
    // desde la caché de descargas.
    await page.evaluate(() => {
      const audio = document.querySelector("audio");
      if (audio instanceof HTMLAudioElement) audio.currentTime = 2;
    });

    await page.waitForFunction(
      () => {
        const audio = document.querySelector("audio");
        return audio instanceof HTMLAudioElement && audio.currentTime > 1.5;
      },
      undefined,
      { timeout: 20_000 },
    );
  } finally {
    await context.setOffline(false);
  }
});
