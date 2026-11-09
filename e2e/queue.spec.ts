import { test, expect } from "@playwright/test";

const EPISODE_1 = "/canal/@e2e-canal/episodio-de-prueba-e2e";
const EPISODE_2 = "/canal/@e2e-canal/analitica-e2e";
const TITLE_1 = "Episodio de prueba E2E";
const TITLE_2 = "Episodio de analítica E2E";

test("cola: agregar, reordenar, persistir y navegar", async ({ page }) => {
  await page.goto(EPISODE_1);
  await page.getByRole("button", { name: "Añadir a la cola" }).click();
  await expect(
    page.getByRole("button", { name: "En la cola" }),
  ).toBeVisible();

  await page.goto(EPISODE_2);
  await page.getByRole("button", { name: "Añadir a la cola" }).click();
  await expect(
    page.getByRole("button", { name: "En la cola" }),
  ).toBeVisible();

  // Reproducir el primero abre la barra.
  await page.goto(EPISODE_1);
  await page
    .getByRole("button", { name: `Reproducir ${TITLE_1}` })
    .first()
    .click();

  await page.getByRole("button", { name: /^Cola/ }).click();

  const dialog = page.getByRole("dialog", { name: "Cola de reproducción" });

  await expect(dialog.getByText(TITLE_1)).toBeVisible();
  await expect(dialog.getByText(TITLE_2)).toBeVisible();

  const bar = page.locator(".player-bar");

  // Siguiente y anterior desde la barra.
  await page.getByRole("button", { name: "Siguiente episodio" }).click();
  await expect(bar.getByText(TITLE_2)).toBeVisible();

  await page.getByRole("button", { name: "Episodio anterior" }).click();
  await expect(bar.getByText(TITLE_1)).toBeVisible();

  // Reordenar: bajar el primero deja la cola como [TITLE_2, TITLE_1].
  await page.getByRole("button", { name: /^Cola/ }).click();
  await page
    .getByRole("dialog", { name: "Cola de reproducción" })
    .getByRole("button", { name: "Bajar en la cola" })
    .first()
    .click();

  // Con el episodio actual al final, "siguiente" queda deshabilitado.
  await expect(
    page.getByRole("button", { name: "Siguiente episodio" }),
  ).toBeDisabled();

  // La cola sobrevive a la recarga.
  await page.reload();
  await expect(page.locator(".player-bar").getByText(TITLE_1)).toBeVisible();
  await page.getByRole("button", { name: /^Cola/ }).click();

  const reloaded = page.getByRole("dialog", { name: "Cola de reproducción" });
  const down = reloaded.getByRole("button", { name: "Bajar en la cola" });

  await expect(down.first()).toBeEnabled();
  await expect(down.last()).toBeDisabled();

  // Quitar de la cola actualiza el contador.
  await reloaded
    .getByRole("button", { name: "Quitar de la cola" })
    .first()
    .click();
  await expect(page.getByRole("button", { name: /^Cola \(1\)/ })).toBeVisible();
});

test("temporizador de sueño: opciones, persistencia y cancelar", async ({
  page,
}) => {
  await page.goto(EPISODE_1);
  await page
    .getByRole("button", { name: `Reproducir ${TITLE_1}` })
    .first()
    .click();

  await page.getByRole("button", { name: "Temporizador de sueño" }).click();

  const dialog = page.getByRole("dialog", { name: "Temporizador de sueño" });

  for (const minutes of [10, 20, 30, 45, 60]) {
    await expect(
      dialog.getByRole("button", { name: `${minutes} min` }),
    ).toBeVisible();
  }

  await dialog.getByRole("button", { name: "30 min" }).click();

  const sleepButton = page.getByRole("button", {
    name: "Temporizador de sueño",
  });

  await expect(sleepButton).toContainText(/2[89]:\d{2}|30:00/);

  // El temporizador persiste al recargar.
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Temporizador de sueño" }),
  ).toContainText(/2[89]:\d{2}/);

  // Se puede cancelar.
  await page.getByRole("button", { name: "Temporizador de sueño" }).click();
  await page.getByRole("button", { name: "Cancelar temporizador" }).click();

  await expect(
    page.getByRole("button", { name: "Temporizador de sueño" }),
  ).not.toContainText(":");
});
