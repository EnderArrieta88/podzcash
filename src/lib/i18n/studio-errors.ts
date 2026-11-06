import type { Locale } from "./config";

const es = {
  handleTaken: "Ese nombre de usuario ya está ocupado. Prueba otro.",
  linksInvalid: "Cada enlace necesita una etiqueta y una URL válida.",
  linksUnreadable: "No pudimos leer los enlaces.",
  avatarFormat: "Formato no soportado. Usa JPG, PNG, WebP o GIF.",
  avatarSize: "La imagen no puede pasar de 2 MB.",
  bannerFormat: "Formato no soportado. Usa JPG, PNG o WebP.",
  bannerSize: "La portada no puede pasar de 4 MB.",
  inviteFailed: "No se pudo generar el código. Inténtalo otra vez.",
  episodeNotFound: "Ese episodio no existe.",
  audioRequired: "Sube un archivo de audio antes de guardar.",
  episodeSaveFailed: "No se pudo guardar el episodio. Inténtalo otra vez.",
};

type StudioErrors = typeof es;

const en: StudioErrors = {
  handleTaken: "That username is already taken. Try another one.",
  linksInvalid: "Each link needs a label and a valid URL.",
  linksUnreadable: "We could not read the links.",
  avatarFormat: "Unsupported format. Use JPG, PNG, WebP or GIF.",
  avatarSize: "The image cannot exceed 2 MB.",
  bannerFormat: "Unsupported format. Use JPG, PNG or WebP.",
  bannerSize: "The cover cannot exceed 4 MB.",
  inviteFailed: "Could not generate the code. Try again.",
  episodeNotFound: "That episode does not exist.",
  audioRequired: "Upload an audio file before saving.",
  episodeSaveFailed: "Could not save the episode. Try again.",
};

export const studioErrors: Record<Locale, StudioErrors> = { es, en };
