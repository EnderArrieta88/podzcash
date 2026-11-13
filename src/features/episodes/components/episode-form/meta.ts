import type { EpisodeFormValues } from "../../types";

export type EpisodeMeta = {
  title: string;
  description: string;
  tags: string;
  kind: string;
  season: string;
  episodeNumber: string;
  episodeType: string;
  explicit: string;
};

/**
 * Valores iniciales de los campos controlados. Se controlan porque una Server
 * Action resetea los no controlados y se perdería lo escrito si la validación
 * falla.
 */
export function buildEpisodeMeta(
  episode: EpisodeFormValues | null,
): EpisodeMeta {
  return {
    title: episode?.title ?? "",
    description: episode?.description ?? "",
    tags: episode?.tags ?? "",
    kind: episode?.kind ?? "podcast",
    season: episode?.season?.toString() ?? "",
    episodeNumber: episode?.episodeNumber?.toString() ?? "",
    episodeType: episode?.episodeType ?? "full",
    explicit:
      episode?.explicit == null ? "" : episode.explicit ? "true" : "false",
  };
}
