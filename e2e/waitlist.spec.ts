import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./auth";

const EMAIL = "waitlist-e2e@podzcash.local";

test("la lista de espera guarda una solicitud y aparece en administración", async ({
  page,
}) => {
  await page.goto("/lista-de-espera");
  await page.fill("#waitlist-name", "Persona E2E");
  await page.fill("#waitlist-email", EMAIL);
  await page.selectOption("#waitlist-role", "music");
  await page.fill("#waitlist-note", "Quiere publicar música");
  await page.getByRole("button", { name: "Anotarme" }).click();

  await expect(page.getByText("Estás en la lista")).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("/estudio/admin");

  await expect(page.getByText(EMAIL)).toBeVisible();
});
