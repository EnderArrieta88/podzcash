import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";
import {
  validationMessages,
  type ValidationMessages,
} from "@/lib/i18n/validation";

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "currentPasswordRequired"),
    newPassword: z.string().min(8, "newPasswordMin").max(100, "newPasswordMax"),
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
