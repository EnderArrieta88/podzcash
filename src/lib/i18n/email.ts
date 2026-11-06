import type { Locale } from "./config";

type EmailContent = {
  subject: string;
  intro: string;
  button: string;
  ignore: string;
  footer: string;
};

const es: EmailContent = {
  subject: "Restablece tu contraseña de PodZcash",
  intro:
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta en PodZcash.",
  button: "Crear una contraseña nueva",
  ignore:
    "Si no fuiste tú, ignora este correo. El enlace caduca en una hora y no cambia nada por sí solo.",
  footer: "PodZcash · Audio para Zcash",
};

const en: EmailContent = {
  subject: "Reset your PodZcash password",
  intro:
    "We received a request to reset the password for your PodZcash account.",
  button: "Create a new password",
  ignore:
    "If this wasn't you, ignore this email. The link expires in one hour and does nothing on its own.",
  footer: "PodZcash · Audio for Zcash",
};

export const emailContent: Record<Locale, EmailContent> = { es, en };
