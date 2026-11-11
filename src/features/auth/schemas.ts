import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(60, "nameMax"),
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "passwordMin").max(100, "passwordMax"),
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
    newPassword: z.string().min(8, "newPasswordMin").max(100, "newPasswordMax"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
