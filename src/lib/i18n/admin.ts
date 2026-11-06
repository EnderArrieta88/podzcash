import type { Locale } from "./config";

const es = {
  metaTitle: "Administración",
  title: "Administración",
  intro: "Moderación, cuentas y limpieza de archivos.",
  stats: {
    users: "Usuarios",
    channels: "Canales",
    published: "Episodios publicados",
    openReports: "Reportes abiertos",
    waitlist: "En espera",
  },
  waitlist: {
    title: "Lista de espera",
    empty: "Todavía no hay solicitudes.",
    invite: "Invitar por email",
    delete: "Borrar",
    confirmDelete: "¿Borrar esta solicitud de la lista de espera?",
    invited: "Invitación enviada por email.",
    inviteError:
      "No se pudo enviar la invitación. Revisa Resend e inténtalo otra vez.",
    deleted: "Solicitud borrada.",
  },
  reports: {
    title: "Reportes abiertos",
    empty: "No hay reportes pendientes.",
    unavailable: "Contenido no disponible",
    view: "Ver episodio",
    hide: "Ocultar episodio",
    dismiss: "Descartar",
  },
  orphans: {
    title: "Medios huérfanos",
    empty: "No hay archivos sin usar.",
    count: (files: number, size: string) =>
      `${files} archivo(s) sin referencia · ${size}`,
    clean: "Eliminar huérfanos",
    cleaned: (count: string) => `Se eliminaron ${count} archivo(s).`,
  },
  users: {
    title: "Usuarios",
    noChannel: "sin canal",
    suspend: "Suspender",
    reactivate: "Reactivar",
  },
  episodes: {
    title: "Episodios recientes",
    plays: "reproducciones",
    playOne: "reproducción",
    playMany: "reproducciones",
    hide: "Ocultar",
    publish: "Publicar",
  },
  roles: { admin: "Administrador", creator: "Creador" } as Record<
    string,
    string
  >,
  userStatus: {
    active: "activo",
    unverified: "sin verificar",
    suspended: "suspendido",
  } as Record<string, string>,
  episodeStatus: {
    published: "publicado",
    hidden: "oculto",
    draft: "borrador",
  } as Record<string, string>,
};

export type AdminContent = typeof es;

const en: AdminContent = {
  metaTitle: "Administration",
  title: "Administration",
  intro: "Moderation, accounts and file cleanup.",
  stats: {
    users: "Users",
    channels: "Channels",
    published: "Published episodes",
    openReports: "Open reports",
    waitlist: "Waiting",
  },
  waitlist: {
    title: "Waitlist",
    empty: "No requests yet.",
    invite: "Invite by email",
    delete: "Delete",
    confirmDelete: "Delete this waitlist request?",
    invited: "Invite sent by email.",
    inviteError: "Could not send the invite. Check Resend and try again.",
    deleted: "Request deleted.",
  },
  reports: {
    title: "Open reports",
    empty: "There are no pending reports.",
    unavailable: "Content unavailable",
    view: "View episode",
    hide: "Hide episode",
    dismiss: "Dismiss",
  },
  orphans: {
    title: "Orphaned media",
    empty: "There are no unused files.",
    count: (files: number, size: string) =>
      `${files} unreferenced file(s) · ${size}`,
    clean: "Delete orphans",
    cleaned: (count: string) => `Deleted ${count} file(s).`,
  },
  users: {
    title: "Users",
    noChannel: "no channel",
    suspend: "Suspend",
    reactivate: "Reactivate",
  },
  episodes: {
    title: "Recent episodes",
    plays: "plays",
    playOne: "play",
    playMany: "plays",
    hide: "Hide",
    publish: "Publish",
  },
  roles: { admin: "Administrator", creator: "Creator" } as Record<
    string,
    string
  >,
  userStatus: {
    active: "active",
    unverified: "unverified",
    suspended: "suspended",
  } as Record<string, string>,
  episodeStatus: {
    published: "published",
    hidden: "hidden",
    draft: "draft",
  } as Record<string, string>,
};

export const adminContent: Record<Locale, AdminContent> = { es, en };
