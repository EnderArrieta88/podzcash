import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const EMAIL = "e2e@podzcash.local";
const PASSWORD = "e2e-password-123";

const publicPages = [
  { path: "/", name: "home" },
  { path: "/explorar", name: "explorar" },
  { path: "/canal/@e2e-canal", name: "canal" },
  {
    path: "/canal/@e2e-canal/episodio-de-prueba-e2e",
    name: "episodio",
  },
  { path: "/entrar", name: "entrar" },
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

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );

  expect(serious, describeViolations(serious)).toEqual([]);
}

for (const page of publicPages) {
  test(`accesibilidad: ${page.name}`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await expectNoSeriousViolations(browserPage);
  });
}

test("accesibilidad: estudio", async ({ page }) => {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");

  await expectNoSeriousViolations(page);
});
