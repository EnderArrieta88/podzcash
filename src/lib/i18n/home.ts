import type { Locale } from "./config";

const es = {
  meta: {
    title: "PodZcash — Podcasts y música del ecosistema Zcash",
    description:
      "Publica tu audio, construye tu canal y recibe donaciones directas en ZEC. Sin intermediarios y sin custodia.",
  },
  hero: {
    eyebrow: "Hecho para el ecosistema Zcash",
    titleBefore: "Escucha a quien está construyendo",
    titleEmphasis: "Zcash",
    lead: "Podcasts y música de la comunidad, en un solo lugar. Publica tu audio, construye tu canal y recibe donaciones directas en ZEC. Sin intermediarios y sin custodia.",
    explore: "Explorar canales",
    publish: "Publicar mi podcast",
    trustBold: "Comunidad Zcash",
    trustRest: " · beta por invitación",
    live: "Grabando ahora",
    episode: "Custodia propia, ep. 12",
    episodeMeta: "Nora Vela · 42:10",
    photoAlt:
      "Creadora grabando un podcast en un estudio con micrófono y auriculares",
  },
  strip: {
    audioFirst: "Audio primero, sin distracciones",
    zecDirect: "ZEC directo a tu wallet",
    noCustody: "Sin custodia, sin comisiones",
    beta: "Beta",
    betaRest: " · acceso por invitación",
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Tres pasos, sin fricción",
    intro:
      "PodZcash está pensado para que el audio sea el protagonista. Sin formularios eternos ni algoritmos que deciden por ti.",
    steps: [
      {
        title: "Creas tu canal",
        body: "Eliges tu nombre de usuario, subes tu foto y cuentas de qué hablas. En minutos tienes una página propia.",
      },
      {
        title: "Publicas tu audio",
        body: "Arrastras el archivo, pones portada y descripción. Tu feed RSS se genera solo, listo para Apple y Spotify.",
      },
      {
        title: "Recibes apoyo",
        body: "Compartes tu dirección Zcash. Quien quiera apoyarte escanea un QR y el pago llega directo a tu wallet.",
      },
    ],
  },
  why: {
    eyebrow: "Por qué PodZcash",
    title: "El audio de Zcash necesita una casa propia",
    intro:
      "Hoy la conversación del ecosistema está dispersa entre YouTube, X y Spotify. PodZcash la reúne, la hace fácil de encontrar y conecta a los oyentes con los creadores de forma directa.",
    creatorLabel: "Para quien crea",
    ecosystemLabel: "Para el ecosistema",
    creator: [
      {
        title: "Tu canal, tu audiencia",
        body: "Una dirección propia y un catálogo que no depende del algoritmo de otra red social. Tus oyentes te encuentran a ti, no a un feed.",
      },
      {
        title: "Cobras directo, sin retención",
        body: "Las donaciones van de wallet a wallet. PodZcash nunca toca los fondos ni cobra comisión: tú controlas las llaves y el dinero.",
      },
      {
        title: "Distribución, no encierro",
        body: "Tu feed RSS te lleva a Apple Podcasts y Spotify, y el reproductor embebible te lleva a tu propia web. El contenido circula y no queda encerrado.",
      },
    ],
    ecosystem: [
      {
        title: "Da casa a la conversación",
        body: "Entrevistas, podcasts y música sobre Zcash dejan de estar dispersos y pasan a encontrarse en un mismo lugar.",
      },
      {
        title: "Uso real de ZEC",
        body: "Cada apoyo es una transacción cotidiana: wallets, QR y memos en uso. No una promesa, sino un pago que ocurre.",
      },
      {
        title: "Más creadores, más difusión",
        body: "Cada canal es una puerta de entrada a Zcash para gente que no lee documentación técnica: llega por una voz, se queda por la idea.",
      },
    ],
    band: [
      "Sin custodia",
      "Sin comisiones",
      "Sin depender de una sola plataforma",
      "Hecho por y para el ecosistema",
    ],
  },
  project: {
    eyebrow: "El proyecto",
    title: "Qué sigue y cómo se financia",
    body: "PodZcash nació como idea a finales de 2023 y empezó a construirse en febrero de 2025; hoy la beta corre en un hosting compartido. En la página del proyecto contamos qué está listo, las 26 fases del plan y qué financiamiento hace falta para el primer año.",
    cta: "Leer sobre el proyecto",
    stats: [
      { label: "Fases", value: "8 / 26" },
      { label: "Horizonte", value: "1 — 3 años" },
      { label: "Estado", value: "Beta cerrada" },
    ],
  },
  scenes: {
    eyebrow: "Hecho para audio",
    title: "Voces reales, en cualquier lugar",
    intro: "Desde un estudio casero hasta la calle. Si hay una historia, hay un canal.",
    items: [
      {
        title: "Estudio casero",
        subtitle: "Podcast independiente",
        alt: "Persona grabando un podcast en su estudio",
      },
      {
        title: "Conversación",
        subtitle: "Cadena Fría",
        alt: "Dos personas grabando una conversación con un micrófono",
      },
      {
        title: "En la calle",
        subtitle: "Nodo Sur",
        alt: "Persona escuchando con auriculares y teléfono en la calle",
      },
    ],
  },
  product: {
    eyebrow: "Tu canal",
    title: "Una página propia, no un perfil perdido",
    body: "Tu catálogo, tu bio y tus enlaces en una dirección que puedes compartir. El reproductor sigue sonando mientras la gente navega.",
    checks: [
      "Reproductor persistente con velocidad y “continuar escuchando”.",
      "Feed RSS con etiquetas de Podcasting 2.0.",
      "Donaciones con QR y enlace ZIP-321, sin custodia.",
    ],
    browserUrl: "podzcash.online/canal/@nora-vela",
    alt: "Captura real del canal de Nora Vela en PodZcash",
  },
  donate: {
    eyebrow: "Apoyo directo",
    title: "El dinero va del oyente a la wallet. Sin escalas.",
    body: "PodZcash nunca retiene fondos. Escaneas un QR o abres el enlace en tu wallet y el pago llega directo al creador. Ni comisiones ni cuentas intermedias.",
    primary: "Ver cómo apoyar",
    secondary: "Conocer el proyecto",
    note: "QR y enlace en cada canal",
    photoAlt: "Creadora sonriendo frente al micrófono",
  },
  final: {
    title: "Tu próximo episodio merece un lugar propio.",
    body: "PodZcash está en beta cerrada. Publica, comparte tu canal y recibe apoyo en ZEC desde el primer día.",
    primary: "Pedir invitación",
    secondary: "Explorar canales",
  },
};

type HomeContent = typeof es;

const en: HomeContent = {
  meta: {
    title: "PodZcash — Podcasts and music from the Zcash ecosystem",
    description:
      "Publish your audio, build your channel and receive direct donations in ZEC. No middlemen, no custody.",
  },
  hero: {
    eyebrow: "Built for the Zcash ecosystem",
    titleBefore: "Listen to the people building",
    titleEmphasis: "Zcash",
    lead: "Podcasts and music from the community, in one place. Publish your audio, build your channel and receive direct donations in ZEC. No middlemen, no custody.",
    explore: "Explore channels",
    publish: "Publish my podcast",
    trustBold: "Zcash community",
    trustRest: " · invite-only beta",
    live: "Recording now",
    episode: "Self-custody, ep. 12",
    episodeMeta: "Nora Vela · 42:10",
    photoAlt: "Creator recording a podcast in a studio with a microphone and headphones",
  },
  strip: {
    audioFirst: "Audio first, no distractions",
    zecDirect: "ZEC straight to your wallet",
    noCustody: "Non-custodial, no fees",
    beta: "Beta",
    betaRest: " · invite-only access",
  },
  how: {
    eyebrow: "How it works",
    title: "Three steps, no friction",
    intro:
      "PodZcash is designed so audio takes center stage. No endless forms, no algorithms deciding for you.",
    steps: [
      {
        title: "Create your channel",
        body: "Choose your username, upload your photo and tell people what you talk about. You have your own page in minutes.",
      },
      {
        title: "Publish your audio",
        body: "Drag the file, add cover art and a description. Your RSS feed is generated automatically, ready for Apple and Spotify.",
      },
      {
        title: "Get support",
        body: "Share your Zcash address. Anyone who wants to support you scans a QR and the payment goes straight to your wallet.",
      },
    ],
  },
  why: {
    eyebrow: "Why PodZcash",
    title: "Zcash audio needs a home of its own",
    intro:
      "Today the ecosystem's conversation is scattered across YouTube, X and Spotify. PodZcash brings it together, makes it easy to find and connects listeners directly with creators.",
    creatorLabel: "For creators",
    ecosystemLabel: "For the ecosystem",
    creator: [
      {
        title: "Your channel, your audience",
        body: "Your own address and a catalog that does not depend on another social network's algorithm. Listeners find you, not a feed.",
      },
      {
        title: "Get paid directly, no holds",
        body: "Donations go wallet to wallet. PodZcash never touches the funds or takes a cut: you control the keys and the money.",
      },
      {
        title: "Distribution, not lock-in",
        body: "Your RSS feed takes you to Apple Podcasts and Spotify, and the embeddable player takes you to your own site. Content circulates and is not locked in.",
      },
    ],
    ecosystem: [
      {
        title: "A home for the conversation",
        body: "Interviews, podcasts and music about Zcash are no longer scattered and can be found in one place.",
      },
      {
        title: "Real ZEC usage",
        body: "Every tip is an everyday transaction: wallets, QR codes and memos in use. Not a promise, but a payment that happens.",
      },
      {
        title: "More creators, more reach",
        body: "Every channel is a gateway to Zcash for people who do not read technical docs: they arrive for a voice, they stay for the idea.",
      },
    ],
    band: [
      "Non-custodial",
      "No fees",
      "Not dependent on a single platform",
      "Built by and for the ecosystem",
    ],
  },
  project: {
    eyebrow: "The project",
    title: "What's next and how it's funded",
    body: "PodZcash started as an idea in late 2023 and began to take shape in February 2025; today the beta runs on shared hosting. The project page covers what is ready, the 26 phases of the plan and the funding needed for year one.",
    cta: "Read about the project",
    stats: [
      { label: "Phases", value: "8 / 26" },
      { label: "Horizon", value: "1 — 3 years" },
      { label: "Status", value: "Closed beta" },
    ],
  },
  scenes: {
    eyebrow: "Made for audio",
    title: "Real voices, anywhere",
    intro: "From a home studio to the street. If there is a story, there is a channel.",
    items: [
      {
        title: "Home studio",
        subtitle: "Independent podcast",
        alt: "Person recording a podcast in their studio",
      },
      {
        title: "Conversation",
        subtitle: "Cadena Fría",
        alt: "Two people recording a conversation with a microphone",
      },
      {
        title: "On the street",
        subtitle: "Nodo Sur",
        alt: "Person listening with headphones and a phone on the street",
      },
    ],
  },
  product: {
    eyebrow: "Your channel",
    title: "A page of your own, not a lost profile",
    body: "Your catalog, your bio and your links at an address you can share. The player keeps playing while people browse.",
    checks: [
      "Persistent player with speed control and “continue listening”.",
      "RSS feed with Podcasting 2.0 tags.",
      "Donations with QR and ZIP-321 links, non-custodial.",
    ],
    browserUrl: "podzcash.online/canal/@nora-vela",
    alt: "Real screenshot of Nora Vela's channel on PodZcash",
  },
  donate: {
    eyebrow: "Direct support",
    title: "Money goes from listener to wallet. No stops.",
    body: "PodZcash never holds funds. You scan a QR or open the link in your wallet and the payment goes straight to the creator. No fees, no middle accounts.",
    primary: "See how to support",
    secondary: "About the project",
    note: "QR and link on every channel",
    photoAlt: "Creator smiling in front of a microphone",
  },
  final: {
    title: "Your next episode deserves a place of its own.",
    body: "PodZcash is in closed beta. Publish, share your channel and receive support in ZEC from day one.",
    primary: "Request an invite",
    secondary: "Explore channels",
  },
};

export const homeContent: Record<Locale, HomeContent> = { es, en };
