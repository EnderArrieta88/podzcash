import { expect, test } from "@playwright/test";

test("la página de donaciones carga y muestra el formulario", async ({
  page,
}) => {
  const response = await page.goto("/canal/@e2e-canal/donar");

  expect(response?.status()).toBe(200);
  await expect(page.getByText(/Escanea con ZODL/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Abrir en wallet" }),
  ).toBeVisible();
  await expect(page.getByText("/ 512 bytes")).toBeVisible();
});
