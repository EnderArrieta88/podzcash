import { describe, expect, it } from "vitest";
import { activeHref, isNavItemActive } from "./nav";

const rail = [
  { href: "/", exact: true },
  { href: "/explorar" },
  { href: "/descargas", exact: true },
  { href: "/estudio" },
  { href: "/estudio/admin" },
];

describe("navegación activa", () => {
  it("marca solo la ruta más específica", () => {
    expect(activeHref("/estudio/admin", rail)).toBe("/estudio/admin");
    expect(activeHref("/estudio/admin/usuarios", rail)).toBe("/estudio/admin");
    expect(activeHref("/estudio/episodios", rail)).toBe("/estudio");
    expect(activeHref("/estudio", rail)).toBe("/estudio");
  });

  it("no confunde rutas con prefijos parecidos", () => {
    expect(activeHref("/estudioz", rail)).toBeNull();
    expect(activeHref("/descargas", rail)).toBe("/descargas");
    expect(activeHref("/descargas/otra", rail)).toBeNull();
  });

  it("respeta exact en la home", () => {
    expect(activeHref("/", rail)).toBe("/");
    expect(isNavItemActive("/otra", { href: "/", exact: true })).toBe(false);
  });
});
