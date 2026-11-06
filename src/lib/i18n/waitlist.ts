import type { Locale } from "./config";

const es = {
  metaTitle: "Lista de espera",
  metaDescription:
    "PodZcash abre por invitación. Deja tus datos y te avisamos cuando haya cupo para creadores.",
  eyebrow: "Para creadores",
  title: "Entra a la lista de espera",
  intro:
    "PodZcash crece por invitación para cuidar la comunidad. Cuéntanos qué quieres publicar y te escribimos cuando haya una invitación disponible.",
  name: "Nombre",
  namePlaceholder: "Cómo te llamas",
  email: "Email",
  emailPlaceholder: "tu@email.com",
  role: "¿Qué quieres publicar?",
  roles: {
    podcast: "Podcast",
    music: "Música",
    other: "Otra cosa",
  },
  note: "Cuéntanos algo",
  noteOptional: "(opcional)",
  notePlaceholder: "Tu idea, tu canal, tu experiencia…",
  submit: "Anotarme",
  pending: "Enviando…",
  successTitle: "Estás en la lista",
  successBody:
    "Te escribimos cuando haya una invitación disponible. Gracias por el interés.",
  privacy:
    "Usamos tu email solo para avisarte sobre la invitación. No lo compartimos.",
  backHome: "Volver al inicio",
  errors: {
    retry: "No se pudo enviar la solicitud. Inténtalo otra vez.",
  },
};

export type WaitlistContent = typeof es;

const en: WaitlistContent = {
  metaTitle: "Waitlist",
  metaDescription:
    "PodZcash is invite-only. Leave your details and we will let you know when there is room for creators.",
  eyebrow: "For creators",
  title: "Join the waitlist",
  intro:
    "PodZcash grows by invitation to take care of the community. Tell us what you want to publish and we will write to you when an invite is available.",
  name: "Name",
  namePlaceholder: "What should we call you",
  email: "Email",
  emailPlaceholder: "you@email.com",
  role: "What do you want to publish?",
  roles: {
    podcast: "Podcast",
    music: "Music",
    other: "Something else",
  },
  note: "Tell us a bit",
  noteOptional: "(optional)",
  notePlaceholder: "Your idea, your channel, your experience…",
  submit: "Join the list",
  pending: "Sending…",
  successTitle: "You are on the list",
  successBody:
    "We will write to you when an invite is available. Thanks for your interest.",
  privacy:
    "We use your email only to let you know about the invite. We never share it.",
  backHome: "Back to home",
  errors: {
    retry: "Could not send the request. Try again.",
  },
};

export const waitlistContent: Record<Locale, WaitlistContent> = { es, en };
