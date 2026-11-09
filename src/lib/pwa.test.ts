import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OFFLINE_PATH, PWA_THEME_COLOR, pwaManifest } from "./pwa";

describe("manifest de la PWA", () => {
  it("declara una app instalable en modo standalone", () => {
    expect(pwaManifest.name).toBe("PodZcash");
    expect(pwaManifest.display).toBe("standalone");
    expect(pwaManifest.start_url).toBe("/");
    expect(pwaManifest.scope).toBe("/");
    expect(pwaManifest.theme_color).toBe(PWA_THEME_COLOR);
  });

  it("incluye iconos 192, 512 y maskable", () => {
    const icons = pwaManifest.icons ?? [];
    const sizes = icons.map((icon) => icon.sizes);

    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(
      icons.some(
        (icon) => icon.purpose === "maskable" && icon.sizes === "512x512",
      ),
    ).toBe(true);

    for (const icon of icons) {
      expect(icon.src).toMatch(/^\/icons\/.+\.png$/);
      expect(icon.type).toBe("image/png");
    }
  });
});

describe("service worker", () => {
  const source = readFileSync(
    path.join(process.cwd(), "public", "sw.js"),
    "utf8",
  );

  it("precachea la pantalla offline, el manifest y los iconos", () => {
    expect(source).toContain(`"${OFFLINE_PATH}"`);
    expect(source).toContain("/manifest.webmanifest");
    expect(source).toContain("/icons/icon-192.png");
    expect(source).toContain("/icons/maskable-512.png");
  });

  it("nunca cachea API, media ni embed", () => {
    expect(source).toContain('"/api/"');
    expect(source).toContain('"/media/"');
    expect(source).toContain('"/embed/"');
  });

  it("usa network-first para navegaciones con fallback offline", () => {
    expect(source).toContain('request.mode === "navigate"');
    expect(source).toContain("offlineResponse()");
  });

  it("versiona las cachés y limpia las anteriores", () => {
    expect(source).toMatch(/const VERSION = "v\d+"/);
    expect(source).toContain("caches.delete");
  });
});
