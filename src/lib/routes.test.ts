import { describe, expect, it } from "vitest";
import {
  channelPath,
  donatePath,
  episodePath,
  feedPath,
  normalizeHandleParam,
} from "./routes";

describe("rutas públicas", () => {
  it("construye la URL del canal con @", () => {
    expect(channelPath("nora-vela")).toBe("/canal/@nora-vela");
  });

  it("construye la URL del episodio", () => {
    expect(episodePath("nora-vela", "mi-episodio")).toBe(
      "/canal/@nora-vela/mi-episodio",
    );
  });

  it("construye las URLs de donación y feed", () => {
    expect(donatePath("nora-vela")).toBe("/canal/@nora-vela/donar");
    expect(feedPath("nora-vela")).toBe("/canal/@nora-vela/feed.xml");
  });

  it("normaliza el parámetro con @, encoding y mayúsculas", () => {
    expect(normalizeHandleParam("@Nora-Vela")).toBe("nora-vela");
    expect(normalizeHandleParam("%40Nora-Vela")).toBe("nora-vela");
    expect(normalizeHandleParam("nora-vela")).toBe("nora-vela");
  });
});
