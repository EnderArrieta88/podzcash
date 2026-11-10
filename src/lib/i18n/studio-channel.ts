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
    addLink: "Añadir enlace",
    zcashAddress: "Dirección Zcash",
    zcashPlaceholder: "u1… · zs1… · t1… · t3…",
    zcashHint:
      "Activa las donaciones de tu canal. Solo aceptamos direcciones protegidas: unificada (u1…) o Sapling (zs1…). Validamos el checksum al guardar y rechazamos las transparentes (t1, t3).",
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
    feedSection: "Feed y distribución",
    feedSectionHint:
      "Estos datos se usan en el RSS y en Apple Podcasts. Los valores por defecto funcionan para la mayoría de los canales.",
    feedLanguage: "Idioma del feed",
    feedLanguageHint: "Código de idioma, por ejemplo es, en o es-AR.",
    feedCategory: "Categoría en Apple Podcasts",
    feedCategoryHint: "Apple usa estas categorías para clasificar el podcast.",
    feedExplicit: "Contenido explícito",
    feedExplicitHint:
      "Marca esta opción si el canal suele tener lenguaje explícito.",
    ownerEmail: "Email del propietario",
    ownerEmailHint:
      "Opcional. Se publica en el feed para verificar la propiedad; si queda vacío se usa el email del proyecto.",
    block: "Bloquear en Apple Podcasts",
    blockHint:
      "Oculta el feed de Apple Podcasts. Úsalo solo si el canal debe dejar de distribuirse.",
    newFeedUrl: "URL nueva del feed",
    newFeedUrlHint:
      "Opcional. Solo para migrar el feed; Apple redirige a los suscriptores.",
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
      "Enables donations for your channel. We only accept shielded addresses: unified (u1…) or Sapling (zs1…). We validate the checksum on save and reject transparent addresses (t1, t3).",
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
    feedSection: "Feed and distribution",
    feedSectionHint:
      "This data is used in RSS and Apple Podcasts. The defaults work for most channels.",
    feedLanguage: "Feed language",
    feedLanguageHint: "Language code, for example es, en or en-US.",
    feedCategory: "Apple Podcasts category",
    feedCategoryHint: "Apple uses these categories to classify the podcast.",
    feedExplicit: "Explicit content",
    feedExplicitHint:
      "Check this if the channel often contains explicit language.",
    ownerEmail: "Owner email",
    ownerEmailHint:
      "Optional. Published in the feed for ownership verification; if empty, the project email is used.",
    block: "Block on Apple Podcasts",
    blockHint:
      "Hides the feed from Apple Podcasts. Use it only if the channel must stop being distributed.",
    newFeedUrl: "New feed URL",
    newFeedUrlHint:
      "Optional. Only for feed migrations; Apple redirects subscribers.",
  },
};

export const channelSettingsContent: Record<Locale, ChannelSettingsContent> = {
  es,
  en,
};
