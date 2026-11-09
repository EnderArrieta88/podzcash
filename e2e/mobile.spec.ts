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
