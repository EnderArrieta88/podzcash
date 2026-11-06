import type { Locale } from "./config";

const es = {
  play: "Reproducir",
  pause: "Pausar",
  progress: "Progreso",
  listenOn: "Escuchar en PodZcash",
  episodeFallback: "Episodio",
};

type EmbedContent = typeof es;

const en: EmbedContent = {
  play: "Play",
  pause: "Pause",
  progress: "Progress",
  listenOn: "Listen on PodZcash",
  episodeFallback: "Episode",
};

export const embedContent: Record<Locale, EmbedContent> = { es, en };
