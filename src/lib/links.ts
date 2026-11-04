import { randomBytes } from "node:crypto";
import { z } from "zod";

// Sin caracteres ambigos (0/O, 1/I/L) para dictar el código por voz o chat.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 10;

export function generateInviteCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += ALPHABET[bytes[index] % ALPHABET.length];
  }

  return code;
}

export function normalizeInviteCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

export const linkListSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(30),
      url: z.url(),
    }),
  )
  .max(5);

export type ChannelLink = z.infer<typeof linkListSchema>[number];

export function parseLinks(raw: string | null): ChannelLink[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const result = linkListSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}
