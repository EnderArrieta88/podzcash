import type { Page } from "@playwright/test";
import { currentTotp } from "./totp.mjs";

export const PASSWORD = "e2e-password-123";
export const ADMIN_EMAIL = "e2e-admin@podzcash.local";

async function submitCredentials(page: Page, email: string) {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

export async function loginAs(page: Page, email: string) {
  await submitCredentials(page, email);
  await page.waitForURL("**/estudio");
}

/** El admin de E2E tiene 2FA activo: completa el segundo paso del login. */
export async function loginAsAdmin(page: Page) {
  await submitCredentials(page, ADMIN_EMAIL);
  await page.fill("#totp", currentTotp());
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}
