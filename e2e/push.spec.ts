import { test, expect, devices } from "@playwright/test";
import { loginAsAdmin } from "./auth";

test("los avisos push solo se ofrecen en el móvil", async ({ browser }) => {
  const mobile = await browser.newContext({ ...devices["Pixel 5"] });
  const mobilePage = await mobile.newPage();

  await loginAsAdmin(mobilePage);
  await mobilePage.goto("/estudio/admin");
  await expect(mobilePage.getByText("Avisos en el móvil")).toBeVisible();

  await mobile.close();

  const desktop = await browser.newContext();
  const desktopPage = await desktop.newPage();

  await loginAsAdmin(desktopPage);
  await desktopPage.goto("/estudio/admin");
  await expect(desktopPage.getByText("Avisos en el móvil")).toHaveCount(0);
  await expect(
    desktopPage.getByText(
      "Los avisos de la lista de espera se activan desde el teléfono.",
    ),
  ).toBeVisible();

  await desktop.close();
});
