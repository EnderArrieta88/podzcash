import { z } from "zod";

export const episodeSchema = z.object({
  title: z.string().trim().min(2, "titleMin").max(140, "titleMax"),
  description: z.string().trim().max(5000, "descriptionMax"),
  kind: z.enum(["podcast", "music"], {
    message: "kindRequired",
  }),
  tags: z.string().trim().max(240, "tagsMax").optional(),
  season: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce
      .number()
      .int()
      .min(0, "seasonInvalid")
      .max(9999, "seasonInvalid")
      .optional(),
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
  explicit: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean().optional()),
});

export type EpisodeInput = z.infer<typeof episodeSchema>;
