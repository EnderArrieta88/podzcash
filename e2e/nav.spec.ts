import { test, expect } from "@playwright/test";
import { loginAs, loginAsAdmin } from "./auth";

test("solo la sección más específica queda activa en el menú", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto("/estudio/admin");

  const rail = page.locator("aside[data-rail]");
  const admin = rail.getByRole("link", { name: "Administración", exact: true });
  const studio = rail.getByRole("link", { name: "Mi estudio", exact: true });

  await expect(admin).toHaveAttribute("aria-current", "page");
  await expect(studio).not.toHaveAttribute("aria-current", "page");

  await page.goto("/estudio/episodios");

  await expect(studio).toHaveAttribute("aria-current", "page");
  await expect(admin).not.toHaveAttribute("aria-current", "page");
});

test("el canal público no muestra el rail del estudio", async ({ page }) => {
  await page.goto("/canal/@e2e-canal");

  await expect(page.locator("aside[data-rail]")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Explorar", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Tu podcast, con su propia casa")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Pedir una invitación" }),
  ).toBeVisible();
});

test("desde una página pública se puede volver al estudio", async ({
  page,
}) => {
  await loginAs(page, "e2e@podzcash.local");
  await page.goto("/canal/@e2e-canal");

  await expect(page.getByText("Tu podcast, con su propia casa")).toHaveCount(0);

  const studio = page
    .getByRole("link", { name: "Mi estudio", exact: true })
    .first();

  await expect(studio).toBeVisible();
  await studio.click();
  await page.waitForURL("**/estudio");
  await expect(page.locator("aside[data-rail]")).toBeVisible();
});
