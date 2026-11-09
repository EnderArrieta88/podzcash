import { describe, expect, it } from "vitest";
import { pageParam } from "./pagination";

describe("pageParam", () => {
  it("usa 1 cuando el parámetro falta o no es válido", () => {
    expect(pageParam(undefined)).toBe(1);
    expect(pageParam("")).toBe(1);
    expect(pageParam("abc")).toBe(1);
    expect(pageParam("0")).toBe(1);
    expect(pageParam("-3")).toBe(1);
  });

  it("acepta números de página y el primer valor de un array", () => {
    expect(pageParam("3")).toBe(3);
    expect(pageParam(["2", "9"])).toBe(2);
    expect(pageParam("1.9")).toBe(1);
  });
});
