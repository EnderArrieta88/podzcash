import type { Locale } from "./config";

const es = {
  nav: {
    home: "Inicio",
    explore: "Explorar",
    studio: "Mi estudio",
    myChannel: "Mi canal",
    admin: "Administración",
    mobileStudio: "Estudio",
  },
  collapse: "Minimizar el menú",
  expand: "Expandir el menú",
  menu: "Menú",
  closeMenu: "Cerrar menú",
  accountMenu: "Menú de cuenta",
  myAccount: "Mi cuenta",
  donations: "Donaciones",
  donationTitle: "Directo a tu wallet",
  donationBody: "ZEC de persona a persona. PodZcash nunca retiene tus fondos.",
  supportPage: "Ver página de apoyo",
  noChannel: "Sin canal",
  logout: "Cerrar sesión",
  enter: "Entrar",
  myProfile: "Mi perfil",
  searchPlaceholder: "Buscar podcasts, música, canales.",
  searchLabel: "Buscar",
  nonCustodial: "ZEC sin custodia",
  upload: "Subir",
  language: "Idioma",
};

export type ShellContent = typeof es;

const en: ShellContent = {
  nav: {
    home: "Home",
    explore: "Explore",
    studio: "My studio",
    myChannel: "My channel",
    admin: "Administration",
    mobileStudio: "Studio",
  },
  collapse: "Collapse menu",
  expand: "Expand menu",
  menu: "Menu",
  closeMenu: "Close menu",
  accountMenu: "Account menu",
  myAccount: "My account",
  donations: "Donations",
  donationTitle: "Straight to your wallet",
  donationBody: "ZEC person to person. PodZcash never holds your funds.",
  supportPage: "View support page",
  noChannel: "No channel",
  logout: "Sign out",
  enter: "Sign in",
  myProfile: "My profile",
  searchPlaceholder: "Search podcasts, music, channels.",
  searchLabel: "Search",
  nonCustodial: "Non-custodial ZEC",
  upload: "Upload",
  language: "Language",
};

export const shellContent: Record<Locale, ShellContent> = { es, en };
