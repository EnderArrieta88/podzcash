import type { Locale } from "./config";

const es = {
  progress: "Progreso del episodio",
  back: "Retroceder 15 segundos",
  play: "Reproducir",
  pause: "Pausar",
  forward: "Avanzar 15 segundos",
  speed: "Cambiar velocidad",
  close: "Cerrar reproductor",
  of: "de",
};

export type PlayerContent = typeof es;

const en: PlayerContent = {
  progress: "Episode progress",
  back: "Rewind 15 seconds",
  play: "Play",
  pause: "Pause",
  forward: "Forward 15 seconds",
  speed: "Change speed",
  close: "Close player",
  of: "of",
};

export const playerContent: Record<Locale, PlayerContent> = { es, en };
