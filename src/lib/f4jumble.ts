import { blake2b } from "@noble/hashes/blake2.js";

/**
 * F4Jumble de ZIP-316: permutación usada para codificar Unified Addresses.
 * Se implementa aquí solo para poder inspeccionar los receptores de una UA.
 */

const H_LENGTH = 64;
const MAX_M = 4_194_368;

const H_PREFIX = "UA_F4Jumble_H";
const G_PREFIX = "UA_F4Jumble_G";

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function xor(left: Uint8Array, right: Uint8Array): Uint8Array {
  if (left.length !== right.length) {
    throw new Error("F4Jumble: longitudes incompatibles");
  }

  const result = new Uint8Array(left.length);
  for (let index = 0; index < left.length; index += 1) {
    result[index] = left[index] ^ right[index];
  }

  return result;
}

function personalization(prefix: string, suffix: number[]): Uint8Array {
  const bytes = concat(ascii(prefix), Uint8Array.from(suffix));

  if (bytes.length !== 16) {
    throw new Error("F4Jumble: personalización inválida");
  }

  return bytes;
}

function h(index: number, input: Uint8Array, length: number): Uint8Array {
  return blake2b(input, {
    dkLen: length,
    personalization: personalization(H_PREFIX, [index, 0, 0]),
  });
}

function g(index: number, input: Uint8Array, length: number): Uint8Array {
  const blocks: Uint8Array[] = [];
  const count = Math.ceil(length / H_LENGTH);

  for (let block = 0; block < count; block += 1) {
    blocks.push(
      blake2b(input, {
        dkLen: H_LENGTH,
        personalization: personalization(G_PREFIX, [
          index,
          block & 0xff,
          (block >> 8) & 0xff,
        ]),
      }),
    );
  }

  return concat(...blocks).slice(0, length);
}

function split(input: Uint8Array): {
  leftLength: number;
  rightLength: number;
  left: Uint8Array;
  right: Uint8Array;
} {
  if (input.length < 38 || input.length > MAX_M) {
    throw new Error("F4Jumble: longitud inválida");
  }

  const leftLength = Math.min(H_LENGTH, Math.floor(input.length / 2));
  const rightLength = input.length - leftLength;

  return {
    leftLength,
    rightLength,
    left: input.slice(0, leftLength),
    right: input.slice(leftLength),
  };
}

export function f4Jumble(input: Uint8Array): Uint8Array {
  const { leftLength, rightLength, left: a, right: b } = split(input);
  const x = xor(b, g(0, a, rightLength));
  const y = xor(a, h(0, x, leftLength));
  const d = xor(x, g(1, y, rightLength));
  const c = xor(y, h(1, d, leftLength));

  return concat(c, d);
}

export function f4JumbleInverse(input: Uint8Array): Uint8Array {
  const { leftLength, rightLength, left: c, right: d } = split(input);
  const y = xor(c, h(1, d, leftLength));
  const x = xor(d, g(1, y, rightLength));
  const a = xor(y, h(0, x, leftLength));
  const b = xor(x, g(0, a, rightLength));

  return concat(a, b);
}
