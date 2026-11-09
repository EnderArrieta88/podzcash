import type { MetadataRoute } from "next";

/**
 * Datos de la PWA en un solo lugar. `manifest.ts` los expone en
 * `/manifest.webmanifest` y los tests verifican los invariantes que necesita
 * la instalación (standalone, iconos 192/512 y maskable).
 */
export const PWA_THEME_COLOR = "#0b0d11";
export const PWA_BACKGROUND_COLOR = "#0b0d11";
export const OFFLINE_PATH = "/offline";

export const pwaManifest: MetadataRoute.Manifest = {
  id: "/",
  name: "PodZcash",
  short_name: "PodZcash",
  description: "Podcasts y música con apoyo directo en ZEC, sin intermediarios.",
  lang: "es",
  dir: "ltr",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: PWA_BACKGROUND_COLOR,
  theme_color: PWA_THEME_COLOR,
  categories: ["entertainment", "music", "news"],
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};
