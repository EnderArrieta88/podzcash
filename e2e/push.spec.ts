import { test, expect, devices, type Page } from "@playwright/test";

const EMAIL = "e2e-admin@podzcash.local";
const PASSWORD = "e2e-password-123";

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("los avisos push solo se ofrecen en el móvil", async ({ browser }) => {
  const mobile = await browser.newContext({ ...devices["Pixel 5"] });
  const mobilePage = await mobile.newPage();

  await login(mobilePage);
  await mobilePage.goto("/estudio/admin");
  await expect(mobilePage.getByText("Avisos en el móvil")).toBeVisible();

  await mobile.close();

  const desktop = await browser.newContext();
  const desktopPage = await desktop.newPage();

  await login(desktopPage);
  await desktopPage.goto("/estudio/admin");
  await expect(desktopPage.getByText("Avisos en el móvil")).toHaveCount(0);
  await expect(
    desktopPage.getByText(
      "Los avisos de la lista de espera se activan desde el teléfono.",
    ),
  ).toBeVisible();

  await desktop.close();
});
