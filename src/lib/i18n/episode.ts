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
};

export const episodeContent: Record<Locale, EpisodeContent> = { es, en };
