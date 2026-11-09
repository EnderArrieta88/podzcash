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

const inviteEs: EmailCopy = {
  subject: "Tu invitación a PodZcash",
  intro:
    "Te invitaron a crear tu canal en PodZcash. Usá el código o el enlace para registrarte.",
  button: "Crear mi cuenta",
  ignore:
    "Si no esperabas esta invitación, ignora este correo. El código es personal: no lo compartas.",
  footer: "PodZcash · Audio para Zcash",
};

const inviteEn: EmailCopy = {
  subject: "Your PodZcash invite",
  intro:
    "You have been invited to create your channel on PodZcash. Use the code or the link to sign up.",
  button: "Create my account",
  ignore:
    "If you were not expecting this invite, ignore this email. The code is personal: do not share it.",
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

export const inviteEmailContent: Record<Locale, EmailCopy> = {
  es: inviteEs,
  en: inviteEn,
};

export type CommentEmailCopy = {
  subject: (episode: string) => string;
  intro: (author: string, episode: string) => string;
  button: string;
  manage: string;
  footer: string;
};

export const commentEmailContent: Record<Locale, CommentEmailCopy> = {
  es: {
    subject: (episode) => `Nuevo comentario en ${episode}`,
    intro: (author, episode) =>
      `${author} comentó en tu episodio «${episode}».`,
    button: "Ver el comentario",
    manage: "Puedes cambiar o desactivar estos avisos en Estudio → Comentarios.",
    footer: "PodZcash · Audio para Zcash",
  },
  en: {
    subject: (episode) => `New comment on ${episode}`,
    intro: (author, episode) => `${author} commented on your episode “${episode}”.`,
    button: "View the comment",
    manage: "You can change or turn off these notifications in Studio → Comments.",
    footer: "PodZcash · Audio for Zcash",
  },
};
