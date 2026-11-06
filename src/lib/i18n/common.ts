import type { Locale } from "./config";

const es = {
  siteTitle: "PodZcash — Podcasts y música del ecosistema Zcash",
  siteDescription:
    "La plataforma donde podcasters y músicos del ecosistema Zcash publican su contenido, construyen su canal y reciben donaciones directas en ZEC.",
  notFound: {
    title: "Esta página no existe",
    body: "Puede que el canal haya cambiado de nombre de usuario o que el enlace esté roto.",
    home: "Volver al inicio",
    signIn: "Entrar",
  },
  nav: {
    explore: "Explorar",
    how: "Cómo funciona",
    creators: "Para creadores",
    project: "Proyecto",
    donations: "Donaciones",
  },
  enter: "Entrar",
  studio: "Mi estudio",
  inviteOnly: "Por invitación",
  language: "Idioma",
  footer: {
    tagline: "podcasts y música del ecosistema Zcash.",
    note: "Proyecto en desarrollo · Donaciones directas en ZEC, sin custodia.",
  },
};

type CommonContent = typeof es;

const en: CommonContent = {
  siteTitle: "PodZcash — Podcasts and music from the Zcash ecosystem",
  siteDescription:
    "The platform where podcasters and musicians from the Zcash ecosystem publish their content, build their channel and receive direct donations in ZEC.",
  notFound: {
    title: "This page does not exist",
    body: "The channel may have changed its username or the link may be broken.",
    home: "Back to home",
    signIn: "Sign in",
  },
  nav: {
    explore: "Explore",
    how: "How it works",
    creators: "For creators",
    project: "Project",
    donations: "Donations",
  },
  enter: "Sign in",
  studio: "My studio",
  inviteOnly: "Invite only",
  language: "Language",
  footer: {
    tagline: "podcasts and music from the Zcash ecosystem.",
    note: "Work in progress · Direct ZEC donations, non-custodial.",
  },
};

export const commonContent: Record<Locale, CommonContent> = { es, en };
