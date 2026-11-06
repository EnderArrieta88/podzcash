import type { Locale } from "./config";

const es = {
  required: "Escribe tu dirección de Zcash.",
  spaces: "La dirección no puede tener espacios.",
  tooLong: "Esa dirección es demasiado larga.",
  testnet: "Esa dirección es de testnet. Usa una de mainnet.",
  sprout:
    "Las direcciones Sprout (zc…) están obsoletas. Usa una unificada (u1…) o Sapling (zs1…).",
  transparent:
    "La dirección transparente no es válida (checksum incorrecto).",
  sapling: "La dirección Sapling no es válida (checksum incorrecto).",
  unified: "La dirección unificada no es válida (checksum incorrecto).",
  format: "No reconozco el formato. Debe empezar con u1, zs1, t1 o t3.",
};

export type AddressMessages = typeof es;

const en: AddressMessages = {
  required: "Enter your Zcash address.",
  spaces: "The address cannot contain spaces.",
  tooLong: "That address is too long.",
  testnet: "That is a testnet address. Use a mainnet one.",
  sprout:
    "Sprout addresses (zc…) are deprecated. Use a unified (u1…) or Sapling (zs1…) address.",
  transparent: "The transparent address is invalid (bad checksum).",
  sapling: "The Sapling address is invalid (bad checksum).",
  unified: "The unified address is invalid (bad checksum).",
  format: "Unrecognized format. It must start with u1, zs1, t1 or t3.",
};

export const addressMessages: Record<Locale, AddressMessages> = { es, en };
