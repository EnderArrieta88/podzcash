import type { Locale } from "@/lib/i18n/config";
import { addressMessages } from "@/lib/i18n/address";

export type AddressKind = "sapling" | "unified";

export type AddressValidation =
  | { ok: true; kind: AddressKind; address: string }
  | { ok: false; error: string };

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

const BECH32_CONST = 1;
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
  const high: number[] = [];
  const low: number[] = [];

  for (const char of hrp) {
    high.push(char.charCodeAt(0) >> 5);
    low.push(char.charCodeAt(0) & 31);
  }

  return [...high, 0, ...low];
}

function convertBits(
  data: number[],
  from: number,
  to: number,
  pad: boolean,
): number[] | null {
  let accumulator = 0;
  let bits = 0;
  const result: number[] = [];
  const maxValue = (1 << to) - 1;

  for (const value of data) {
    if (value < 0 || value >> from !== 0) return null;

    accumulator = (accumulator << from) | value;
    bits += from;

    while (bits >= to) {
      bits -= to;
      result.push((accumulator >> bits) & maxValue);
    }
  }

  if (pad) {
    if (bits > 0) {
      result.push((accumulator << (to - bits)) & maxValue);
    }
  } else if (bits >= from) {
    return null;
  }

  return result;
}

/**
 * Verifica el checksum Bech32/Bech32m y, opcionalmente, el largo del payload.
 * Sapling (zs1) usa Bech32 sobre 43 bytes; Unified (u1) usa Bech32m.
 */
function hasValidBech32Checksum(
  address: string,
  expectedHrp: string,
  expectedConst: number,
  expectedPayloadBytes?: number,
): boolean {
  const separator = address.lastIndexOf("1");
  if (separator < 1 || separator + 7 > address.length) return false;

  const hrp = address.slice(0, separator);
  if (hrp !== expectedHrp) return false;

  const dataPart = address.slice(separator + 1);
  const values: number[] = [];

  for (const char of dataPart) {
    const value = BECH32_CHARSET.indexOf(char);
    if (value === -1) return false;
    values.push(value);
  }

  if (polymod([...hrpExpand(hrp), ...values]) !== expectedConst) return false;

  if (expectedPayloadBytes !== undefined) {
    const payload = convertBits(values.slice(0, -6), 5, 8, false);
    if (!payload || payload.length !== expectedPayloadBytes) return false;
  }

  return true;
}

/**
 * Valida una dirección de Zcash de mainnet y acepta únicamente direcciones
 * protegidas:
 * - u1: Unified Address (Bech32m).
 * - zs1: Sapling (Bech32).
 *
 * Se rechazan las transparentes (t1, t3, tex1), las Sprout (zc) y testnet.
 */
export function validateZcashAddress(
  raw: string,
  locale: Locale = "es",
): AddressValidation {
  const address = raw.trim();
  const m = addressMessages[locale];

  if (!address) {
    return { ok: false, error: m.required };
  }

  if (/\s/.test(address)) {
    return { ok: false, error: m.spaces };
  }

  if (address.length > 400) {
    return { ok: false, error: m.tooLong };
  }

  const lower = address.toLowerCase();

  if (
    lower.startsWith("ztestsapling") ||
    lower.startsWith("utest") ||
    lower.startsWith("tm") ||
    lower.startsWith("t2")
  ) {
    return { ok: false, error: m.testnet };
  }

  if (lower.startsWith("zc")) {
    return { ok: false, error: m.sprout };
  }

  if (
    lower.startsWith("t1") ||
    lower.startsWith("t3") ||
    lower.startsWith("tex1")
  ) {
    return { ok: false, error: m.transparentForbidden };
  }

  const isSapling = lower.startsWith("zs1");
  const isUnified = lower.startsWith("u1");

  if (!isSapling && !isUnified) {
    return { ok: false, error: m.format };
  }

  if (address !== lower && address !== address.toUpperCase()) {
    return { ok: false, error: m.mixedCase };
  }

  if (isSapling) {
    if (!hasValidBech32Checksum(lower, "zs", BECH32_CONST, 43)) {
      return { ok: false, error: m.sapling };
    }

    return { ok: true, kind: "sapling", address: lower };
  }

  if (!hasValidBech32Checksum(lower, "u", BECH32M_CONST)) {
    return { ok: false, error: m.unified };
  }

  return { ok: true, kind: "unified", address: lower };
}
