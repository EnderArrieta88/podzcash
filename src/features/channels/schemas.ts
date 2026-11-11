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
  .min(3, "usernameMin")
  .max(30, "usernameMax")
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/, "usernameChars")
  .refine((value) => !RESERVED_HANDLES.has(value), {
    message: "usernameReserved",
  });

export const channelSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "channelNameMin")
    .max(60, "channelNameMax"),
  handle: handleSchema,
  bio: z.string().trim().max(500, "bioMax"),
  zcashAddress: z.string().trim().max(400, "zcashAddressMax").optional(),
  feedLanguage: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "feedLanguageInvalid")
    .max(10, "feedLanguageInvalid")
    .regex(/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/, "feedLanguageInvalid")
    .default("es"),
  feedCategory: z
    .string()
    .trim()
    .min(1, "feedCategoryRequired")
    .max(80, "feedCategoryMax")
    .default("Technology"),
  feedExplicit: z.boolean().default(false),
  ownerEmail: z
    .string()
    .trim()
    .max(254, "ownerEmailInvalid")
    .email("ownerEmailInvalid")
    .or(z.literal(""))
    .optional(),
  block: z.boolean().default(false),
  newFeedUrl: z
    .string()
    .trim()
    .url("newFeedUrlInvalid")
    .or(z.literal(""))
    .optional(),
});

export type ChannelInput = z.infer<typeof channelSchema>;
