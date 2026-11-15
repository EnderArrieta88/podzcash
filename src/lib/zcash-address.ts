import type { Locale } from "@/lib/i18n/config";
import { addressMessages } from "@/lib/i18n/address";
import { f4JumbleInverse } from "@/lib/f4jumble";

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
 * Verifica el checksum Bech32/Bech32m y devuelve el payload en bytes.
 */
function decodeBech32(
  address: string,
  expectedHrp: string,
  expectedConst: number,
): Uint8Array | null {
  const separator = address.lastIndexOf("1");
  if (separator < 1 || separator + 7 > address.length) return null;

  const hrp = address.slice(0, separator);
  if (hrp !== expectedHrp) return null;

  const dataPart = address.slice(separator + 1);
  const values: number[] = [];

  for (const char of dataPart) {
    const value = BECH32_CHARSET.indexOf(char);
    if (value === -1) return null;
    values.push(value);
  }

  if (polymod([...hrpExpand(hrp), ...values]) !== expectedConst) return null;

  const payload = convertBits(values.slice(0, -6), 5, 8, false);
  return payload ? Uint8Array.from(payload) : null;
}

function readCompactSize(
  bytes: Uint8Array,
  offset: number,
): { value: number; offset: number } | null {
  if (offset >= bytes.length) return null;

  const first = bytes[offset];
  offset += 1;

  if (first < 0xfd) return { value: first, offset };

  const size = first === 0xfd ? 2 : first === 0xfe ? 4 : 8;
  if (offset + size > bytes.length) return null;

  let value = 0;
  for (let index = 0; index < size; index += 1) {
    value += bytes[offset + index] * 2 ** (8 * index);
  }

  const minimum =
    first === 0xfd ? 0xfd : first === 0xfe ? 0x10000 : 0x100000000;
  if (value < minimum || value > 0x2000000) return null;

  return { value, offset: offset + size };
}

/**
 * Comprueba que una Unified Address (Revision 0) contenga al menos un receptor
 * protegido y respete el orden y los tamaños de ZIP-316.
 */
function isValidUnifiedPayload(payload: Uint8Array): boolean {
  let unjumbled: Uint8Array;

  try {
    unjumbled = f4JumbleInverse(payload);
  } catch {
    return false;
  }

  const padding = new Uint8Array(16);
  padding.set(new TextEncoder().encode("u"));

  if (unjumbled.length < 16) return false;

  for (let index = 0; index < padding.length; index += 1) {
    if (
      unjumbled[unjumbled.length - padding.length + index] !== padding[index]
    ) {
      return false;
    }
  }

  const raw = unjumbled.slice(0, -padding.length);
  let offset = 0;
  let previous = -1;
  let items = 0;
  let hasShielded = false;
  let hasP2pkh = false;
  let hasP2sh = false;

  while (offset < raw.length) {
    const typecode = readCompactSize(raw, offset);
    if (!typecode) return false;
    offset = typecode.offset;

    const length = readCompactSize(raw, offset);
    if (!length) return false;
    offset = length.offset;

    if (typecode.value <= previous) return false;
    if (length.value < 0 || offset + length.value > raw.length) return false;

    // Revision 0 no admite Items MUST-understand.
    if (typecode.value >= 0xe0 && typecode.value <= 0xfc) return false;

    if (typecode.value === 0x00) {
      if (length.value !== 20) return false;
      hasP2pkh = true;
    } else if (typecode.value === 0x01) {
      if (length.value !== 20) return false;
      hasP2sh = true;
    } else if (typecode.value === 0x02 || typecode.value === 0x03) {
      if (length.value !== 43) return false;
      hasShielded = true;
    }

    previous = typecode.value;
    items += 1;
    offset += length.value;
  }

  return items > 0 && !(hasP2pkh && hasP2sh) && hasShielded;
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
    const payload = decodeBech32(lower, "zs", BECH32_CONST);

    if (!payload || payload.length !== 43) {
      return { ok: false, error: m.sapling };
    }

    return { ok: true, kind: "sapling", address: lower };
  }

  const payload = decodeBech32(lower, "u", BECH32M_CONST);

  if (!payload || !isValidUnifiedPayload(payload)) {
    return { ok: false, error: m.unified };
  }

  return { ok: true, kind: "unified", address: lower };
}
