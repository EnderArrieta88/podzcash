import type { Locale } from "./config";

const es = {
  metaTitle: "Distribución",
  title: "Distribución",
  intro:
    "Tu feed RSS lleva el canal a Apple Podcasts, Spotify y cualquier reproductor de podcasts.",
  feedTitle: "Feed RSS",
  feedHint: "Es público y se actualiza solo cuando publicas un episodio.",
  howTo:
    "En Apple y Spotify eliges “añadir podcast por RSS” y pegas esta URL. La verificación puede tardar unas horas. Sube el audio en MP3 o M4A y usa una portada cuadrada de al menos 1400 × 1400 px.",
  embedTitle: "Reproductor embebible",
  embedHint:
    "Pega este código en tu web para que cualquiera escuche sin salir de ella.",
  latestPrefix: "Corresponde al episodio más reciente:",
  noEpisode: "Publica un episodio para generar el código.",
  upload: "Subir episodio",
  donationsTitle: "Donaciones en el feed",
  donationsBody:
    "Los oyentes que lleguen desde Apple o Spotify también pueden apoyarte: el enlace de cada episodio abre tu página de donación en PodZcash.",
  copy: "Copiar código",
  copied: "Copiado",
};

type StudioDistributionContent = typeof es;

const en: StudioDistributionContent = {
  metaTitle: "Distribution",
  title: "Distribution",
  intro:
    "Your RSS feed takes the channel to Apple Podcasts, Spotify and any podcast player.",
  feedTitle: "RSS feed",
  feedHint:
    "It is public and updates automatically when you publish an episode.",
  howTo:
    "In Apple and Spotify choose “add podcast by RSS” and paste this URL. Verification can take a few hours. Upload your audio as MP3 or M4A and use a square cover of at least 1400 × 1400 px.",
  embedTitle: "Embeddable player",
  embedHint:
    "Paste this code on your site so anyone can listen without leaving it.",
  latestPrefix: "It matches the most recent episode:",
  noEpisode: "Publish an episode to generate the code.",
  upload: "Upload episode",
  donationsTitle: "Donations in the feed",
  donationsBody:
    "Listeners arriving from Apple or Spotify can support you too: each episode link opens your donation page on PodZcash.",
  copy: "Copy code",
  copied: "Copied",
};

export const studioDistributionContent: Record<
  Locale,
  StudioDistributionContent
> = { es, en };
