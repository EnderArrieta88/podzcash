import { createHash } from "node:crypto";

export type AddressKind = "transparent" | "sapling" | "unified";

export type AddressValidation =
  | { ok: true; kind: AddressKind; address: string }
  | { ok: false; error: string };

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

const BECH32_CONST = 1;
const BECH32M_CONST = 0x2bc830a3;

function sha256(data: Uint8Array): Buffer {
  return createHash("sha256").update(data).digest();
}

function decodeBase58(input: string): Uint8Array | null {
  const bytes: number[] = [];

  for (const char of input) {
    const value = BASE58_ALPHABET.indexOf(char);
    if (value === -1) return null;

    let carry = value;

    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of input) {
    if (char !== "1") break;
    bytes.push(0);
  }

  return Uint8Array.from(bytes.reverse());
}

function hasValidBase58Check(address: string): boolean {
  const decoded = decodeBase58(address);
  if (!decoded || decoded.length < 5) return false;

  const payload = decoded.subarray(0, decoded.length - 4);
  const checksum = decoded.subarray(decoded.length - 4);
  const expected = sha256(sha256(payload)).subarray(0, 4);

  return Buffer.from(checksum).equals(expected);
}

function polymod(values: number[]): number {
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
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

/**
 * Verifica el checksum Bech32 o Bech32m. Las direcciones Sapling usan Bech32
 * y las unificadas Bech32m; aceptamos ambas variantes para no rechazar una
 * dirección válida por la versión del checksum.
 */
function hasValidBech32Checksum(address: string, expectedHrp: string): boolean {
  const separator = address.lastIndexOf("1");
  if (separator < 1 || separator + 7 > address.length) return false;

  const hrp = address.slice(0, separator);
  if (hrp !== expectedHrp) return false;

  const dataPart = address.slice(separator + 1);
  const data: number[] = [];

  for (const char of dataPart) {
    const value = BECH32_CHARSET.indexOf(char);
    if (value === -1) return false;
    data.push(value);
  }

  const checksum = polymod([...hrpExpand(hrp), ...data]);
  return checksum === BECH32_CONST || checksum === BECH32M_CONST;
}

/**
 * Valida una dirección de Zcash de mainnet.
 * - t1/t3: Base58Check con checksum real.
 * - zs1: Bech32 (Sapling).
 * - u1: Bech32m (Unified Address).
 */
export function validateZcashAddress(raw: string): AddressValidation {
  const address = raw.trim();

  if (!address) {
    return { ok: false, error: "Escribe tu dirección de Zcash." };
  }

  if (/\s/.test(address)) {
    return { ok: false, error: "La dirección no puede tener espacios." };
  }

  if (address.length > 200) {
    return { ok: false, error: "Esa dirección es demasiado larga." };
  }

  const lower = address.toLowerCase();

  if (
    lower.startsWith("ztestsapling") ||
    lower.startsWith("utest") ||
    lower.startsWith("tm") ||
    lower.startsWith("t2")
  ) {
    return {
      ok: false,
      error: "Esa dirección es de testnet. Usa una de mainnet.",
    };
  }

  if (lower.startsWith("zc")) {
    return {
      ok: false,
      error:
        "Las direcciones Sprout (zc…) están obsoletas. Usa una unificada (u1…) o Sapling (zs1…).",
    };
  }

  if (lower.startsWith("t1") || lower.startsWith("t3")) {
    if (address.length !== 35 || !hasValidBase58Check(address)) {
      return {
        ok: false,
        error: "La dirección transparente no es válida (checksum incorrecto).",
      };
    }

    return { ok: true, kind: "transparent", address };
  }

  if (lower.startsWith("zs1")) {
    if (!hasValidBech32Checksum(lower, "zs")) {
      return {
        ok: false,
        error: "La dirección Sapling no es válida (checksum incorrecto).",
      };
    }

    return { ok: true, kind: "sapling", address: lower };
  }

  if (lower.startsWith("u1")) {
    if (!hasValidBech32Checksum(lower, "u")) {
      return {
        ok: false,
        error: "La dirección unificada no es válida (checksum incorrecto).",
      };
    }

    return { ok: true, kind: "unified", address: lower };
  }

  return {
    ok: false,
    error: "No reconozco el formato. Debe empezar con u1, zs1, t1 o t3.",
  };
}

export function addressKindLabel(kind: AddressKind): string {
  switch (kind) {
    case "unified":
      return "Unificada";
    case "sapling":
      return "Sapling";
    case "transparent":
      return "Transparente";
  }
}
