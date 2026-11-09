import type { Locale } from "./config";

const es = {
  title: "Cuenta eliminada",
  body: "Tu cuenta y tus datos se eliminaron. Gracias por haber pasado por PodZcash.",
  home: "Volver al inicio",
};

export type AccountDeletedContent = typeof es;

const en: AccountDeletedContent = {
  title: "Account deleted",
  body: "Your account and your data have been deleted. Thanks for spending time on PodZcash.",
  home: "Back home",
};

export const accountDeletedContent: Record<Locale, AccountDeletedContent> = {
  es,
  en,
};
