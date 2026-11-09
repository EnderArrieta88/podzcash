import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", "e2e@podzcash.local");
  await page.fill("#password", "e2e-password-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("cerrar sesión desde el menú de cuenta", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Menú de cuenta" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();

  await page.waitForURL("**/");

  await page.goto("/estudio");
  await page.waitForURL("**/entrar");
});
