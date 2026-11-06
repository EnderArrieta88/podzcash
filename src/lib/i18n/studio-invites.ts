import type { Locale } from "./config";

const es = {
  metaTitle: "Invitaciones",
  title: "Invitaciones",
  intro:
    "PodZcash es por invitación. Cada código sirve para una sola cuenta. Compártelo solo con la persona que quieres sumar.",
  form: {
    notePlaceholder: "Nota (opcional): para quién es",
    noteAria: "Nota de la invitación",
    pending: "Generando…",
    submit: "Generar código",
    generated: "Código generado y listo abajo.",
  },
  empty: "Todavía no generaste códigos.",
  usedBy: "Usado por",
  expired: "Expirado",
  available: "Disponible",
  revoke: "Revocar",
  copy: "Copiar código",
  copied: "Copiado",
};

export type StudioInvitesContent = typeof es;

const en: StudioInvitesContent = {
  metaTitle: "Invites",
  title: "Invites",
  intro:
    "PodZcash is invite-only. Each code works for one account. Share it only with the person you want to add.",
  form: {
    notePlaceholder: "Note (optional): who it is for",
    noteAria: "Invite note",
    pending: "Generating…",
    submit: "Generate code",
    generated: "Code generated and ready below.",
  },
  empty: "You have not generated any codes yet.",
  usedBy: "Used by",
  expired: "Expired",
  available: "Available",
  revoke: "Revoke",
  copy: "Copy code",
  copied: "Copied",
};

export const studioInvitesContent: Record<Locale, StudioInvitesContent> = {
  es,
  en,
};
