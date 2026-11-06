import { describe, expect, it } from "vitest";
import {
  formatInviteCode,
  normalizeInviteCode,
  parseLinks,
} from "./links";

describe("códigos de invitación", () => {
  it("normaliza espacios, guiones y minúsculas", () => {
    expect(normalizeInviteCode(" ab-cd 12 ")).toBe("ABCD12");
  });

  it("formatea en bloques de cinco", () => {
    expect(formatInviteCode("ABCDE12345")).toBe("ABCDE-12345");
  });
});

describe("enlaces de canal", () => {
  it("acepta una lista válida", () => {
    expect(
      parseLinks(JSON.stringify([{ label: "Web", url: "https://example.com" }])),
    ).toEqual([{ label: "Web", url: "https://example.com" }]);
  });

  it("ignora JSON inválido o URLs no válidas", () => {
    expect(parseLinks("no es json")).toEqual([]);
    expect(parseLinks(JSON.stringify([{ label: "Web", url: "no-es-url" }]))).toEqual(
      [],
    );
  });
});
