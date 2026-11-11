import { z } from "zod";

export const commentSchema = z.object({
  episodeId: z.string().trim().min(1),
  body: z.string().trim().min(2).max(600),
});

export const deleteCommentSchema = z.object({
  id: z.string().trim().min(1),
  path: z.string().trim().optional(),
});

export const commentNotifySchema = z.enum(["inbox", "email", "off"]);
