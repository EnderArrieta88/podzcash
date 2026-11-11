import type { Locale } from "./config";

const es = {
  metaTitle: "Comentarios",
  title: "Comentarios",
  intro:
    "Todos los comentarios de tus episodios, con avisos y moderación en un solo lugar.",
  newComments: (count: number) =>
    count === 1 ? "1 comentario nuevo" : `${count} comentarios nuevos`,
  empty: "Todavía no hay comentarios en tus episodios.",
  viewEpisode: "Ver episodio",
  delete: "Borrar",
  deleteConfirm: "¿Borrar este comentario?",
  on: "En",
  pagination: {
    previous: "Más recientes",
    next: "Más antiguos",
    page: (page: number, total: number) => `Página ${page} de ${total}`,
  },
  settings: {
    title: "Avisos de comentarios",
    label: "Cómo quieres enterarte",
    save: "Guardar",
    saved: "Preferencia guardada.",
    options: {
      inbox: "Bandeja interna (recomendado)",
      email: "Email por cada comentario",
      off: "Sin avisos",
    } as Record<string, string>,
    emailHint:
      "Los emails se envían al correo de la cuenta del canal y requieren que el envío esté configurado.",
    inboxHint:
      "La bandeja interna te muestra los comentarios nuevos en el menú del estudio.",
    emailNotConfigured:
      "El envío de emails no está configurado; los avisos quedan en la bandeja interna.",
  },
};

export type StudioCommentsContent = typeof es;

const en: StudioCommentsContent = {
  metaTitle: "Comments",
  title: "Comments",
  intro:
    "Every comment on your episodes, with notifications and moderation in one place.",
  newComments: (count: number) =>
    count === 1 ? "1 new comment" : `${count} new comments`,
  empty: "There are no comments on your episodes yet.",
  viewEpisode: "View episode",
  delete: "Delete",
  deleteConfirm: "Delete this comment?",
  on: "On",
  pagination: {
    previous: "Newest",
    next: "Oldest",
    page: (page: number, total: number) => `Page ${page} of ${total}`,
  },
  settings: {
    title: "Comment notifications",
    label: "How you want to hear about them",
    save: "Save",
    saved: "Preference saved.",
    options: {
      inbox: "In-app inbox (recommended)",
      email: "Email for every comment",
      off: "No notifications",
    } as Record<string, string>,
    emailHint:
      "Emails go to the channel account address and require email delivery to be configured.",
    inboxHint: "The in-app inbox shows new comments in the studio menu.",
    emailNotConfigured:
      "Email delivery is not configured; notifications stay in the in-app inbox.",
  },
};

export const studioCommentsContent: Record<Locale, StudioCommentsContent> = {
  es,
  en,
};
