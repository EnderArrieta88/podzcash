import type { Locale } from "./config";

const es = {
  title: "Sin conexión",
  body: "PodZcash necesita internet para cargar episodios, comentarios y tu estudio. Revisa tu conexión y vuelve a intentarlo.",
  retry: "Reintentar",
  home: "Ir al inicio",
  hint: "Los episodios que ya estaban cargados siguen disponibles en esta pantalla.",
};

export type OfflineContent = typeof es;

const en: OfflineContent = {
  title: "You are offline",
  body: "PodZcash needs a connection to load episodes, comments and your studio. Check your connection and try again.",
  retry: "Try again",
  home: "Go home",
  hint: "Episodes already loaded on this screen are still available.",
};

export const offlineContent: Record<Locale, OfflineContent> = { es, en };
