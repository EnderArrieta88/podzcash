import type { Locale } from "./config";

const es = {
  metaTitle: "Reportar contenido",
  back: "Volver al episodio",
  title: "Reportar contenido",
  episode: "Episodio:",
  thanks: "Gracias. Recibimos el reporte y lo vamos a revisar.",
  errors: {
    limit: "Demasiados reportes desde tu conexión. Prueba más tarde.",
    invalid: "Revisa los datos e intenta de nuevo.",
  },
  reason: "Motivo",
  reasonPlaceholder: "Elige un motivo",
  reasons: [
    { value: "spam", label: "Spam o contenido engañoso" },
    { value: "acoso", label: "Acoso o discurso de odio" },
    { value: "copyright", label: "Infracción de derechos de autor" },
    { value: "explicito", label: "Contenido explícito sin aviso" },
    { value: "otro", label: "Otro motivo" },
  ],
  details: "Detalles",
  detailsPlaceholder: "Cuéntanos qué está mal en este contenido.",
  email: "Tu email",
  optional: "(opcional)",
  emailPlaceholder: "Para responderte si hace falta",
  submit: "Enviar reporte",
};

export type ReportContent = typeof es;

const en: ReportContent = {
  metaTitle: "Report content",
  back: "Back to the episode",
  title: "Report content",
  episode: "Episode:",
  thanks: "Thank you. We received the report and will review it.",
  errors: {
    limit: "Too many reports from your connection. Try again later.",
    invalid: "Check the data and try again.",
  },
  reason: "Reason",
  reasonPlaceholder: "Choose a reason",
  reasons: [
    { value: "spam", label: "Spam or misleading content" },
    { value: "acoso", label: "Harassment or hate speech" },
    { value: "copyright", label: "Copyright infringement" },
    { value: "explicito", label: "Explicit content without warning" },
    { value: "otro", label: "Other reason" },
  ],
  details: "Details",
  detailsPlaceholder: "Tell us what is wrong with this content.",
  email: "Your email",
  optional: "(optional)",
  emailPlaceholder: "So we can reply if needed",
  submit: "Send report",
};

export const reportContent: Record<Locale, ReportContent> = { es, en };
