import type { Locale } from "./config";

const es = {
  notFound: "Canal no encontrado",
  metaDescription: (name: string) =>
    `Escucha a ${name} en PodZcash. Podcasts y música del ecosistema Zcash.`,
  edit: "Editar canal",
  support: "Apoyar con ZEC",
  since: "desde",
  episodeLabel: (count: number) =>
    count === 1 ? "1 episodio" : `${count} episodios`,
  acceptsZec: "Acepta ZEC",
  rssTitle: "Feed RSS del canal",
  episodes: "Episodios",
  emptyTitle: "Silencio en el estudio",
  emptyOwner: "Tu canal está listo. Sube tu primer episodio desde el estudio.",
  emptyVisitor: "Este canal está empezando. Vuelve pronto para escucharlo.",
  upload: "Subir episodio",
  supportPanelTitle: "Apoya este canal",
  supportPanelBody: "ZEC directo a la wallet del creador, sin intermediarios.",
  sendZec: "Enviar ZEC",
  donations: "Donaciones",
  noAddress: "Este canal todavía no configuró una dirección Zcash.",
  links: "Enlaces",
  avatarAlt: (name: string) => `Avatar de ${name}`,
};

type ChannelContent = typeof es;

const en: ChannelContent = {
  notFound: "Channel not found",
  metaDescription: (name: string) =>
    `Listen to ${name} on PodZcash. Podcasts and music from the Zcash ecosystem.`,
  edit: "Edit channel",
  support: "Support with ZEC",
  since: "since",
  episodeLabel: (count: number) =>
    count === 1 ? "1 episode" : `${count} episodes`,
  acceptsZec: "Accepts ZEC",
  rssTitle: "Channel RSS feed",
  episodes: "Episodes",
  emptyTitle: "Silence in the studio",
  emptyOwner:
    "Your channel is ready. Upload your first episode from the studio.",
  emptyVisitor: "This channel is just getting started. Check back soon.",
  upload: "Upload episode",
  supportPanelTitle: "Support this channel",
  supportPanelBody: "ZEC straight to the creator's wallet, no middlemen.",
  sendZec: "Send ZEC",
  donations: "Donations",
  noAddress: "This channel has not set a Zcash address yet.",
  links: "Links",
  avatarAlt: (name: string) => `${name}'s avatar`,
};

export const channelContent: Record<Locale, ChannelContent> = { es, en };
