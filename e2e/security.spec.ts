import { test, expect } from "@playwright/test";

test("las páginas traen CSP con nonce y HSTS endurecido", async ({
  request,
}) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);

  const csp = home.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("nonce-");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("report-uri /api/csp-report");

  const hsts = home.headers()["strict-transport-security"];
  expect(hsts).toContain("includeSubDomains");
  expect(hsts).toContain("preload");

  const nonce = csp?.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();

  const html = await home.text();
  expect(html).toContain(`nonce="${nonce}"`);
});

test("el embed se puede enmarcar y el resto no", async ({ request }) => {
  const embed = await request.get("/embed/e2e_episode");

  expect(embed.status()).toBe(200);
  expect(embed.headers()["content-security-policy"]).toContain(
    "frame-ancestors *",
  );
  expect(embed.headers()["x-frame-options"]).toBeUndefined();

  const page = await request.get("/");
  expect(page.headers()["x-frame-options"]).toBe("SAMEORIGIN");
});

test("el endpoint de reportes CSP acepta un reporte", async ({ request }) => {
  const response = await request.post("/api/csp-report", {
    headers: { "content-type": "application/csp-report" },
    data: {
      "csp-report": {
        "document-uri":
          "https://podzcash.online/canal/@e2e-canal/episodio-de-prueba-e2e",
        "violated-directive": "img-src",
        "blocked-uri": "https://example.com/tracker.png",
      },
    },
  });

  expect(response.status()).toBe(204);
});
