import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(60, "nameMax"),
  email: z
    .email("emailInvalid")
    .transform((value) => value.trim().toLowerCase()),
  role: z.enum(["podcast", "music", "other"], { message: "kindRequired" }),
  note: z.string().trim().max(400, "noteMax").optional(),
});
