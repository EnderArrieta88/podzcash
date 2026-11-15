import { describe, expect, it } from "vitest";
import { validateZcashAddress } from "./zcash-address";
import { addressMessages } from "./i18n/address";
import { f4Jumble } from "./f4jumble";

const es = addressMessages.es;

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32M_CONST = 0x2bc830a3;

function polymod(values: number[]): number {
  const generators = [
    0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
  ];
  let checksum = 1;

  for (const value of values) {
    const top = checksum >> 25;
    checksum = ((checksum & 0x1ffffff) << 5) ^ value;

    for (let index = 0; index < 5; index += 1) {
      if ((top >> index) & 1) checksum ^= generators[index];
    }
  }

  return checksum;
}

function hrpExpand(hrp: string): number[] {
  const high = [...hrp].map((char) => char.charCodeAt(0) >> 5);
  const low = [...hrp].map((char) => char.charCodeAt(0) & 31);
  return [...high, 0, ...low];
}

function toWords(bytes: Uint8Array): number[] {
  let accumulator = 0;
  let bits = 0;
  const result: number[] = [];

  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result.push((accumulator >> bits) & 31);
    }
  }

  if (bits > 0) result.push((accumulator << (5 - bits)) & 31);
  return result;
}

function encodeUnified(raw: Uint8Array): string {
  const padding = new Uint8Array(16);
  padding.set(new TextEncoder().encode("u"));

  const jumbled = f4Jumble(Uint8Array.from([...raw, ...padding]));
  const words = toWords(jumbled);
  const values = [...hrpExpand("u"), ...words, 0, 0, 0, 0, 0, 0];
  const check = polymod(values) ^ BECH32M_CONST;
  const checksum = [0, 1, 2, 3, 4, 5].map(
    (index) => (check >> (5 * (5 - index))) & 31,
  );

  return `u1${[...words, ...checksum].map((word) => CHARSET[word]).join("")}`;
}

function item(typecode: number, length: number): Uint8Array {
  return Uint8Array.from([typecode, length, ...new Uint8Array(length)]);
}

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

  it("rechaza una unificada que solo contiene un receptor transparente", () => {
    const address = encodeUnified(item(0x00, 20));

    expect(validateZcashAddress(address)).toEqual({
      ok: false,
      error: es.unified,
    });
  });

  it("acepta una unificada con receptor transparente y shielded", () => {
    const address = encodeUnified(
      Uint8Array.from([...item(0x00, 20), ...item(0x02, 43)]),
    );

    expect(validateZcashAddress(address)).toEqual({
      ok: true,
      kind: "unified",
      address,
    });
  });

  it("rechaza una unificada con typecodes duplicados", () => {
    const address = encodeUnified(
      Uint8Array.from([...item(0x02, 43), ...item(0x02, 43)]),
    );

    expect(validateZcashAddress(address)).toEqual({
      ok: false,
      error: es.unified,
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
