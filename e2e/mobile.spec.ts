import { test, expect, type Page } from "@playwright/test";

const EMAIL = "e2e@podzcash.local";
const PASSWORD = "e2e-password-123";

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("la lista de episodios se adapta al móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/estudio/episodios");

  const row = page
    .locator("li")
    .filter({ hasText: "Episodio de prueba E2E" })
    .first();

  await expect(row).toBeVisible();
  await expect(row.getByText("Publicado", { exact: true })).toBeVisible();
  await expect(row.getByRole("link", { name: "Ver episodio" })).toBeVisible();
  await expect(row.getByRole("link", { name: "Editar episodio" })).toBeVisible();
  await expect(row.getByText("privacidad")).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(overflow).toBe(false);

  await page.screenshot({
    path: "test-results/episodes-mobile.png",
    fullPage: false,
  });
});

test("la barra del reproductor muestra título y canal en el móvil", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/canal/@e2e-canal/episodio-de-prueba-e2e");
  await page
    .getByRole("button", { name: "Reproducir Episodio de prueba E2E" })
    .first()
    .click();

  const bar = page.locator(".player-bar");

  await expect(bar).toBeVisible();

  const title = bar.getByText("Episodio de prueba E2E", { exact: true });
  const channel = bar.getByRole("link", { name: "Canal E2E" });

  await expect(title).toBeVisible();
  await expect(channel).toBeVisible();

  // El título ocupa el ancho disponible en vez de quedar recortado a un
  // par de caracteres por los controles.
  const titleBox = await title.boundingBox();
  expect(titleBox?.width ?? 0).toBeGreaterThan(150);

  const channelBox = await channel.boundingBox();
  expect(channelBox?.width ?? 0).toBeGreaterThan(60);

  // Los controles siguen accesibles en la fila propia.
  await expect(
    bar.getByRole("button", { name: "Retroceder 15 segundos" }),
  ).toBeVisible();
  await expect(
    bar.getByRole("button", { name: "Avanzar 15 segundos" }),
  ).toBeVisible();
  await expect(
    bar.getByRole("button", { name: "Episodio anterior" }),
  ).toBeVisible();
  await expect(
    bar.getByRole("button", { name: "Siguiente episodio" }),
  ).toBeVisible();
  await expect(bar.getByRole("button", { name: /^Cola/ })).toBeVisible();
  await expect(
    bar.getByRole("button", { name: "Temporizador de sueño" }),
  ).toBeVisible();
  await expect(
    bar.getByRole("button", { name: "Cerrar reproductor" }),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(overflow).toBe(false);

  await page.screenshot({
    path: "test-results/player-mobile.png",
    fullPage: false,
  });
});
