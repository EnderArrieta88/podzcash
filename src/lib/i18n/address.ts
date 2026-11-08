import type { Locale } from "./config";

const es = {
  required: "Escribe tu dirección de Zcash.",
  spaces: "La dirección no puede tener espacios.",
  tooLong: "Esa dirección es demasiado larga.",
  testnet: "Esa dirección es de testnet. Usa una de mainnet.",
  sprout:
    "Las direcciones Sprout (zc…) están obsoletas. Usa una unificada (u1…) o Sapling (zs1…).",
  transparentForbidden:
    "No se aceptan direcciones transparentes (t1, t3, tex1): son públicas. Usa una unificada (u1…) o Sapling (zs1…).",
  sapling: "La dirección Sapling no es válida (checksum incorrecto).",
  unified: "La dirección unificada no es válida (checksum incorrecto).",
  mixedCase:
    "La dirección mezcla mayúsculas y minúsculas. Cópiala tal cual la genera tu wallet.",
  format:
    "No reconozco el formato. Debe ser una dirección unificada (u1…) o Sapling (zs1…).",
};

export type AddressMessages = typeof es;

const en: AddressMessages = {
  required: "Enter your Zcash address.",
  spaces: "The address cannot contain spaces.",
  tooLong: "That address is too long.",
  testnet: "That is a testnet address. Use a mainnet one.",
  sprout:
    "Sprout addresses (zc…) are deprecated. Use a unified (u1…) or Sapling (zs1…) address.",
  transparentForbidden:
    "Transparent addresses (t1, t3, tex1) are not allowed because they are public. Use a unified (u1…) or Sapling (zs1…) address.",
  sapling: "The Sapling address is invalid (bad checksum).",
  unified: "The unified address is invalid (bad checksum).",
  mixedCase:
    "The address mixes uppercase and lowercase. Paste it exactly as your wallet generates it.",
  format:
    "Unrecognized format. It must be a unified (u1…) or Sapling (zs1…) address.",
};

export const addressMessages: Record<Locale, AddressMessages> = { es, en };
