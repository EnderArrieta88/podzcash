import type { Locale } from "./config";

const es = {
  title: "Avisos en el móvil",
  description:
    "Recibe una notificación cuando alguien se anote en la lista de espera.",
  enable: "Activar notificaciones",
  disable: "Desactivar en este teléfono",
  pending: "Activando…",
  enabled: "Notificaciones activadas en este teléfono.",
  denied:
    "El navegador bloqueó las notificaciones. Habilítalas en los ajustes del sitio.",
  unsupported:
    "Este teléfono o navegador no permite notificaciones push.",
  installTitle: "Añade PodZcash a la pantalla de inicio",
  installBody:
    "En iPhone o iPad, instala la app y ábrela desde el icono para poder activar las notificaciones.",
  notConfigured: "Las notificaciones no están configuradas en el servidor.",
  error: "No se pudieron activar las notificaciones. Inténtalo otra vez.",
  desktopHint:
    "Los avisos de la lista de espera se activan desde el teléfono.",
};

export type PushContent = typeof es;

const en: PushContent = {
  title: "Mobile alerts",
  description: "Get a notification when someone joins the waitlist.",
  enable: "Enable notifications",
  disable: "Disable on this phone",
  pending: "Enabling…",
  enabled: "Notifications are enabled on this phone.",
  denied:
    "The browser blocked notifications. Allow them in the site settings.",
  unsupported: "This phone or browser does not support push notifications.",
  installTitle: "Add PodZcash to your home screen",
  installBody:
    "On iPhone or iPad, install the app and open it from the icon to enable notifications.",
  notConfigured: "Notifications are not configured on the server.",
  error: "Could not enable notifications. Try again.",
  desktopHint: "Waitlist alerts are enabled from your phone.",
};

export const pushContent: Record<Locale, PushContent> = { es, en };
