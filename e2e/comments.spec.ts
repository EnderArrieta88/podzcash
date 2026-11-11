import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "e2e-password-123";
const CHANNEL = "e2e-canal";
const EPISODE_SLUG = "episodio-de-prueba-e2e";

test.describe.configure({ mode: "serial" });

async function loginAs(page: Page, email: string) {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

const login = (page: Page) => loginAs(page, "e2e@podzcash.local");

const episodePath = `/canal/@${CHANNEL}/${EPISODE_SLUG}`;

test("pagina los comentarios sin perder ninguno", async ({ page }) => {
  await login(page);
  await page.goto(episodePath);

  await expect(page.getByText("Comentarios · 25")).toBeVisible();
  await expect(page.getByText("Comentario de prueba 25")).toBeVisible();
  await expect(page.getByText("Comentario de prueba 06")).toBeVisible();
  await expect(page.getByText("Comentario de prueba 05")).toHaveCount(0);

  await page.getByRole("link", { name: "Más antiguos" }).click();
  await expect(page).toHaveURL(/comentarios=2/);
  await expect(page.getByText("Comentario de prueba 05")).toBeVisible();
  await expect(page.getByText("Comentario de prueba 01")).toBeVisible();
  await expect(page.getByText("Comentario de prueba 25")).toHaveCount(0);

  await page.getByRole("link", { name: "Más recientes" }).click();
  await expect(page).toHaveURL(/comentarios=1/);
  await expect(page.getByText("Comentario de prueba 25")).toBeVisible();
});

test("un usuario reporta un comentario y llega a la cola", async ({ page }) => {
  await login(page);
  await page.goto(episodePath);

  const comment = page
    .locator("li")
    .filter({ hasText: "Comentario de prueba 25" });
  await comment.getByRole("link", { name: "Reportar" }).click();

  await expect(page.getByText("Reportar comentario")).toBeVisible();
  await page.selectOption("#reason", "spam");
  await page.fill("#details", "Reporte E2E de comentario");
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(
    page.getByText("Gracias. Recibimos el reporte y lo vamos a revisar."),
  ).toBeVisible();
});

test("el admin resuelve el reporte y borra el comentario", async ({ page }) => {
  await loginAs(page, "e2e-admin@podzcash.local");
  await page.goto("/estudio/admin");

  const report = page
    .locator("li")
    .filter({ hasText: "Reporte E2E de comentario" });
  await expect(report).toBeVisible();
  await expect(
    page.getByText("Comentario de E2E Author").first(),
  ).toBeVisible();

  await report.getByRole("button", { name: "Eliminar comentario" }).click();

  await expect(page.getByText("Reporte E2E de comentario")).toHaveCount(0);

  await page.goto(episodePath);
  await expect(page.getByText("Comentario de prueba 25")).toHaveCount(0);
});

test("la bandeja del creador lista comentarios y guarda la preferencia", async ({
  page,
}) => {
  await login(page);
  await page.goto("/estudio/comentarios");

  await expect(
    page.getByRole("heading", { name: "Comentarios", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Comentario de prueba 24")).toBeVisible();

  await page.selectOption('select[name="commentNotify"]', "off");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();

  await expect(page.getByText("Preferencia guardada.")).toBeVisible();
});
