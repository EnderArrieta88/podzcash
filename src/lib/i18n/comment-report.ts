import type { Locale } from "./config";

const es = {
  metaTitle: "Reportar comentario",
  title: "Reportar comentario",
  back: "Volver al episodio",
  context: (author: string, episode: string) =>
    `Comentario de ${author} en ${episode}`,
  thanks: "Gracias. Recibimos el reporte y lo vamos a revisar.",
  loginPrompt: "Entra para reportar un comentario.",
  loginLink: "Entrar",
  errors: {
    limit: "Demasiados reportes seguidos. Prueba más tarde.",
    invalid: "Revisa los datos e intenta de nuevo.",
    own: "No puedes reportar tu propio comentario.",
    duplicate: "Ya reportaste este comentario. Lo vamos a revisar.",
  },
  reason: "Motivo",
  reasonPlaceholder: "Elige un motivo",
  reasons: [
    { value: "spam", label: "Spam o enlaces engañosos" },
    { value: "acoso", label: "Acoso o insultos" },
    { value: "odio", label: "Discurso de odio" },
    { value: "desinformacion", label: "Desinformación" },
    { value: "otro", label: "Otro motivo" },
  ],
  details: "Detalles",
  detailsPlaceholder: "Cuéntanos qué tiene de malo este comentario.",
  submit: "Enviar reporte",
};

export type CommentReportContent = typeof es;

const en: CommentReportContent = {
  metaTitle: "Report comment",
  title: "Report comment",
  back: "Back to the episode",
  context: (author: string, episode: string) =>
    `Comment by ${author} on ${episode}`,
  thanks: "Thank you. We received the report and will review it.",
  loginPrompt: "Sign in to report a comment.",
  loginLink: "Sign in",
  errors: {
    limit: "Too many reports in a row. Try again later.",
    invalid: "Check the data and try again.",
    own: "You cannot report your own comment.",
    duplicate: "You already reported this comment. We will review it.",
  },
  reason: "Reason",
  reasonPlaceholder: "Choose a reason",
  reasons: [
    { value: "spam", label: "Spam or misleading links" },
    { value: "acoso", label: "Harassment or insults" },
    { value: "odio", label: "Hate speech" },
    { value: "desinformacion", label: "Misinformation" },
    { value: "otro", label: "Other reason" },
  ],
  details: "Details",
  detailsPlaceholder: "Tell us what is wrong with this comment.",
  submit: "Send report",
};

export const commentReportContent: Record<Locale, CommentReportContent> = {
  es,
  en,
};
