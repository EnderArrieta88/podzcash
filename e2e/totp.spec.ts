import { test, expect, type Page } from "@playwright/test";
import { PASSWORD, loginAs } from "./auth";
import { currentTotp } from "./totp.mjs";

const EMAIL = "e2e-totp@podzcash.local";

async function submitLogin(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test("activa 2FA, entra con código y usa un código de recuperación", async ({
  page,
}) => {
  await loginAs(page, EMAIL);
  await page.goto("/estudio/cuenta");

  const card = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Seguridad" }) });

  await expect(card.getByText("Apps recomendadas")).toBeVisible();
  await expect(
    card.getByRole("link", { name: "Aegis", exact: true }),
  ).toHaveAttribute("href", "https://getaegis.app/");
  await expect(
    card.getByRole("link", { name: "Proton Authenticator", exact: true }),
  ).toHaveAttribute("href", "https://proton.me/authenticator");
  await expect(card.getByText("Si usas Google Authenticator")).toBeVisible();
  await expect(card.getByText(/Evita vincular tus 2FA/)).toBeVisible();

  await page.fill("#totp-start-password", PASSWORD);
  await card.getByRole("button", { name: "Activar 2FA" }).click();
  await expect(card.getByText("Clave manual")).toBeVisible();

  const secret = (await card.locator("code").innerText()).trim();
  expect(secret).toMatch(/^[A-Z2-7]+$/);

  await page.fill("#totp-confirm", currentTotp(secret));
  await page.getByRole("button", { name: "Confirmar y activar" }).click();

  await expect(page.getByText("2FA activo")).toBeVisible();

  const codes = card.locator("ul.font-mono li");
  await expect(codes).toHaveCount(8);
  const recoveryCode = (await codes.first().innerText()).trim();

  // Segundo paso del login con el código actual.
  await page.context().clearCookies();
  await submitLogin(page);
  await expect(page.locator("#totp")).toBeVisible();
  await page.fill("#totp", currentTotp(secret));
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");

  // Un código de recuperación también sirve para entrar una sola vez.
  await page.context().clearCookies();
  await submitLogin(page);
  await page.fill("#totp", recoveryCode);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");

  // Desactivar 2FA pide la contraseña.
  await page.goto("/estudio/cuenta");
  await page.fill("#totp-password", PASSWORD);
  await page.getByRole("button", { name: "Desactivar 2FA" }).click();

  await expect(page.getByRole("button", { name: "Activar 2FA" })).toBeVisible();
});
