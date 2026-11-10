import type { Locale } from "./config";

const es = {
  download: "Descargar",
  downloading: "Descargando",
  downloaded: "Descargado",
  loading: "Cargando…",
  delete: "Borrar",
  deleteConfirm: "¿Borrar esta descarga del dispositivo?",
  manage: "Gestionar descargas",
  pageMeta: "Descargas",
  pageTitle: "Descargas",
  intro:
    "Episodios guardados en este dispositivo. Se reproducen sin conexión.",
  empty: "Todavía no descargaste ningún episodio.",
  emptyHint: "Abre un episodio y selecciona Descargar para escucharlo sin conexión.",
  used: "Espacio usado",
  almostFull:
    "Estás cerca del límite de descargas. Borra algún episodio para liberar espacio.",
  clear: "Borrar todas",
  clearConfirm: "¿Borrar todas las descargas de este dispositivo?",
  play: "Reproducir",
  pause: "Pausar",
  offlineTitle: "Tus descargas",
  offlineHint: "Se reproducen aunque no tengas conexión.",
  downloadedOn: "Descargado",
  hint: "Las descargas están en este dispositivo. Puedes borrarlas cuando quieras.",
  errors: {
    unsupported:
      "Este navegador no permite guardar audio para escuchar sin conexión.",
    quota:
      "No hay espacio suficiente. Borra alguna descarga o aumenta la cuota.",
    network: "No se pudo descargar el episodio. Revisa tu conexión.",
    storage: "El navegador no pudo guardar el archivo.",
    play: "No se pudo reproducir la descarga.",
  },
};

export type OfflineAudioContent = typeof es;

const en: OfflineAudioContent = {
  download: "Download",
  downloading: "Downloading",
  downloaded: "Downloaded",
  loading: "Loading…",
  delete: "Delete",
  deleteConfirm: "Delete this download from this device?",
  manage: "Manage downloads",
  pageMeta: "Downloads",
  pageTitle: "Downloads",
  intro: "Episodes saved on this device. They play without a connection.",
  empty: "You have not downloaded any episodes yet.",
  emptyHint: "Open an episode and tap Download to listen offline.",
  used: "Storage used",
  almostFull:
    "You are close to the download limit. Delete an episode to free space.",
  clear: "Delete all",
  clearConfirm: "Delete all downloads from this device?",
  play: "Play",
  pause: "Pause",
  offlineTitle: "Your downloads",
  offlineHint: "They play even without a connection.",
  downloadedOn: "Downloaded",
  hint: "Downloads live on this device. You can delete them anytime.",
  errors: {
    unsupported:
      "This browser cannot save audio for offline listening.",
    quota: "Not enough space. Delete a download or raise the quota.",
    network: "The episode could not be downloaded. Check your connection.",
    storage: "The browser could not save the file.",
    play: "The download could not be played.",
  },
};

export const offlineAudioContent: Record<Locale, OfflineAudioContent> = {
  es,
  en,
};
