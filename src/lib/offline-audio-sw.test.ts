import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OFFLINE_AUDIO_CACHE } from "./offline-audio";

const source = readFileSync(
  path.join(process.cwd(), "public", "sw.js"),
  "utf8",
);

describe("service worker y descargas offline", () => {
  it("usa la misma caché de audio que el cliente", () => {
    expect(source).toContain(`"${OFFLINE_AUDIO_CACHE}"`);
  });

  it("sirve audio descargado con rangos para poder buscar", () => {
    expect(source).toContain('const AUDIO_PREFIX = "/media/audio/"');
    expect(source).toContain("Content-Range");
    expect(source).toContain("206");
  });

  it("precachea la pantalla offline y sus scripts", () => {
    expect(source).toContain("precacheOfflineShell");
    expect(source).toContain("_next/static/");
  });

  it("no borra la caché de audio al actualizar el service worker", () => {
    expect(source).toContain('key.startsWith("podzcash-shell-")');
    expect(source).toContain('key.startsWith("podzcash-static-")');
    expect(source).not.toContain('key.startsWith("podzcash-audio-")');
  });
});
