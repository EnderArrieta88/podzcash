import { describe, expect, it } from "vitest";
import { validateZcashAddress } from "./zcash-address";
import { addressMessages } from "./i18n/address";

const es = addressMessages.es;

const UNIFIED =
  "u1xfe95y0lw3eznadwvv5k4f26xq0h5ppucyeucmnzuff2r8l2jmg7v5pqlvnvkl645ucpejjvsgg8rh2zpw9f055cp0zpl7w8hqt6pwsy";
const SAPLING =
  "zs1cpf4prtmnqpg6x2ngcrwelu9a39z9l9lqukq9fwagnaqrknk34a7n3szwxpjuxfjdxkuzykel53";
const TRANSPARENT_T1 = "t1goiSyw2JinFCmUnfiwwp72LEZzD42TyYu";
const TRANSPARENT_T3 = "t3ev37Q2uL1sfTsiJQJiWJoFzQpDhmnUwYo";

function invalidChecksum(address: string): string {
  const last = address.at(-1) === "q" ? "p" : "q";
  return address.slice(0, -1) + last;
}

describe("validateZcashAddress", () => {
  it("acepta una dirección unificada (u1) de mainnet", () => {
    expect(validateZcashAddress(UNIFIED)).toEqual({
      ok: true,
      kind: "unified",
      address: UNIFIED,
    });
  });

  it("acepta una dirección Sapling (zs1) de mainnet", () => {
    expect(validateZcashAddress(SAPLING)).toEqual({
      ok: true,
      kind: "sapling",
      address: SAPLING,
    });
  });

  it("acepta direcciones en mayúsculas y las normaliza", () => {
    expect(validateZcashAddress(UNIFIED.toUpperCase())).toEqual({
      ok: true,
      kind: "unified",
      address: UNIFIED,
    });
    expect(validateZcashAddress(SAPLING.toUpperCase())).toEqual({
      ok: true,
      kind: "sapling",
      address: SAPLING,
    });
  });

  it("rechaza direcciones transparentes t1, t3 y tex1", () => {
    for (const address of [
      TRANSPARENT_T1,
      TRANSPARENT_T3,
      `tex1${"q".repeat(60)}`,
    ]) {
      expect(validateZcashAddress(address)).toEqual({
        ok: false,
        error: es.transparentForbidden,
      });
    }
  });

  it("rechaza checksums inválidos", () => {
    expect(validateZcashAddress(invalidChecksum(UNIFIED))).toEqual({
      ok: false,
      error: es.unified,
    });
    expect(validateZcashAddress(invalidChecksum(SAPLING))).toEqual({
      ok: false,
      error: es.sapling,
    });
  });

  it("rechaza payloads con largo incorrecto", () => {
    expect(validateZcashAddress(`u1${"q".repeat(100)}`)).toEqual({
      ok: false,
      error: es.unified,
    });
    expect(validateZcashAddress(`zs1${"q".repeat(75)}`)).toEqual({
      ok: false,
      error: es.sapling,
    });
  });

  it("rechaza mayúsculas y minúsculas mezcladas", () => {
    const mixed = UNIFIED.slice(0, 5).toUpperCase() + UNIFIED.slice(5);
    expect(validateZcashAddress(mixed)).toEqual({
      ok: false,
      error: es.mixedCase,
    });
  });

  it("rechaza direcciones de testnet", () => {
    for (const address of [
      `utest1${"q".repeat(50)}`,
      `ztestsapling1${"q".repeat(50)}`,
      `tm${"a".repeat(33)}`,
      `t2${"a".repeat(33)}`,
    ]) {
      expect(validateZcashAddress(address)).toEqual({
        ok: false,
        error: es.testnet,
      });
    }
  });

  it("rechaza direcciones Sprout", () => {
    expect(validateZcashAddress(`zc${"a".repeat(50)}`)).toEqual({
      ok: false,
      error: es.sprout,
    });
  });

  it("rechaza formatos que no son de Zcash", () => {
    expect(validateZcashAddress(`bc1q${"a".repeat(40)}`)).toEqual({
      ok: false,
      error: es.format,
    });
    expect(validateZcashAddress("no-es-una-direccion")).toEqual({
      ok: false,
      error: es.format,
    });
  });

  it("rechaza vacío, espacios y direcciones demasiado largas", () => {
    expect(validateZcashAddress("")).toEqual({
      ok: false,
      error: es.required,
    });
    expect(
      validateZcashAddress(`${UNIFIED.slice(0, 10)} ${UNIFIED.slice(10)}`),
    ).toEqual({
      ok: false,
      error: es.spaces,
    });
    expect(validateZcashAddress(`u1${"q".repeat(399)}`)).toEqual({
      ok: false,
      error: es.tooLong,
    });
  });

  it("recorta espacios al inicio y al final", () => {
    expect(validateZcashAddress(`  ${UNIFIED}  `)).toEqual({
      ok: true,
      kind: "unified",
      address: UNIFIED,
    });
  });
});
