import { z } from "zod";

export const RESERVED_HANDLES = new Set([
  "admin",
  "administrador",
  "api",
  "ayuda",
  "c",
  "canal",
  "canales",
  "cuenta",
  "entrar",
  "estudio",
  "explorar",
  "media",
  "nosotros",
  "podzcash",
  "privacidad",
  "registro",
  "salir",
  "soporte",
  "terminos",
  "terminos-y-condiciones",
]);

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "El handle necesita al menos 3 caracteres.")
  .max(30, "El handle no puede pasar de 30 caracteres.")
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/,
    "Solo minúsculas, números y guiones. No puede empezar ni terminar con guion.",
  )
  .refine((value) => !RESERVED_HANDLES.has(value), {
    message: "Ese handle está reservado. Elige otro.",
  });

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre.")
    .max(60, "El nombre es demasiado largo."),
  email: z
    .email("Escribe un email válido.")
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña necesita al menos 8 caracteres.")
    .max(100, "La contraseña es demasiado larga."),
  inviteCode: z.string().trim().max(64).optional(),
});

export const loginSchema = z.object({
  email: z
    .email("Escribe un email válido.")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Escribe tu contraseña."),
});

export const channelSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "El nombre del canal necesita al menos 2 caracteres.")
    .max(60, "El nombre del canal es demasiado largo."),
  handle: handleSchema,
  bio: z.string().trim().max(500, "La bio no puede pasar de 500 caracteres."),
});

export const episodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "El título necesita al menos 2 caracteres.")
    .max(140, "El título no puede pasar de 140 caracteres."),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción no puede pasar de 5000 caracteres."),
  kind: z.enum(["podcast", "music"], {
    message: "Elige podcast o música.",
  }),
  tags: z.string().trim().max(240).optional(),
});

export type EpisodeInput = z.infer<typeof episodeSchema>;

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}
