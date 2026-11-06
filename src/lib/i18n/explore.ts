import type { Locale } from "./config";

const es = {
  meta: {
    title: "Explorar",
    description:
      "Descubre podcasts y música del ecosistema Zcash. Busca por título, canal o etiqueta.",
  },
  eyebrow: "Catálogo",
  title: "Explorar",
  intro: "Todo el podcast y la música del ecosistema Zcash, en un solo lugar.",
  search: {
    placeholder: "Busca episodios, canales o etiquetas",
    button: "Buscar",
    aria: "Buscar en PodZcash",
  },
  filters: {
    all: "Todo",
    podcasts: "Podcasts",
    music: "Música",
  },
  count: {
    result: "resultado",
    results: "resultados",
    episode: "episodio",
    episodes: "episodios",
    for: "para",
    tag: "etiqueta",
  },
  clear: "Limpiar filtros",
  empty: {
    noResults: "Sin resultados",
    silence: "Silencio en el estudio",
    noResultsBody:
      "Prueba con otra palabra, quita filtros o busca por el nombre del canal.",
    silenceBody: "Cuando los creadores publiquen, todo va a aparecer aquí.",
    viewAll: "Ver todo",
  },
  panels: {
    channels: "Canales",
    tags: "Etiquetas",
  },
  support: {
    title: "Apoya directo",
    body: "Las donaciones van de wallet a wallet. PodZcash nunca retiene los fondos.",
  },
};

type ExploreContent = typeof es;

const en: ExploreContent = {
  meta: {
    title: "Explore",
    description:
      "Discover podcasts and music from the Zcash ecosystem. Search by title, channel or tag.",
  },
  eyebrow: "Catalog",
  title: "Explore",
  intro: "All the podcasts and music from the Zcash ecosystem, in one place.",
  search: {
    placeholder: "Search episodes, channels or tags",
    button: "Search",
    aria: "Search PodZcash",
  },
  filters: {
    all: "All",
    podcasts: "Podcasts",
    music: "Music",
  },
  count: {
    result: "result",
    results: "results",
    episode: "episode",
    episodes: "episodes",
    for: "for",
    tag: "tag",
  },
  clear: "Clear filters",
  empty: {
    noResults: "No results",
    silence: "Silence in the studio",
    noResultsBody:
      "Try another word, remove filters or search by the channel name.",
    silenceBody: "When creators publish, everything will show up here.",
    viewAll: "View all",
  },
  panels: {
    channels: "Channels",
    tags: "Tags",
  },
  support: {
    title: "Support directly",
    body: "Donations go wallet to wallet. PodZcash never holds the funds.",
  },
};

export const exploreContent: Record<Locale, ExploreContent> = { es, en };
