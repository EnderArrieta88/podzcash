import { test, expect, type Page } from "@playwright/test";
import sharp from "sharp";

const EMAIL = "e2e@podzcash.local";
const PASSWORD = "e2e-password-123";
const CHANNEL = "e2e-canal";
const EPISODE_SLUG = "episodio-de-prueba-e2e";
const EPISODE_TITLE = "Episodio de prueba E2E";
const EPISODE_ID = "e2e_episode";

test.describe.configure({ mode: "serial" });

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

function makeWav(seconds = 4, sampleRate = 8000): Buffer {
  const samples = seconds * sampleRate;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

test("login y validación de dirección Zcash", async ({ page }) => {
  await login(page);
  await page.goto("/estudio/canal");

  await expect(page.locator("#zcashAddress")).toHaveValue(/^u1/);

  await page.fill(
    "#zcashAddress",
    "t1goiSyw2JinFCmUnfiwwp72LEZzD42TyYu",
  );
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();

  await expect(
    page.getByText("No se aceptan direcciones transparentes"),
  ).toBeVisible();
});

test("rechaza una portada que no cumple Apple", async ({ page }) => {
  await login(page);
  await page.goto("/estudio/episodios/nuevo");

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64",
  );

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
    name: "portada.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });

  await expect(
    page.getByText("La portada tiene que ser cuadrada y medir entre 1400 y 3000 px."),
  ).toBeVisible({ timeout: 15_000 });
});

test("sube una portada válida y la deriva a JPEG", async ({ page }) => {
  await login(page);
  await page.goto("/estudio/episodios/nuevo");

  const validPng = await sharp({
    create: {
      width: 1500,
      height: 1500,
      channels: 3,
      background: { r: 220, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();

  await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
    name: "portada.png",
    mimeType: "image/png",
    buffer: validPng,
  });

  const preview = page.locator('img[src^="/media/covers/"]');
  await expect(preview).toBeVisible({ timeout: 20_000 });
  await expect(preview).toHaveAttribute("src", /\.jpg$/);
});

test("crear borrador, publicarlo y abrir el episodio", async ({ page }) => {
  await login(page);
  await page.goto("/estudio/episodios/nuevo");

  await page
    .locator('input[type="file"][accept="audio/*"]')
    .setInputFiles({
      name: "e2e-audio.wav",
      mimeType: "audio/wav",
      buffer: makeWav(),
    });

  await expect(page.getByText("e2e-audio.wav")).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByRole("button", { name: "Guardar borrador", exact: true }),
  ).toBeEnabled();

  await page.fill("#title", "Borrador E2E");
  await page.fill("#description", "Episodio creado por el smoke test.");
  await page.fill("#tags", "e2e, prueba");

  await page
    .getByRole("button", { name: "Guardar borrador", exact: true })
    .click();
  await page.waitForURL("**/estudio/episodios");

  const draftRow = page.locator("li").filter({ hasText: "Borrador E2E" });
  await expect(draftRow.getByText("Borrador", { exact: true })).toBeVisible();

  await draftRow.getByRole("link", { name: "Editar episodio" }).click();
  await page.waitForURL(/\/estudio\/episodios\/.+/);
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await page.waitForURL("**/estudio/episodios");

  const publishedRow = page.locator("li").filter({ hasText: "Borrador E2E" });
  await expect(
    publishedRow.getByText("Publicado", { exact: true }),
  ).toBeVisible();

  const href = await publishedRow
    .getByRole("link", { name: "Ver episodio" })
    .getAttribute("href");

  expect(href).toBeTruthy();
  await page.goto(href!);
  await expect(
    page.getByRole("heading", { name: "Borrador E2E" }),
  ).toBeVisible();
});

test("comentar, reproducir y cargar el embed", async ({ page }) => {
  await login(page);
  await page.goto(`/canal/@${CHANNEL}/${EPISODE_SLUG}`);

  await page.fill("#comment-body", "Comentario E2E");
  await page.getByRole("button", { name: "Publicar comentario" }).click();
  await expect(page.getByText("Comentario E2E", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: `Reproducir ${EPISODE_TITLE}` })
    .first()
    .click();
  await expect(
    page
      .getByRole("button", { name: `Pausar ${EPISODE_TITLE}` })
      .first(),
  ).toBeVisible();

  await page.goto(`/embed/${EPISODE_ID}`);
  await expect(page.getByText(EPISODE_TITLE).last()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reproducir", exact: true }),
  ).toBeVisible();
});
