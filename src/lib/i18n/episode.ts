import type { Locale } from "./config";

const es = {
  notFound: "Episodio no encontrado",
  draft: "Este episodio es un borrador: solo tú puedes verlo.",
  description: "Descripción",
  report: "Reportar este episodio",
  embed: {
    title: "Insertar este episodio",
    hint: "Pega este código en tu web para reproducir el episodio sin salir de ella.",
    copy: "Copiar código",
    copied: "Copiado",
  },
  helpTitle: "¿Te sirvió este episodio?",
  helpBody: (name: string) =>
    `Apoya a ${name} directo en ZEC, sin intermediarios.`,
  support: "Apoyar con ZEC",
  comments: {
    title: "Comentarios",
    empty: "Sé el primero: cuenta qué te pareció este episodio.",
    placeholder: "¿Qué te pareció este episodio?",
    submit: "Publicar comentario",
    pending: "Publicando…",
    loginPrompt: "Entra para comentar este episodio.",
    loginLink: "Entrar",
    delete: "Borrar comentario",
    deleteConfirm: "¿Borrar este comentario?",
    report: "Reportar",
    newest: "Más recientes",
    oldest: "Más antiguos",
    pagination: (page: number, total: number) =>
      `Página ${page} de ${total}`,
    error: "No se pudo guardar el comentario. Inténtalo otra vez.",
  },
};

type EpisodeContent = typeof es;

const en: EpisodeContent = {
  notFound: "Episode not found",
  draft: "This episode is a draft: only you can see it.",
  description: "Description",
  report: "Report this episode",
  embed: {
    title: "Embed this episode",
    hint: "Paste this code on your site to play the episode without leaving it.",
    copy: "Copy code",
    copied: "Copied",
  },
  helpTitle: "Did this episode help you?",
  helpBody: (name: string) =>
    `Support ${name} directly in ZEC, no middlemen.`,
  support: "Support with ZEC",
  comments: {
    title: "Comments",
    empty: "Be the first one: let us know what you thought of this episode.",
    placeholder: "What did you think of this episode?",
    submit: "Post comment",
    pending: "Posting…",
    loginPrompt: "Sign in to comment on this episode.",
    loginLink: "Sign in",
    delete: "Delete comment",
    deleteConfirm: "Delete this comment?",
    report: "Report",
    newest: "Newest",
    oldest: "Oldest",
    pagination: (page: number, total: number) => `Page ${page} of ${total}`,
    error: "Could not save the comment. Try again.",
  },
};

export const episodeContent: Record<Locale, EpisodeContent> = { es, en };
