import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "e2e-password-123";

async function loginAs(page: Page, email: string) {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("solo la sección más específica queda activa en el menú", async ({
  page,
}) => {
  await loginAs(page, "e2e-admin@podzcash.local");
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
