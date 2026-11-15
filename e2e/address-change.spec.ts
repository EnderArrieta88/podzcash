import { expect, test, type Page } from "@playwright/test";

const EMAIL = "e2e@podzcash.local";
const PASSWORD = "e2e-password-123";
const SAPLING =
  "zs1cpf4prtmnqpg6x2ngcrwelu9a39z9l9lqukq9fwagnaqrknk34a7n3szwxpjuxfjdxkuzykel53";

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("protege el cambio de dirección ZEC", async ({ page }) => {
  await login(page);
  await page.goto("/estudio/canal");

  const input = page.locator("#zcashAddress");
  const original = await input.inputValue();
  const next = original.startsWith("zs1")
    ? "u1xfe95y0lw3eznadwvv5k4f26xq0h5ppucyeucmnzuff2r8l2jmg7v5pqlvnvkl645ucpejjvsgg8rh2zpw9f055cp0zpl7w8hqt6pwsy"
    : SAPLING;
  const save = page.getByRole("button", {
    name: "Guardar cambios",
    exact: true,
  });

  await input.fill(next);
  await expect(page.locator("#currentPassword")).toBeVisible();
  await page.fill("#currentPassword", "incorrecta");
  await save.click();
  await expect(page.getByText("La contraseña no es correcta.")).toBeVisible();

  await page.fill("#currentPassword", PASSWORD);
  await save.click();
  await expect(page.getByText("Canal guardado.")).toBeVisible();
  await expect(
    page.locator("section").filter({ hasText: "Historial de dirección" }),
  ).toContainText(next);

  // Restaura la dirección original para no alterar el resto de la suite.
  await input.fill(original);
  await page.fill("#currentPassword", PASSWORD);
  await save.click();
  await expect(page.getByText("Canal guardado.")).toBeVisible();
});
