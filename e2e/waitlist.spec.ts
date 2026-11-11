import { test, expect, type Page } from "@playwright/test";

const EMAIL = "waitlist-e2e@podzcash.local";
const ADMIN_EMAIL = "e2e-admin@podzcash.local";
const PASSWORD = "e2e-password-123";

async function loginAdmin(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

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

  await loginAdmin(page);
  await page.goto("/estudio/admin");

  await expect(page.getByText(EMAIL)).toBeVisible();
});
