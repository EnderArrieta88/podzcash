export type ExistingAudio = {
  key: string;
  size: number | null;
  mimeType: string | null;
  name: string;
  durationSec: number | null;
};

export type EpisodeFormValues = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  tags: string;
  season: number | null;
  episodeNumber: number | null;
  episodeType: string;
  explicit: boolean | null;
  audio: ExistingAudio;
  coverKey: string | null;
  coverUrl: string | null;
};
