import type { Locale } from "./config";

const es = {
  eyebrow: "Estudio",
  viewPublic: "Ver canal público",
  nav: {
    overview: "Resumen",
    episodes: "Episodios",
    channel: "Mi canal",
    distribution: "Distribución",
    account: "Cuenta",
    invites: "Invitaciones",
  },
  dashboard: {
    step: "Paso 1 de 2",
    createTitle: "Crea tu canal",
    createBody:
      "Tu canal es tu casa dentro de PodZcash: la página donde la comunidad encuentra tu contenido, tu historia y tu forma de recibir apoyo.",
    bullets: [
      "Eliges un nombre de usuario único:",
      "Subes avatar, bio y enlaces",
      "Después podrás publicar audio",
    ],
    bulletCode: "/canal/@tu-nombre",
    createCta: "Crear mi canal",
    noBio: "Todavía no escribiste una bio.",
    episodes: "Episodios",
    plays: "Reproducciones",
    donations: "Donaciones",
    donationsSoon: "Próximamente",
    status: "Estado",
    active: "Canal activo",
    nextTitle: "Siguiente: subir tu primer audio",
    nextBody:
      "Tu canal ya está listo para recibir tu primer episodio.",
    edit: "Editar canal",
  },
};

export type StudioShellContent = typeof es;

const en: StudioShellContent = {
  eyebrow: "Studio",
  viewPublic: "View public channel",
  nav: {
    overview: "Overview",
    episodes: "Episodes",
    channel: "My channel",
    distribution: "Distribution",
    account: "Account",
    invites: "Invites",
  },
  dashboard: {
    step: "Step 1 of 2",
    createTitle: "Create your channel",
    createBody:
      "Your channel is your home inside PodZcash: the page where the community finds your content, your story and how to support you.",
    bullets: [
      "Pick a unique username:",
      "Upload an avatar, bio and links",
      "After that you can publish audio",
    ],
    bulletCode: "/canal/@your-name",
    createCta: "Create my channel",
    noBio: "You have not written a bio yet.",
    episodes: "Episodes",
    plays: "Plays",
    donations: "Donations",
    donationsSoon: "Coming soon",
    status: "Status",
    active: "Channel active",
    nextTitle: "Next: upload your first audio",
    nextBody: "Your channel is ready for your first episode.",
    edit: "Edit channel",
  },
};

export const studioShellContent: Record<Locale, StudioShellContent> = {
  es,
  en,
};
