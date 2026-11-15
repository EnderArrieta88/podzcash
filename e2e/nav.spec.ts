import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth";

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
