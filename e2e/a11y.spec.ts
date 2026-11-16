import AxeBuilder from "@axe-core/playwright";
import { expect, test, devices, type Page } from "@playwright/test";
import { loginAsAdmin } from "./auth";

const EMAIL = "e2e@podzcash.local";
const PASSWORD = "e2e-password-123";
const EPISODE_TITLE = "Episodio de prueba E2E";

const publicPages = [
  { path: "/", name: "inicio" },
  { path: "/explorar", name: "explorar" },
  { path: "/canal/@e2e-canal", name: "canal" },
  {
    path: "/canal/@e2e-canal/episodio-de-prueba-e2e",
    name: "episodio",
  },
  { path: "/canal/@e2e-canal/donar", name: "donar" },
  { path: "/entrar", name: "entrar" },
  { path: "/registro", name: "registro" },
  { path: "/recuperar", name: "recuperar" },
  { path: "/lista-de-espera", name: "lista de espera" },
  { path: "/descargas", name: "descargas" },
  { path: "/offline", name: "sin conexión" },
  { path: "/proyecto", name: "proyecto" },
  { path: "/acerca", name: "acerca" },
  { path: "/privacidad", name: "privacidad" },
  { path: "/terminos", name: "términos" },
  { path: "/accesibilidad", name: "accesibilidad" },
  { path: "/cuenta-eliminada", name: "cuenta eliminada" },
  { path: "/embed/e2e_episode", name: "embed" },
];

const studioPages = [
  { path: "/estudio", name: "panel del estudio" },
  { path: "/estudio/cuenta", name: "cuenta" },
  { path: "/estudio/canal", name: "canal del estudio" },
  { path: "/estudio/episodios", name: "episodios" },
  { path: "/estudio/episodios/nuevo", name: "nuevo episodio" },
  { path: "/estudio/episodios/e2e_episode", name: "editar episodio" },
  {
    path: "/estudio/episodios/e2e_episode/analitica",
    name: "analítica del episodio",
  },
  { path: "/estudio/comentarios", name: "comentarios" },
  { path: "/estudio/distribucion", name: "distribución" },
];

const adminPages = [
  { path: "/estudio/admin", name: "administración" },
  { path: "/estudio/invitaciones", name: "invitaciones" },
];

function describeViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(" "))
        .join(", ");
      return `${violation.id} (${violation.impact}): ${violation.help} → ${targets}`;
    })
    .join("\n");
}

async function expectNoSeriousViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );

  expect(serious, `${label}\n${describeViolations(serious)}`).toEqual([]);
}

async function login(page: Page, email: string) {
  await page.goto("/entrar");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

for (const page of publicPages) {
  test(`accesibilidad: ${page.name}`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await expectNoSeriousViolations(browserPage, `${page.name} (${page.path})`);
  });
}

test.describe("accesibilidad del estudio", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, EMAIL);
  });

  for (const route of studioPages) {
    test(`accesibilidad: ${route.name}`, async ({ page }) => {
      await page.goto(route.path);
      await expectNoSeriousViolations(page, `${route.name} (${route.path})`);
    });
  }
});

test.describe("accesibilidad de administración", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const route of adminPages) {
    test(`accesibilidad: ${route.name}`, async ({ page }) => {
      await page.goto(route.path);
      await expectNoSeriousViolations(page, `${route.name} (${route.path})`);
    });
  }
});

test("accesibilidad: reproductor abierto", async ({ page }) => {
  await page.goto("/canal/@e2e-canal/episodio-de-prueba-e2e");

  const play = page
    .getByRole("button", { name: `Reproducir ${EPISODE_TITLE}` })
    .first();
  await play.focus();
  await expect(play).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("button", { name: "Cerrar reproductor" }),
  ).toBeVisible();

  await expectNoSeriousViolations(page, "reproductor abierto");
});

test("accesibilidad: el formulario de acceso se envía con teclado", async ({
  page,
}) => {
  await page.goto("/entrar");

  await page.getByLabel("Email").focus();
  await page.keyboard.type("teclado@podzcash.local");
  await page.keyboard.press("Tab");
  await page.keyboard.type("contraseña-inválida");
  await page.keyboard.press("Enter");

  await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
});

test("accesibilidad: el primer tab llega al enlace de salto", async ({
  page,
}) => {
  await page.goto("/");

  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await page.keyboard.press("Tab");

  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#contenido");

  await page.keyboard.press("Enter");
  await expect(page.locator("#contenido")).toBeFocused();
});

test("accesibilidad: inicio en móvil", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await context.newPage();

  try {
    await page.goto("/");
    await expectNoSeriousViolations(page, "inicio en móvil");
  } finally {
    await context.close();
  }
});
