import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";
import {
  validationMessages,
  type ValidationMessages,
} from "@/lib/i18n/validation";

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

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "nameMin")
    .max(60, "nameMax"),
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "passwordMin")
    .max(100, "passwordMax"),
  inviteCode: z.string().trim().max(64, "inviteCodeMax").optional(),
});

export const loginSchema = z.object({
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "loginPasswordRequired"),
});

export const resetRequestSchema = z.object({
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
});

export const passwordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "newPasswordMin")
      .max(100, "newPasswordMax"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export const waitlistSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(60, "nameMax"),
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
  role: z.enum(["podcast", "music", "other"], { message: "kindRequired" }),
  note: z.string().trim().max(400, "noteMax").optional(),
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

export const episodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "titleMin")
    .max(140, "titleMax"),
  description: z
    .string()
    .trim()
    .max(5000, "descriptionMax"),
  kind: z.enum(["podcast", "music"], {
    message: "kindRequired",
  }),
  tags: z.string().trim().max(240, "tagsMax").optional(),
  season: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(0, "seasonInvalid").max(9999, "seasonInvalid").optional(),
  ),
  episodeNumber: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce
      .number()
      .int()
      .min(1, "episodeNumberInvalid")
      .max(99999, "episodeNumberInvalid")
      .optional(),
  ),
  episodeType: z
    .enum(["full", "trailer", "bonus"], { message: "episodeTypeInvalid" })
    .default("full"),
  explicit: z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    },
    z.boolean().optional(),
  ),
});

export type EpisodeInput = z.infer<typeof episodeSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "currentPasswordRequired"),
    newPassword: z
      .string()
      .min(8, "newPasswordMin")
      .max(100, "newPasswordMax"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export type FieldErrors = Record<string, string>;

export function toFieldErrors(
  error: z.ZodError,
  locale: Locale = "es",
): FieldErrors {
  const messages = validationMessages[locale];
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    const translated =
      messages[issue.message as keyof ValidationMessages] ?? issue.message;

    if (typeof key === "string" && !errors[key]) {
      errors[key] = translated;
    }
  }

  return errors;
}
