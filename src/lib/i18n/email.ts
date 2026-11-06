import type { Locale } from "./config";

export type EmailCopy = {
  subject: string;
  intro: string;
  button: string;
  ignore: string;
  footer: string;
};

const resetEs: EmailCopy = {
  subject: "Restablece tu contraseña de PodZcash",
  intro:
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta en PodZcash.",
  button: "Crear una contraseña nueva",
  ignore:
    "Si no fuiste tú, ignora este correo. El enlace caduca en una hora y no cambia nada por sí solo.",
  footer: "PodZcash · Audio para Zcash",
};

const resetEn: EmailCopy = {
  subject: "Reset your PodZcash password",
  intro:
    "We received a request to reset the password for your PodZcash account.",
  button: "Create a new password",
  ignore:
    "If this wasn't you, ignore this email. The link expires in one hour and does nothing on its own.",
  footer: "PodZcash · Audio for Zcash",
};

const verifyEs: EmailCopy = {
  subject: "Confirma tu cuenta de PodZcash",
  intro:
    "Tu cuenta en PodZcash está casi lista. Confirma tu email para activarla y empezar a publicar.",
  button: "Confirmar mi cuenta",
  ignore:
    "Si no creaste esta cuenta, ignora este correo. El enlace caduca en 48 horas y no activa nada por sí solo.",
  footer: "PodZcash · Audio para Zcash",
};

const verifyEn: EmailCopy = {
  subject: "Confirm your PodZcash account",
  intro:
    "Your PodZcash account is almost ready. Confirm your email to activate it and start publishing.",
  button: "Confirm my account",
  ignore:
    "If you didn't create this account, ignore this email. The link expires in 48 hours and does nothing on its own.",
  footer: "PodZcash · Audio for Zcash",
};

export const resetEmailContent: Record<Locale, EmailCopy> = {
  es: resetEs,
  en: resetEn,
};

export const verificationEmailContent: Record<Locale, EmailCopy> = {
  es: verifyEs,
  en: verifyEn,
};
