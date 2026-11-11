import { z } from "zod";

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

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
