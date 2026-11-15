import { expect, test } from "@playwright/test";

test("Ctrl+K o Cmd+K enfoca el buscador de Explorar", async ({ page }) => {
  await page.goto("/explorar");

  const search = page.locator("[data-search-primary]");
  await page.keyboard.press("Control+K");
  await expect(search).toBeFocused();

  await search.fill("prueba");
  await search.press("Enter");

  await expect(page).toHaveURL(/\/explorar\?q=prueba/);
});

test("Ctrl+K o Cmd+K enfoca el buscador global fuera de Explorar", async ({
  page,
}) => {
  await page.goto("/canal/@e2e-canal");

  const search = page.locator("[data-global-search]");
  await page.keyboard.press("Control+K");
  await expect(search).toBeFocused();
});
