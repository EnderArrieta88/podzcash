import type { Locale } from "./config";

const es = {
  meta: {
    title: "El proyecto",
    description:
      "Qué es PodZcash, qué funciona hoy, el plan de 26 fases y la fase de fundación que busca financiar.",
  },
  hero: {
    eyebrow: "El proyecto · Estado y financiamiento",
    titleBefore: "PodZcash es la casa del audio de",
    titleEmphasis: "Zcash",
    titleAfter: ".",
    lead1:
      "Una plataforma de podcasts y música donde los creadores del ecosistema publican su trabajo, se dan a conocer y reciben ZEC directo a su wallet.",
    lead2:
      "Esta página cuenta qué es, qué funciona hoy, qué falta para que crezca y cómo se financia. Sin métricas infladas ni promesas vacías.",
    live: "Beta cerrada en producción",
    plan: "Plan 2026 — 2029",
    updated: "Actualizado el 5 de noviembre de 2026",
    ctaApp: "Ver la aplicación",
    ctaFunding: "Cómo se financia",
    tag: "Hoy, en producción",
    photoCaption: "Ya se puede publicar y escuchar",
    photoMeta: "podzcash.online",
    photoAlt:
      "Creador grabando un podcast en su estudio con micrófono y auriculares",
  },
  stats: [
    { label: "Fases del plan", value: "9", suffix: "/ 26", sub: "17 por delante" },
    {
      label: "Funcionalidades",
      value: "8",
      suffix: "",
      sub: "Cuentas, audio, búsqueda, ZEC, RSS",
    },
    {
      label: "Horizonte",
      value: "1 — 3 años",
      suffix: "",
      sub: "Según financiamiento y crecimiento",
    },
    { label: "Estado", value: "Beta", suffix: "", sub: "Invitación, sin registro abierto" },
  ],
  about: {
    eyebrow: "01 — Qué es PodZcash",
    title: "El audio de un ecosistema, en un lugar que es suyo",
    intro1:
      "Hoy la conversación sobre Zcash vive en YouTube, en X y en podcasts alojados en otras plataformas. Los creadores no cobran en ZEC, los oyentes no pueden apoyarlos sin salir del ecosistema y el contenido queda atado al algoritmo de otra empresa.",
    intro2:
      "PodZcash es una plataforma de audio nativa de Zcash: cada creador tiene su canal con dirección propia, publica episodios, y recibe apoyo directo a su wallet. Sin custodia, sin comisiones y sin intermediarios.",
    origin: {
      eyebrow: "Contexto",
      title: "Una idea de finales de 2023, construida sin recursos",
      body: "PodZcash no nació con un equipo ni con financiamiento. Empezó como una idea a finales de 2023, comenzó a materializarse en febrero de 2025 y hoy la beta corre en un hosting compartido, porque el proyecto todavía no tiene recursos propios. Cada fase se construye a mano y con lo mínimo para mantenerse en pie.",
      items: [
        {
          when: "Finales de 2023",
          title: "La idea",
          body: "Primer boceto de una plataforma de audio pensada para el ecosistema Zcash.",
        },
        {
          when: "Febrero de 2025",
          title: "Primeras líneas",
          body: "Arranca el desarrollo con recursos propios y sin ningún tipo de financiamiento.",
        },
        {
          when: "Hoy",
          title: "Beta en producción",
          body: "Corriendo en hosting compartido, con lo justo para sostener la beta abierta por invitación.",
        },
      ],
    },
    pillars: [
      {
        title: "Un canal, no un perfil",
        body: "Dirección propia, catálogo y bio en una página que se comparte y no depende de un feed.",
      },
      {
        title: "ZEC directo a tu wallet",
        body: "QR y enlace ZIP-321. El pago va del oyente al creador: la plataforma nunca toca los fondos.",
      },
      {
        title: "Distribución abierta",
        body: "Feed RSS compatible con Apple Podcasts y Spotify (audio en MP3 o M4A), reproductor embebible y planes de API. El contenido no queda encerrado en una sola aplicación.",
      },
      {
        title: "Hecho para Zcash",
        body: "No es una app más con un logo encima: el producto está pensado alrededor de ZEC y su comunidad.",
      },
    ],
    why: {
      title: "No es una aplicación más: es la capa de audio que a Zcash le falta",
      body: "Zcash tiene una de las tecnologías más sólidas del espacio y, sin embargo, muy poca narrativa humana. La gente no adopta privacidad leyendo un documento técnico: la adopta cuando alguien se lo explica con su propia voz. Eso es lo que falta, y es lo que PodZcash construye.",
      reasons: [
        {
          title: "Cada creador es una puerta de entrada",
          body: "Un oyente llega por un episodio y termina entendiendo qué es ZEC, cómo se usa y por qué importa. Sin tutoriales ni fricción.",
        },
        {
          title: "Uso real de ZEC, todos los días",
          body: "Cada apoyo es una transacción cotidiana: wallets, QR y memos en uso. Privacidad que se practica, no que se promete.",
        },
        {
          title: "Infraestructura pública",
          body: "RSS, embeds y API significan que el contenido circula fuera de la plataforma y alimenta a todo el ecosistema.",
        },
      ],
    },
    compare: {
      headers: ["Hoy, en otras plataformas", "Otra plataforma de audio", "PodZcash"],
      rows: [
        ["Comisión por donación", "5 % — 10 %", "0 %"],
        ["Custodia del dinero", "La plataforma", "Tu wallet"],
        ["Moneda del apoyo", "Fiat con retiros y demoras", "ZEC directo"],
        ["Distribución", "Dentro de la app", "RSS, embeds y API"],
        ["Contenido sobre Zcash", "Disperso y sin contexto", "Reunido y fácil de encontrar"],
      ],
    },
  },
  state: {
    eyebrow: "02 — Estado actual",
    title: "Lo que ya funciona",
    intro:
      "Todo esto está implementado y corriendo en producción, no es un mockup ni una idea.",
    panels: [
      {
        title: "Listo y en uso",
        items: [
          { label: "Cuentas e invitaciones", text: "registro cerrado con códigos" },
          { label: "Canales", text: "perfil, bio, avatar, enlaces y página pública" },
          { label: "Subida de audio", text: "streaming a disco, portadas y borradores" },
          { label: "Reproductor persistente", text: "no se corta al navegar" },
        ],
      },
      {
        title: "También listo",
        items: [
          { label: "Búsqueda full-text", text: "títulos, descripciones, etiquetas y canales" },
          { label: "Donaciones ZEC", text: "QR y enlace ZIP-321, sin custodia" },
          { label: "RSS y embeds", text: "Podcasting 2.0 y reproductor insertable" },
          { label: "Administración", text: "reportes, suspensión y limpieza de archivos" },
        ],
      },
    ],
    shots: [
      {
        title: "Grabar desde casa",
        subtitle: "Sin equipo profesional",
        alt: "Creadora grabando en un estudio con paneles acústicos",
      },
      {
        title: "Publicar tu canal",
        subtitle: "Una dirección propia",
        alt: "Creadora frente al micrófono en un estudio",
      },
      {
        title: "Escuchar donde sea",
        subtitle: "Hoy, desde el navegador",
        alt: "Persona escuchando con auriculares en la calle",
      },
    ],
  },
  plan: {
    eyebrow: "03 — Plan de desarrollo",
    title: "26 fases, no una promesa",
    intro:
      "Nueve fases ya están en producción. Las otras diecisiete están ordenadas por dependencia: cada una se construye sobre la anterior. El ritmo depende del financiamiento y del crecimiento real de la comunidad.",
    done: {
      badge: "Completado",
      title: "Fases 01 — 08 + 11 · MVP en producción",
      body: "Un creador ya puede registrarse por invitación, crear su canal, subir audio, publicarlo con RSS y recibir ZEC directo a su wallet. Con moderación, administración y backups verificados.",
      chips: [
        { n: "01", label: "Fundaciones" },
        { n: "02", label: "Cuentas e invitaciones" },
        { n: "03", label: "Canales" },
        { n: "04", label: "Subida de audio" },
        { n: "05", label: "Reproductor" },
        { n: "06", label: "Búsqueda" },
        { n: "07", label: "Donaciones ZEC y RSS" },
        { n: "08", label: "Moderación y admin" },
        { n: "11", label: "Backups y monitoreo" },
      ],
    },
    years: [
      {
        name: "Año 1",
        range: "Fases 09 — 14",
        note: "Base sólida y app móvil",
        phases: [
          { n: "Fase 09", title: "Base de datos escalable", body: "Migración a Postgres con índices de búsqueda y consultas preparadas para miles de episodios." },
          { n: "Fase 10", title: "Almacenamiento y CDN", body: "Audio en almacenamiento de objetos con caché en el borde, para que el streaming no dependa del servidor." },
          { n: "Fase 11", title: "Backups y monitoreo", body: "Copias automáticas, alertas de caída y recuperación probada. Implementado y verificado.", done: true },
          { n: "Fase 12", title: "Analíticas de escucha", body: "Reproducciones, retención por episodio y origen del tráfico, visibles para cada creador." },
          { n: "Fase 13", title: "App móvil de escucha", body: "iOS y Android: reproducción en segundo plano, cola, velocidad y continuar donde quedó." },
          { n: "Fase 14", title: "Offline y notificaciones", body: "Descarga de episodios y avisos de nuevos lanzamientos de los canales que sigues." },
        ],
      },
      {
        name: "Año 2",
        range: "Fases 15 — 20",
        note: "Video, creadores y descubrimiento",
        phases: [
          { n: "Fase 15", title: "Publicar desde el móvil", body: "Grabar o subir desde el teléfono, con recorte y portada. Publicar ya no requiere un equipo de escritorio." },
          { n: "Fase 16", title: "Video podcast", body: "HLS adaptativo, miniaturas y reproducción sincronizada con el audio. El formato deja de ser solo audio." },
          { n: "Fase 17", title: "Capítulos y transcripciones", body: "Capítulos navegables y transcripción automática con búsqueda dentro del episodio." },
          { n: "Fase 18", title: "Suscripciones y colecciones", body: "Seguir canales, series y listas propias, con un feed personal en lugar de un algoritmo opaco." },
          { n: "Fase 19", title: "Panel del creador", body: "Ingresos recibidos, audiencia por episodio y evolución del canal en una sola vista." },
          { n: "Fase 20", title: "Descubrimiento", body: "Recomendaciones por tema y cercanía, destacados editoriales y directorio del ecosistema." },
        ],
      },
      {
        name: "Año 3",
        range: "Fases 21 — 26",
        note: "Escala y sostenibilidad",
        phases: [
          { n: "Fase 21", title: "Pagos recurrentes con ZSA", body: "Suscripciones y membresías usando assets protegidos de Zcash, cuando la red los habilite." },
          { n: "Fase 22", title: "API pública", body: "Acceso documentado a canales y episodios para integrar PodZcash en sitios y herramientas del ecosistema." },
          { n: "Fase 23", title: "Distribución federada", body: "Publicar una vez y aparecer en otras instancias que hablen del mismo tema, sin depender de un servidor único." },
          { n: "Fase 24", title: "TV y auto", body: "Apps para televisores y reproducción en CarPlay y Android Auto, donde el audio se escucha de verdad." },
          { n: "Fase 25", title: "Programa de creadores", body: "Acompañamiento, verificación y formación para que nuevos canales despeguen sin depender del equipo." },
          { n: "Fase 26", title: "Sostenibilidad económica", body: "Membresías opcionales y patrocinios transparentes, para que la plataforma no dependa de donaciones." },
        ],
      },
    ],
    horizon: [
      { label: "Hoy:", text: "publicar audio, tener canal y recibir ZEC." },
      { label: "En 1 año:", text: "escuchar y publicar desde el teléfono, con métricas." },
      { label: "En 3 años:", text: "video, distribución federada y sostenibilidad propia." },
    ],
  },
  funding: {
    eyebrow: "04 — Financiamiento y donaciones",
    title: "Sostenido por su comunidad, no por una sola fuente",
    intro1:
      "PodZcash no depende de una única organización. Se sostiene con aportes de cualquiera que quiera que el proyecto exista: creadores, oyentes, colectivos del ecosistema y fondos que apoyan infraestructura pública.",
    intro2:
      "La solicitud actual a Zcash Community Grants cubre la fase de fundación: seis meses y USD 32.000, repartidos en tres tramos de dos meses. Las fases siguientes son un plan estimado que se ajustará con resultados y aportes reales.",
    ways: [
      {
        title: "Donaciones de la comunidad",
        body: "Cualquier persona puede aportar ZEC, sin mínimo y sin intermediarios. Los fondos llegan directo a la wallet pública del proyecto.",
        bullets: [
          "Sin custodia: nadie administra tu aporte por ti.",
          "Sin comisiones: el 100 % se destina al proyecto.",
          "Se puede aportar una vez o de forma periódica.",
          "Cada aporte se reporta: desarrollo, infraestructura y contenido.",
        ],
      },
      {
        title: "Financiamiento institucional",
        body: "Aportes de fondos, organizaciones o colectivos del ecosistema que financian infraestructura pública y bienes comunes.",
        bullets: [
          "Se solicita por tramos de dos meses; nunca los tres años completos de una vez.",
          "Cada tramo se libera contra entregables verificables.",
          "Reporte público al cerrar cada tramo.",
          "Si el crecimiento es menor, el plan se extiende en el tiempo.",
        ],
      },
    ],
    hitos: {
      title: "La fase de fundación, en tres tramos de dos meses",
      body: "Cada tramo tiene entregables concretos y se paga cuando el anterior está verificado. La solicitud no pide los tres años por adelantado.",
    },
    milestones: [
      {
        when: "Tramo 1 · Meses 1–2",
        title: "Base y migración",
        amount: "USD 10.000",
        items: [
          "VPS de producción y staging contratados.",
          "Postgres en producción con migración verificada.",
          "Backups automáticos y restauración probada.",
          "Plan de rollback y runbook de migración.",
        ],
        verify:
          "Se paga contra el informe de migración y la prueba de restauración.",
      },
      {
        when: "Tramo 2 · Meses 3–4",
        title: "Almacenamiento, CDN y fiabilidad",
        amount: "USD 11.000",
        items: [
          "Audio e imágenes en almacenamiento de objetos con CDN.",
          "Migración de medios sin romper feeds ni embeds.",
          "Monitorización, alertas y runbooks.",
          "Prueba de carga y rollback.",
        ],
        verify:
          "Se paga contra los medios servidos desde el CDN y las pruebas de alerta y rollback.",
      },
      {
        when: "Tramo 3 · Meses 5–6",
        title: "Seguridad, documentación y beta",
        amount: "USD 11.000",
        items: [
          "Revisión de seguridad de auth, subidas, donaciones y admin.",
          "Corrección de hallazgos.",
          "Documentación de arquitectura y onboarding.",
          "Checklist de beta pública y accesibilidad.",
        ],
        verify:
          "Se paga contra el informe de seguridad sin hallazgos críticos y la documentación validada.",
      },
    ],
    totalLabel: "Total de la fase",
    composition: {
      title: "Composición del presupuesto",
      span: "6 meses",
      rows: [
        {
          label: "Desarrollo full-time (6 meses, 1 persona)",
          value: "16.800",
          note: "",
        },
        {
          label: "Beta testing y QA (6 meses, 1 persona)",
          value: "7.200",
          note: "",
        },
        {
          label: "Infraestructura",
          note: "VPS de producción y staging, almacenamiento, CDN y dominio por 12 meses",
          value: "3.000",
        },
        { label: "Auditoría de seguridad", value: "2.500", note: "" },
        { label: "Diseño/UX y accesibilidad", value: "1.000", note: "" },
        { label: "Documentación técnica", value: "300", note: "" },
        {
          label: "Dispositivo de pruebas y herramientas",
          value: "1.000",
          note: "",
        },
        { label: "Contingencia", value: "200", note: "" },
      ],
      totalLabel: "Total de la fase",
      total: "USD 32.000",
      note: "Cifras para seis meses de trabajo. La infraestructura cubre doce meses: a partir del segundo año, la renovación se financia con nuevos aportes. La solicitud actual es de USD 32.000 y puede cubrirse con donaciones, financiamiento institucional o una combinación de ambos.",
    },
    estimates: [
      {
        when: "Resto del año 1 · Fases 12–14",
        title: "Plan estimado, sin monto definido",
        body: "Analíticas de escucha, app móvil, offline y notificaciones. Se ajustará con los resultados de la fase de fundación.",
      },
      {
        when: "Año 2 · Fases 15 — 20",
        title: "Plan estimado, sin monto definido",
        body: "Video, publicación móvil y panel de creador. Se ajustará con los resultados del año 1 y los aportes recibidos.",
      },
      {
        when: "Año 3 · Fases 21 — 26",
        title: "Plan estimado, sin monto definido",
        body: "API, distribución federada, TV y sostenibilidad. Solo se define cuando el año anterior esté en marcha.",
      },
    ],
    donate: {
      title: "Apoyar el proyecto hoy",
      body: "Cada aporte, del tamaño que sea, se convierte en infraestructura, horas de desarrollo y acompañamiento a nuevos creadores. La dirección es pública y los movimientos se reportan.",
      primary: "Donar en ZEC",
      secondary: "Ver qué financia",
      wallet: "Wallet del proyecto",
      copyLabel: "Copiar dirección",
      copiedLabel: "Dirección copiada",
    },
  },
  final: {
    title: "Un ecosistema se cuenta por sus voces.",
    body: "PodZcash ya funciona: hay canales, audio publicado y donaciones que llegan directo a la wallet del creador. Lo que sigue es más grande —una app móvil, video y una plataforma que se sostenga sola— y lleva tiempo. Este es el plan, fase por fase, abierto a quien quiera impulsarlo.",
    app: "Ver la aplicación",
    support: "Apoyar el proyecto",
    status: "Beta cerrada · podzcash.online",
  },
};

type ProjectContent = typeof es;

const en: ProjectContent = {
  meta: {
    title: "The project",
    description:
      "What PodZcash is, what works today, the 26-phase plan and the foundation phase it is seeking funding for.",
  },
  hero: {
    eyebrow: "The project · Status and funding",
    titleBefore: "PodZcash is the home of",
    titleEmphasis: "Zcash",
    titleAfter: " audio.",
    lead1:
      "A podcast and music platform where ecosystem creators publish their work, get discovered and receive ZEC straight to their wallet.",
    lead2:
      "This page covers what it is, what works today, what it needs to grow and how it is funded. No inflated metrics, no empty promises.",
    live: "Closed beta in production",
    plan: "2026 — 2029 plan",
    updated: "Updated November 5, 2026",
    ctaApp: "View the app",
    ctaFunding: "How it's funded",
    tag: "Live in production",
    photoCaption: "Publishing and listening already work",
    photoMeta: "podzcash.online",
    photoAlt:
      "Creator recording a podcast in a studio with a microphone and headphones",
  },
  stats: [
    { label: "Plan phases", value: "9", suffix: "/ 26", sub: "17 ahead" },
    {
      label: "Features",
      value: "8",
      suffix: "",
      sub: "Accounts, audio, search, ZEC, RSS",
    },
    {
      label: "Horizon",
      value: "1 — 3 years",
      suffix: "",
      sub: "Depending on funding and growth",
    },
    { label: "Status", value: "Beta", suffix: "", sub: "Invite only, no open sign-up" },
  ],
  about: {
    eyebrow: "01 — What PodZcash is",
    title: "An ecosystem's audio, in a place of its own",
    intro1:
      "Today the conversation about Zcash lives on YouTube, on X and in podcasts hosted on other platforms. Creators are not paid in ZEC, listeners cannot support them without leaving the ecosystem, and content is tied to another company's algorithm.",
    intro2:
      "PodZcash is a Zcash-native audio platform: every creator has a channel with its own address, publishes episodes and receives support straight to their wallet. Non-custodial, no fees, no middlemen.",
    origin: {
      eyebrow: "Context",
      title: "An idea from late 2023, built without resources",
      body: "PodZcash did not start with a team or funding. It began as an idea in late 2023, started to take shape in February 2025 and today the beta runs on shared hosting, because the project still has no resources of its own. Every phase is built by hand with the bare minimum to keep it running.",
      items: [
        {
          when: "Late 2023",
          title: "The idea",
          body: "First sketch of an audio platform designed for the Zcash ecosystem.",
        },
        {
          when: "February 2025",
          title: "First lines",
          body: "Development begins with the founder's own resources and no funding at all.",
        },
        {
          when: "Today",
          title: "Beta in production",
          body: "Running on shared hosting, with just enough to keep the invite-only beta alive.",
        },
      ],
    },
    pillars: [
      {
        title: "A channel, not a profile",
        body: "Your own address, catalog and bio on a page you can share that does not depend on a feed.",
      },
      {
        title: "ZEC straight to your wallet",
        body: "QR and ZIP-321 link. Payment goes from listener to creator: the platform never touches the funds.",
      },
      {
        title: "Open distribution",
        body: "RSS feed compatible with Apple Podcasts and Spotify (MP3 or M4A audio), embeddable player and API plans. Content is not locked into a single app.",
      },
      {
        title: "Built for Zcash",
        body: "Not just another app with a logo on top: the product is designed around ZEC and its community.",
      },
    ],
    why: {
      title: "More than another app: the audio layer Zcash is missing",
      body: "Zcash has one of the strongest technologies in the space and yet very little human narrative. People do not adopt privacy by reading a technical document: they adopt it when someone explains it in their own voice. That is what is missing, and what PodZcash builds.",
      reasons: [
        {
          title: "Every creator is a gateway",
          body: "A listener arrives for an episode and ends up understanding what ZEC is, how it is used and why it matters. No tutorials, no friction.",
        },
        {
          title: "Real ZEC usage, every day",
          body: "Every tip is an everyday transaction: wallets, QR codes and memos in use. Privacy practiced, not promised.",
        },
        {
          title: "Public infrastructure",
          body: "RSS, embeds and API mean content circulates outside the platform and feeds the whole ecosystem.",
        },
      ],
    },
    compare: {
      headers: ["Today, on other platforms", "Another audio platform", "PodZcash"],
      rows: [
        ["Donation fee", "5% — 10%", "0%"],
        ["Custody of funds", "The platform", "Your wallet"],
        ["Support currency", "Fiat with withdrawals and delays", "ZEC direct"],
        ["Distribution", "Inside the app", "RSS, embeds and API"],
        ["Zcash content", "Scattered and without context", "Gathered and easy to find"],
      ],
    },
  },
  state: {
    eyebrow: "02 — Current status",
    title: "What already works",
    intro:
      "All of this is implemented and running in production, not a mockup or an idea.",
    panels: [
      {
        title: "Ready and in use",
        items: [
          { label: "Accounts and invites", text: "closed registration with codes" },
          { label: "Channels", text: "profile, bio, avatar, links and public page" },
          { label: "Audio upload", text: "streaming to disk, cover art and drafts" },
          { label: "Persistent player", text: "keeps playing while you browse" },
        ],
      },
      {
        title: "Also ready",
        items: [
          { label: "Full-text search", text: "titles, descriptions, tags and channels" },
          { label: "ZEC donations", text: "QR and ZIP-321 link, non-custodial" },
          { label: "RSS and embeds", text: "Podcasting 2.0 and embeddable player" },
          { label: "Administration", text: "reports, suspension and file cleanup" },
        ],
      },
    ],
    shots: [
      {
        title: "Record from home",
        subtitle: "No professional gear",
        alt: "Creator recording in a studio with acoustic panels",
      },
      {
        title: "Publish your channel",
        subtitle: "An address of your own",
        alt: "Creator in front of a microphone in a studio",
      },
      {
        title: "Listen anywhere",
        subtitle: "Today, from the browser",
        alt: "Person listening with headphones on the street",
      },
    ],
  },
  plan: {
    eyebrow: "03 — Development plan",
    title: "26 phases, not a promise",
    intro:
      "Nine phases are already in production. The other seventeen are ordered by dependency: each builds on the previous one. Pace depends on funding and on the community's real growth.",
    done: {
      badge: "Completed",
      title: "Phases 01 — 08 + 11 · MVP in production",
      body: "A creator can already register by invite, create their channel, upload audio, publish it with RSS and receive ZEC straight to their wallet. With moderation, administration and verified backups.",
      chips: [
        { n: "01", label: "Foundations" },
        { n: "02", label: "Accounts and invites" },
        { n: "03", label: "Channels" },
        { n: "04", label: "Audio upload" },
        { n: "05", label: "Player" },
        { n: "06", label: "Search" },
        { n: "07", label: "ZEC donations and RSS" },
        { n: "08", label: "Moderation and admin" },
        { n: "11", label: "Backups and monitoring" },
      ],
    },
    years: [
      {
        name: "Year 1",
        range: "Phases 09 — 14",
        note: "Solid base and mobile app",
        phases: [
          { n: "Phase 09", title: "Scalable database", body: "Postgres migration with search indexes and queries ready for thousands of episodes." },
          { n: "Phase 10", title: "Storage and CDN", body: "Audio on object storage with edge caching, so streaming does not depend on the server." },
          { n: "Phase 11", title: "Backups and monitoring", body: "Automatic copies, downtime alerts and tested recovery. Implemented and verified.", done: true },
          { n: "Phase 12", title: "Listening analytics", body: "Plays, per-episode retention and traffic sources, visible to every creator." },
          { n: "Phase 13", title: "Mobile listening app", body: "iOS and Android: background playback, queue, speed and resume where you left off." },
          { n: "Phase 14", title: "Offline and notifications", body: "Episode downloads and alerts for new releases from channels you follow." },
        ],
      },
      {
        name: "Year 2",
        range: "Phases 15 — 20",
        note: "Video, creators and discovery",
        phases: [
          { n: "Phase 15", title: "Publish from mobile", body: "Record or upload from the phone, with trimming and cover art. Publishing no longer requires a desktop." },
          { n: "Phase 16", title: "Video podcast", body: "Adaptive HLS, thumbnails and playback synced with audio. The format stops being audio-only." },
          { n: "Phase 17", title: "Chapters and transcripts", body: "Navigable chapters and automatic transcription with in-episode search." },
          { n: "Phase 18", title: "Subscriptions and collections", body: "Follow channels, series and your own lists, with a personal feed instead of an opaque algorithm." },
          { n: "Phase 19", title: "Creator dashboard", body: "Received income, per-episode audience and channel growth in a single view." },
          { n: "Phase 20", title: "Discovery", body: "Recommendations by topic and proximity, editorial highlights and an ecosystem directory." },
        ],
      },
      {
        name: "Year 3",
        range: "Phases 21 — 26",
        note: "Scale and sustainability",
        phases: [
          { n: "Phase 21", title: "Recurring payments with ZSA", body: "Subscriptions and memberships using Zcash shielded assets, once the network enables them." },
          { n: "Phase 22", title: "Public API", body: "Documented access to channels and episodes to integrate PodZcash into ecosystem sites and tools." },
          { n: "Phase 23", title: "Federated distribution", body: "Publish once and appear on other instances covering the same topic, without relying on a single server." },
          { n: "Phase 24", title: "TV and car", body: "Apps for TVs and playback on CarPlay and Android Auto, where audio is actually heard." },
          { n: "Phase 25", title: "Creator program", body: "Support, verification and training so new channels take off without depending on the team." },
          { n: "Phase 26", title: "Economic sustainability", body: "Optional memberships and transparent sponsorships, so the platform does not depend on donations." },
        ],
      },
    ],
    horizon: [
      { label: "Today:", text: "publish audio, have a channel and receive ZEC." },
      { label: "In 1 year:", text: "listen and publish from the phone, with metrics." },
      { label: "In 3 years:", text: "video, federated distribution and self-sustainability." },
    ],
  },
  funding: {
    eyebrow: "04 — Funding and donations",
    title: "Sustained by its community, not a single source",
    intro1:
      "PodZcash does not depend on a single organization. It is sustained by contributions from anyone who wants the project to exist: creators, listeners, ecosystem collectives and funds that support public infrastructure.",
    intro2:
      "The current Zcash Community Grants application covers the foundation phase: six months and USD 32,000, split into three two-month tranches. Later phases are an estimate that will be adjusted with real results and contributions.",
    ways: [
      {
        title: "Community donations",
        body: "Anyone can contribute ZEC, no minimum and no intermediaries. Funds go straight to the project's public wallet.",
        bullets: [
          "Non-custodial: nobody manages your contribution for you.",
          "No fees: 100% goes to the project.",
          "You can give once or periodically.",
          "Every contribution is reported: development, infrastructure and content.",
        ],
      },
      {
        title: "Institutional funding",
        body: "Contributions from funds, organizations or ecosystem collectives that finance public infrastructure and commons.",
        bullets: [
          "Requested in two-month tranches; never the full three years at once.",
          "Each tranche is released against verifiable deliverables.",
          "Public report at the end of each tranche.",
          "If growth is slower, the plan extends over time.",
        ],
      },
    ],
    hitos: {
      title: "The foundation phase, in three two-month tranches",
      body: "Each tranche has concrete deliverables and is paid once the previous one is verified. The application does not ask for the full three years up front.",
    },
    milestones: [
      {
        when: "Tranche 1 · Months 1–2",
        title: "Base and migration",
        amount: "USD 10,000",
        items: [
          "Production and staging VPS provisioned.",
          "Postgres in production with verified migration.",
          "Automatic backups and tested restore.",
          "Rollback plan and migration runbook.",
        ],
        verify: "Paid against the migration report and the restore test.",
      },
      {
        when: "Tranche 2 · Months 3–4",
        title: "Storage, CDN and reliability",
        amount: "USD 11,000",
        items: [
          "Audio and images on object storage with a CDN.",
          "Media migration without breaking feeds or embeds.",
          "Monitoring, alerts and runbooks.",
          "Load and rollback tests.",
        ],
        verify:
          "Paid against media served from the CDN and the alert/rollback tests.",
      },
      {
        when: "Tranche 3 · Months 5–6",
        title: "Security, documentation and beta",
        amount: "USD 11,000",
        items: [
          "Security review of auth, uploads, donations and admin.",
          "Remediation of findings.",
          "Architecture and onboarding documentation.",
          "Public beta checklist and accessibility pass.",
        ],
        verify:
          "Paid against the security report with no critical findings and validated documentation.",
      },
    ],
    totalLabel: "Phase total",
    composition: {
      title: "Budget breakdown",
      span: "6 months",
      rows: [
        {
          label: "Full-time development (6 months, 1 person)",
          value: "16,800",
          note: "",
        },
        {
          label: "Beta testing and QA (6 months, 1 person)",
          value: "7,200",
          note: "",
        },
        {
          label: "Infrastructure",
          note: "Production and staging VPS, storage, CDN and domain for 12 months",
          value: "3,000",
        },
        { label: "Security review", value: "2,500", note: "" },
        { label: "Design/UX and accessibility", value: "1,000", note: "" },
        { label: "Technical documentation", value: "300", note: "" },
        { label: "Test device and tools", value: "1,000", note: "" },
        { label: "Contingency", value: "200", note: "" },
      ],
      totalLabel: "Phase total",
      total: "USD 32,000",
      note: "Figures for six months of work. Infrastructure covers twelve months: from year two on, renewal is funded by new contributions. The current request is USD 32,000 and can be covered by donations, institutional funding or a combination of both.",
    },
    estimates: [
      {
        when: "Rest of year 1 · Phases 12–14",
        title: "Estimated plan, no amount defined",
        body: "Listening analytics, mobile app, offline and notifications. Adjusted with the results of the foundation phase.",
      },
      {
        when: "Year 2 · Phases 15 — 20",
        title: "Estimated plan, no amount defined",
        body: "Video, mobile publishing and creator dashboard. It will be adjusted with year one results and contributions received.",
      },
      {
        when: "Year 3 · Phases 21 — 26",
        title: "Estimated plan, no amount defined",
        body: "API, federated distribution, TV and sustainability. Only defined once the previous year is underway.",
      },
    ],
    donate: {
      title: "Support the project today",
      body: "Every contribution, whatever its size, becomes infrastructure, development hours and support for new creators. The address is public and movements are reported.",
      primary: "Donate in ZEC",
      secondary: "See what it funds",
      wallet: "Project wallet",
      copyLabel: "Copy address",
      copiedLabel: "Address copied",
    },
  },
  final: {
    title: "An ecosystem is told through its voices.",
    body: "PodZcash already works: there are channels, published audio and donations that reach the creator's wallet directly. What comes next is bigger —a mobile app, video and a platform that sustains itself— and it takes time. This is the plan, phase by phase, open to anyone who wants to push it forward.",
    app: "View the app",
    support: "Support the project",
    status: "Closed beta · podzcash.online",
  },
};

export const projectContent: Record<Locale, ProjectContent> = { es, en };
