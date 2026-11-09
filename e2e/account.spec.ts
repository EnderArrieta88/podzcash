import { existsSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { test, expect, type Page } from "@playwright/test";

const EMAIL = "e2e-delete@podzcash.local";
const PASSWORD = "e2e-password-123";

test.describe.configure({ mode: "serial" });

async function login(page: Page) {
  await page.goto("/entrar");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/estudio");
}

test("exporta los datos de la cuenta en JSON", async ({ page }) => {
  await login(page);

  const response = await page.request.get("/estudio/cuenta/exportar");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toContain("attachment");
  expect(response.headers()["cache-control"]).toContain("no-store");

  const data = await response.json();

  expect(data.format).toBe("podzcash-account-export");
  expect(data.account.email).toBe(EMAIL);
  expect(data.account.passwordHash).toBeUndefined();
  expect(data.channel.handle).toBe("e2e-borrar");
  expect(
    data.channel.episodes.some(
      (episode: { slug: string }) => episode.slug === "borrar-cuenta-e2e",
    ),
  ).toBe(true);
  expect(
    data.comments.some(
      (comment: { body: string }) => comment.body === "Comentario a borrar",
    ),
  ).toBe(true);
  expect(data.playbackProgress.length).toBeGreaterThan(0);
  expect(data.reportsFiled.length).toBeGreaterThan(0);
  expect(data.invitations.used.code).toBe("E2EDELETE02");
  expect(data.waitlist.length).toBe(1);
  expect(data.sessions[0].token).toBeUndefined();
  expect(JSON.stringify(data)).not.toContain("passwordHash");
});

test("elimina la cuenta con reautenticación y confirmación", async ({
  page,
}) => {
  await login(page);
  await page.goto("/estudio/cuenta");

  const submit = page.getByRole("button", { name: "Eliminar mi cuenta" });

  // Contraseña incorrecta.
  await page.fill("#delete-password", "incorrecta");
  await page.fill("#delete-confirmation", EMAIL);
  await page.check('input[name="acknowledge"]');
  await submit.click();
  await expect(
    page.getByText("La contraseña no es correcta."),
  ).toBeVisible();

  // Confirmación incorrecta.
  await page.fill("#delete-password", PASSWORD);
  await page.fill("#delete-confirmation", "otro@ejemplo.com");
  await page.check('input[name="acknowledge"]');
  await submit.click();
  await expect(
    page.getByText(/Escribe tu email exactamente/),
  ).toBeVisible();

  // Eliminación definitiva.
  await page.fill("#delete-password", PASSWORD);
  await page.fill("#delete-confirmation", EMAIL);
  await page.check('input[name="acknowledge"]');
  await submit.click();

  await page.waitForURL("**/cuenta-eliminada");
  await expect(
    page.getByRole("heading", { name: "Cuenta eliminada" }),
  ).toBeVisible();

  const channel = await page.request.get(
    "/canal/@e2e-borrar/borrar-cuenta-e2e",
  );
  expect(channel.status()).toBe(404);

  const db = new Database(path.join(process.cwd(), "prisma", "e2e.db"), {
    readonly: true,
  });

  const user = db
    .prepare('SELECT "id" FROM "User" WHERE "id" = ?')
    .get("e2e_delete_user");
  const report = db
    .prepare(
      'SELECT "reporterId", "reporterEmail" FROM "Report" WHERE "id" = ?',
    )
    .get("e2e_delete_report") as {
    reporterId: string | null;
    reporterEmail: string | null;
  };
  const waitlist = db
    .prepare('SELECT "id" FROM "WaitlistEntry" WHERE "email" = ?')
    .get(EMAIL);
  const invites = db
    .prepare('SELECT "id" FROM "Invite" WHERE "id" IN (?, ?)')
    .all("e2e_delete_invite", "e2e_delete_invite_used");

  db.close();

  expect(user).toBeUndefined();
  expect(report.reporterId).toBeNull();
  expect(report.reporterEmail).toBeNull();
  expect(waitlist).toBeUndefined();
  expect(invites).toHaveLength(0);
  expect(
    existsSync(
      path.join(process.cwd(), ".media-e2e", "audio", "e2e_delete", "delete.wav"),
    ),
  ).toBe(false);
});
