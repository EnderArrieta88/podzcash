import type { Locale } from "./config";

const es = {
  metaTitle: "Mi canal",
  editTitle: "Mi canal",
  createTitle: "Crear mi canal",
  editIntro: "Así te ve la comunidad. Los cambios se guardan al instante.",
  createIntro:
    "Elige tu nombre de usuario y cuéntale a la comunidad quién eres.",
  form: {
    saved: "Canal guardado.",
    displayName: "Nombre del canal",
    displayNamePlaceholder: "Mi podcast",
    username: "Nombre de usuario",
    usernamePlaceholder: "mi-podcast",
    usernameHint:
      "Es la dirección de tu canal. Solo minúsculas, números y guiones.",
    bio: "Bio",
    bioPlaceholder:
      "Cuéntale a la comunidad de qué hablas o qué música haces.",
    links: "Enlaces",
    optional: "(opcional)",
    linkLabel: "Etiqueta",
    linkUrl: "https://…",
    linkLabelAria: "Etiqueta del enlace",
    linkUrlAria: "URL del enlace",
    removeLink: "Quitar enlace",
    addLink: "Agregar enlace",
    zcashAddress: "Dirección Zcash",
    zcashPlaceholder: "u1… · zs1… · t1… · t3…",
    zcashHint:
      "Activa las donaciones de tu canal. Validamos el checksum al guardar. Ideal una dirección unificada (u1) o Sapling (zs1) para que el monto y el memo queden protegidos.",
    save: "Guardar cambios",
    create: "Crear canal",
    saving: "Guardando…",
    editLater: "Podrás editarlo cuando quieras.",
    avatar: "Avatar",
    avatarAlt: "Vista previa del avatar",
    uploadImage: "Subir imagen",
    avatarHint: "JPG, PNG, WebP o GIF. Máximo 2 MB. Se recorta en círculo.",
    banner: "Portada del canal",
    bannerAlt: "Vista previa de la portada",
    uploadBanner: "Subir portada",
    bannerHint:
      "JPG, PNG o WebP. Máximo 4 MB. Se muestra arriba del canal, en formato panorámico.",
  },
};

export type ChannelSettingsContent = typeof es;
export type ChannelFormLabels = ChannelSettingsContent["form"];

const en: ChannelSettingsContent = {
  metaTitle: "My channel",
  editTitle: "My channel",
  createTitle: "Create my channel",
  editIntro: "This is how the community sees you. Changes save instantly.",
  createIntro: "Pick your username and tell the community who you are.",
  form: {
    saved: "Channel saved.",
    displayName: "Channel name",
    displayNamePlaceholder: "My podcast",
    username: "Username",
    usernamePlaceholder: "my-podcast",
    usernameHint:
      "It is your channel address. Lowercase letters, numbers and hyphens only.",
    bio: "Bio",
    bioPlaceholder: "Tell the community what you talk about or what music you make.",
    links: "Links",
    optional: "(optional)",
    linkLabel: "Label",
    linkUrl: "https://…",
    linkLabelAria: "Link label",
    linkUrlAria: "Link URL",
    removeLink: "Remove link",
    addLink: "Add link",
    zcashAddress: "Zcash address",
    zcashPlaceholder: "u1… · zs1… · t1… · t3…",
    zcashHint:
      "Enables donations for your channel. We validate the checksum on save. A unified (u1) or Sapling (zs1) address is best so amount and memo stay shielded.",
    save: "Save changes",
    create: "Create channel",
    saving: "Saving…",
    editLater: "You can edit it anytime.",
    avatar: "Avatar",
    avatarAlt: "Avatar preview",
    uploadImage: "Upload image",
    avatarHint: "JPG, PNG, WebP or GIF. Max 2 MB. Cropped into a circle.",
    banner: "Channel cover",
    bannerAlt: "Cover preview",
    uploadBanner: "Upload cover",
    bannerHint:
      "JPG, PNG or WebP. Max 4 MB. Shown at the top of the channel in widescreen.",
  },
};

export const channelSettingsContent: Record<Locale, ChannelSettingsContent> = {
  es,
  en,
};
