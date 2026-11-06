import type { Locale } from "./config";

const es = {
  podcast: "PODCAST",
  podcastTitle: "Podcast",
  music: "MÚSICA",
  musicTitle: "Música",
  episodeOne: "episodio",
  episodeMany: "episodios",
  play: "Reproducir",
  pause: "Pausar",
  playAria: (title: string) => `Reproducir ${title}`,
  pauseAria: (title: string) => `Pausar ${title}`,
};

type SharedLabels = typeof es;

const en: SharedLabels = {
  podcast: "PODCAST",
  podcastTitle: "Podcast",
  music: "MUSIC",
  musicTitle: "Music",
  episodeOne: "episode",
  episodeMany: "episodes",
  play: "Play",
  pause: "Pause",
  playAria: (title: string) => `Play ${title}`,
  pauseAria: (title: string) => `Pause ${title}`,
};

export const sharedLabels: Record<Locale, SharedLabels> = { es, en };
