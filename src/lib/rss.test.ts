import { describe, expect, it } from "vitest";
import { cdata, escapeXml, itunesDuration } from "./rss";

describe("escapeXml", () => {
  it("escapa los caracteres reservados", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;",
    );
  });

  it("elimina caracteres de control", () => {
    expect(escapeXml("hola\u0000mundo")).toBe("holamundo");
  });
});

describe("cdata", () => {
  it("rompe la secuencia de cierre de CDATA", () => {
    expect(cdata("a]]>b")).toBe("<![CDATA[a]]]]><![CDATA[>b]]>");
  });
});

describe("itunesDuration", () => {
  it("formatea horas, minutos y segundos", () => {
    expect(itunesDuration(3661)).toBe("01:01:01");
    expect(itunesDuration(65)).toBe("00:01:05");
  });
});
