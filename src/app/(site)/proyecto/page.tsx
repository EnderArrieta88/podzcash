/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { CopyAddress } from "@/components/project/copy-address";
import {
  PROJECT_DONATION_URI,
  PROJECT_ZCASH_ADDRESS,
} from "@/lib/project";
import "./proyecto.css";

export const metadata: Metadata = {
  title: "El proyecto",
  description:
    "Qué es PodZcash, qué funciona hoy, el plan de 26 fases y el financiamiento del primer año.",
};

const completedPhases = [
  ["01", "Fundaciones"],
  ["02", "Cuentas e invitaciones"],
  ["03", "Canales"],
  ["04", "Subida de audio"],
  ["05", "Reproductor"],
  ["06", "Búsqueda"],
  ["07", "Donaciones ZEC y RSS"],
  ["08", "Moderación y admin"],
];

const year1 = [
  ["Fase 09", "Base de datos escalable", "Migración a Postgres con índices de búsqueda y consultas preparadas para miles de episodios."],
  ["Fase 10", "Almacenamiento y CDN", "Audio en almacenamiento de objetos con caché en el borde, para que el streaming no dependa del servidor."],
  ["Fase 11", "Backups y monitoreo", "Copias automáticas, alertas de caída y recuperación probada. Lo que hoy es manual pasa a ser rutina."],
  ["Fase 12", "Analíticas de escucha", "Reproducciones, retención por episodio y origen del tráfico, visibles para cada creador."],
  ["Fase 13", "App móvil de escucha", "iOS y Android: reproducción en segundo plano, cola, velocidad y continuar donde quedó."],
  ["Fase 14", "Offline y notificaciones", "Descarga de episodios y avisos de nuevos lanzamientos de los canales que sigues."],
];

const year2 = [
  ["Fase 15", "Publicar desde el móvil", "Grabar o subir desde el teléfono, con recorte y portada. Publicar ya no requiere un equipo de escritorio."],
  ["Fase 16", "Video podcast", "HLS adaptativo, miniaturas y reproducción sincronizada con el audio. El formato deja de ser solo audio."],
  ["Fase 17", "Capítulos y transcripciones", "Capítulos navegables y transcripción automática con búsqueda dentro del episodio."],
  ["Fase 18", "Suscripciones y colecciones", "Seguir canales, series y listas propias, con un feed personal en lugar de un algoritmo opaco."],
  ["Fase 19", "Panel del creador", "Ingresos recibidos, audiencia por episodio y evolución del canal en una sola vista."],
  ["Fase 20", "Descubrimiento", "Recomendaciones por tema y cercanía, destacados editoriales y directorio del ecosistema."],
];

const year3 = [
  ["Fase 21", "Pagos recurrentes con ZSA", "Suscripciones y membresías usando assets protegidos de Zcash, cuando la red los habilite."],
  ["Fase 22", "API pública", "Acceso documentado a canales y episodios para integrar PodZcash en sitios y herramientas del ecosistema."],
  ["Fase 23", "Distribución federada", "Publicar una vez y aparecer en otras instancias que hablen del mismo tema, sin depender de un servidor único."],
  ["Fase 24", "TV y auto", "Apps para televisores y reproducción en CarPlay y Android Auto, donde el audio se escucha de verdad."],
  ["Fase 25", "Programa de creadores", "Acompañamiento, verificación y formación para que nuevos canales despeguen sin depender del equipo."],
  ["Fase 26", "Sostenibilidad económica", "Membresías opcionales y patrocinios transparentes, para que la plataforma no dependa de donaciones."],
];

function Check() {
  return (
    <svg
      className="ok"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function PhaseGrid({ phases }: { phases: string[][] }) {
  return (
    <div className="phase-grid">
      {phases.map(([phase, title, body]) => (
        <div className="phase" key={phase}>
          <div className="n">{phase}</div>
          <b>{title}</b>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

export default async function ProjectPage() {
  const qr = await QRCode.toDataURL(PROJECT_DONATION_URI, {
    margin: 2,
    width: 260,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0d11", light: "#ffffff" },
  });

  return (
    <div className="pz-project">
      {/* HERO */}
      <section className="hero">
        <div className="glow" />
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">El proyecto · Estado y financiamiento</div>
              <h1>
                PodZcash es la casa del audio de <em>Zcash</em>.
              </h1>
              <p>
                Una plataforma de podcasts y música donde los creadores del
                ecosistema publican su trabajo, se dan a conocer y reciben ZEC
                directo a su wallet.
              </p>
              <p>
                Esta página cuenta qué es, qué funciona hoy, qué falta para que
                crezca y cómo se financia. Sin métricas infladas ni promesas
                vacías.
              </p>
              <div className="hero-meta">
                <span className="pill live">
                  <span className="dot" />
                  Beta cerrada en producción
                </span>
                <span className="pill">Plan 2026 — 2029</span>
                <span className="pill">Actualizado el 5 de noviembre de 2026</span>
              </div>
              <div className="hero-cta">
                <Link className="btn btn-gold" href="/">
                  Ver la aplicación
                </Link>
                <a className="btn btn-ghost" href="#financiamiento">
                  Cómo se financia
                </a>
              </div>
            </div>

            <div className="hero-photo">
              <span className="tag">
                <span className="dot" />
                Hoy, en producción
              </span>
              <img
                src="/landing/px9897984.jpg"
                alt="Creador grabando un podcast en su estudio con micrófono y auriculares"
                fetchPriority="high"
              />
              <div className="cap">
                <b>Ya se puede publicar y escuchar</b>
                <span>podzcash.online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIFRAS */}
      <div className="stats">
        <div className="stat">
          <span>Fases del plan</span>
          <b>
            8 <small>/ 26</small>
          </b>
          <i>18 por delante</i>
        </div>
        <div className="stat">
          <span>Funcionalidades</span>
          <b>8</b>
          <i>Cuentas, audio, búsqueda, ZEC, RSS</i>
        </div>
        <div className="stat">
          <span>Horizonte</span>
          <b>1 — 3 años</b>
          <i>Según financiamiento y crecimiento</i>
        </div>
        <div className="stat">
          <span>Estado</span>
          <b>Beta</b>
          <i>Invitación, sin registro abierto</i>
        </div>
      </div>

      {/* QUÉ ES */}
      <section className="pz-block" id="que-es">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">01 — Qué es PodZcash</div>
            <h2>El audio de un ecosistema, en un lugar que es suyo</h2>
            <p>
              Hoy la conversación sobre Zcash vive en YouTube, en X y en podcasts
              alojados en plataformas genéricas. Los creadores no cobran en ZEC,
              los oyentes no pueden apoyarlos sin salir del ecosistema y el
              contenido queda atado al algoritmo de otra empresa.
            </p>
            <p>
              PodZcash es una plataforma de audio nativa de Zcash: cada creador
              tiene su canal con dirección propia, publica episodios, y recibe
              apoyo directo a su wallet. Sin custodia, sin comisiones y sin
              intermediarios.
            </p>
          </div>

          <div className="origin">
            <div className="eyebrow">Contexto</div>
            <h3>Una idea de finales de 2023, construida sin recursos</h3>
            <p>
              PodZcash no nació con un equipo ni con financiamiento. Empezó como
              una idea a finales de 2023, comenzó a materializarse en febrero de
              2025 y hoy la beta corre en un hosting compartido, porque el
              proyecto todavía no tiene recursos propios. Cada fase se construye
              a mano y con lo mínimo para mantenerse en pie.
            </p>
            <div className="origin-grid">
              <div className="origin-item">
                <div className="when">Finales de 2023</div>
                <b>La idea</b>
                <p>
                  Primer boceto de una plataforma de audio pensada para el
                  ecosistema Zcash.
                </p>
              </div>
              <div className="origin-item">
                <div className="when">Febrero de 2025</div>
                <b>Primeras líneas</b>
                <p>
                  Arranca el desarrollo con recursos propios y sin ningún tipo de
                  financiamiento.
                </p>
              </div>
              <div className="origin-item">
                <div className="when">Hoy</div>
                <b>Beta en producción</b>
                <p>
                  Corriendo en hosting compartido, con lo justo para sostener la
                  beta abierta por invitación.
                </p>
              </div>
            </div>
          </div>

          <div className="pillars">
            <div className="pillar">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <path d="M12 18v4" />
                </svg>
              </div>
              <b>Un canal, no un perfil</b>
              <p>
                Dirección propia, catálogo y bio en una página que se comparte y
                no depende de un feed.
              </p>
            </div>
            <div className="pillar">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <b>ZEC directo a tu wallet</b>
              <p>
                QR y enlace ZIP-321. El pago va del oyente al creador: la
                plataforma nunca toca los fondos.
              </p>
            </div>
            <div className="pillar">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 11a9 9 0 0 1 9 9" />
                  <path d="M4 4a16 16 0 0 1 16 16" />
                  <circle cx="5" cy="19" r="1" />
                </svg>
              </div>
              <b>Distribución abierta</b>
              <p>
                Feed RSS para Apple y Spotify, reproductor embebible y planes de
                API. El contenido no queda encerrado en una sola aplicación.
              </p>
            </div>
            <div className="pillar">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </div>
              <b>Hecho para Zcash</b>
              <p>
                No es una app genérica con un logo encima: el producto está
                pensado alrededor de ZEC y su comunidad.
              </p>
            </div>
          </div>

          <div className="why">
            <h3>No es una aplicación más: es la capa de audio que a Zcash le falta</h3>
            <p>
              Zcash tiene una de las tecnologías más sólidas del espacio y, sin
              embargo, muy poca narrativa humana. La gente no adopta privacidad
              leyendo un documento técnico: la adopta cuando alguien se lo explica
              con su propia voz. Eso es lo que falta, y es lo que PodZcash
              construye.
            </p>

            <div className="reasons">
              <div className="reason">
                <div className="n">01</div>
                <b>Cada creador es una puerta de entrada</b>
                <p>
                  Un oyente llega por un episodio y termina entendiendo qué es
                  ZEC, cómo se usa y por qué importa. Sin tutoriales ni fricción.
                </p>
              </div>
              <div className="reason">
                <div className="n">02</div>
                <b>Uso real de ZEC, todos los días</b>
                <p>
                  Cada apoyo es una transacción cotidiana: wallets, QR y memos en
                  uso. Privacidad que se practica, no que se promete.
                </p>
              </div>
              <div className="reason">
                <div className="n">03</div>
                <b>Infraestructura pública</b>
                <p>
                  RSS, embeds y API significan que el contenido circula fuera de
                  la plataforma y alimenta a todo el ecosistema.
                </p>
              </div>
            </div>

            <div className="compare">
              <div className="compare-row">
                <div className="head">Hoy, en otras plataformas</div>
                <div className="head">Otra plataforma de audio</div>
                <div className="head">PodZcash</div>
              </div>
              <div className="compare-row">
                <div>Comisión por donación</div>
                <div className="no">5 % — 10 %</div>
                <div className="yes">0 %</div>
              </div>
              <div className="compare-row">
                <div>Custodia del dinero</div>
                <div className="no">La plataforma</div>
                <div className="yes">Tu wallet</div>
              </div>
              <div className="compare-row">
                <div>Moneda del apoyo</div>
                <div className="no">Fiat con retiros y demoras</div>
                <div className="yes">ZEC directo</div>
              </div>
              <div className="compare-row">
                <div>Distribución</div>
                <div className="no">Dentro de la app</div>
                <div className="yes">RSS, embeds y API</div>
              </div>
              <div className="compare-row">
                <div>Contenido sobre Zcash</div>
                <div className="no">Disperso y sin contexto</div>
                <div className="yes">Reunido y fácil de encontrar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADO */}
      <section className="pz-block" id="estado" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">02 — Estado actual</div>
            <h2>Lo que ya funciona</h2>
            <p>
              Todo esto está implementado y corriendo en producción, no es un
              mockup ni una idea.
            </p>
          </div>

          <div className="state-grid">
            <div className="panel">
              <h3>Listo y en uso</h3>
              <ul className="list">
                <li>
                  <Check />
                  <span className="txt">
                    <b>Cuentas e invitaciones</b> — registro cerrado con códigos
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>Canales</b> — perfil, bio, avatar, enlaces y página pública
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>Subida de audio</b> — streaming a disco, portadas y
                    borradores
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>Reproductor persistente</b> — no se corta al navegar
                  </span>
                </li>
              </ul>
            </div>
            <div className="panel">
              <h3>También listo</h3>
              <ul className="list">
                <li>
                  <Check />
                  <span className="txt">
                    <b>Búsqueda full-text</b> — títulos, descripciones, etiquetas
                    y canales
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>Donaciones ZEC</b> — QR y enlace ZIP-321, sin custodia
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>RSS y embeds</b> — Podcasting 2.0 y reproductor insertable
                  </span>
                </li>
                <li>
                  <Check />
                  <span className="txt">
                    <b>Administración</b> — reportes, suspensión y limpieza de
                    archivos
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="shots">
            <div className="shot">
              <img src="/landing/px7600895.jpg" alt="Creadora grabando en un estudio con paneles acústicos" loading="lazy" />
              <div className="cap">
                <b>Grabar desde casa</b>
                <span>Sin equipo profesional</span>
              </div>
            </div>
            <div className="shot">
              <img src="/landing/px8412316.jpg" alt="Creadora frente al micrófono en un estudio" loading="lazy" />
              <div className="cap">
                <b>Publicar tu canal</b>
                <span>Una dirección propia</span>
              </div>
            </div>
            <div className="shot">
              <img src="/landing/px16726135.jpg" alt="Persona escuchando con auriculares en la calle" loading="lazy" />
              <div className="cap">
                <b>Escuchar donde sea</b>
                <span>Hoy, desde el navegador</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAN */}
      <section className="pz-block" id="roadmap" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">03 — Plan de desarrollo</div>
            <h2>26 fases, no una promesa</h2>
            <p>
              Ocho fases ya están en producción. Las otras dieciocho están
              ordenadas por dependencia: cada una se construye sobre la anterior.
              El ritmo depende del financiamiento y del crecimiento real de la
              comunidad.
            </p>
          </div>

          <div className="done-card">
            <div className="head">
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                Completado
              </span>
              <h3>Fases 01 — 08 · MVP en producción</h3>
            </div>
            <p>
              Un creador ya puede registrarse por invitación, crear su canal,
              subir audio, publicarlo con RSS y recibir ZEC directo a su wallet.
              Con moderación y administración funcionando.
            </p>
            <div className="chips">
              {completedPhases.map(([number, label]) => (
                <span className="chip" key={number}>
                  <b>{number}</b> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="year">
            <div className="year-head">
              <h3>Año 1</h3>
              <span className="range">Fases 09 — 14</span>
              <span className="note">Base sólida y app móvil</span>
            </div>
            <PhaseGrid phases={year1} />
          </div>

          <div className="year">
            <div className="year-head">
              <h3>Año 2</h3>
              <span className="range">Fases 15 — 20</span>
              <span className="note">Video, creadores y descubrimiento</span>
            </div>
            <PhaseGrid phases={year2} />
          </div>

          <div className="year">
            <div className="year-head">
              <h3>Año 3</h3>
              <span className="range">Fases 21 — 26</span>
              <span className="note">Escala y sostenibilidad</span>
            </div>
            <PhaseGrid phases={year3} />
          </div>

          <div className="horizon">
            <span>
              <b>Hoy:</b> publicar audio, tener canal y recibir ZEC.
            </span>
            <i />
            <span>
              <b>En 1 año:</b> escuchar y publicar desde el teléfono, con métricas.
            </span>
            <i />
            <span>
              <b>En 3 años:</b> video, distribución federada y sostenibilidad
              propia.
            </span>
          </div>
        </div>
      </section>

      {/* FINANCIAMIENTO */}
      <section className="pz-block" id="financiamiento" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">04 — Financiamiento y donaciones</div>
            <h2>Sostenido por su comunidad, no por una sola fuente</h2>
            <p>
              PodZcash no depende de una única organización. Se sostiene con
              aportes de cualquiera que quiera que el proyecto exista: creadores,
              oyentes, colectivos del ecosistema y fondos que apoyan
              infraestructura pública.
            </p>
            <p>
              Hoy solo hay un monto definido: lo necesario para el primer año.
              Todo lo demás es un plan estimado que se irá ajustando con
              resultados y aportes reales.
            </p>
          </div>

          <div className="ways">
            <div className="way accent">
              <h3>Donaciones de la comunidad</h3>
              <p>
                Cualquier persona puede aportar ZEC, sin mínimo y sin
                intermediarios. Los fondos llegan directo a la wallet pública del
                proyecto.
              </p>
              <ul>
                <li>Sin custodia: nadie administra tu aporte por ti.</li>
                <li>Sin comisiones: el 100 % se destina al proyecto.</li>
                <li>Se puede aportar una vez o de forma periódica.</li>
                <li>Cada aporte se reporta: desarrollo, infraestructura y contenido.</li>
              </ul>
            </div>
            <div className="way">
              <h3>Financiamiento institucional</h3>
              <p>
                Aportes de fondos, organizaciones o colectivos del ecosistema que
                financian infraestructura pública y bienes comunes.
              </p>
              <ul>
                <li>Se solicita por tramos; nunca los tres años completos de una vez.</li>
                <li>Cada tramo se libera contra hitos entregados y verificables.</li>
                <li>Reporte público al cerrar cada tramo.</li>
                <li>Si el crecimiento es menor, el plan se extiende en el tiempo.</li>
              </ul>
            </div>
          </div>

          <div className="budget">
            <div className="budget-head">
              <h3>Año 1 · lo único que pedimos hoy</h3>
              <span>USD 30.000</span>
            </div>
            <div className="budget-row">
              <div className="label">Desarrollo full-time (12 meses, 1 persona)</div>
              <b>18.000</b>
            </div>
            <div className="budget-row">
              <div className="label">Diseño de producto y marca</div>
              <b>3.000</b>
            </div>
            <div className="budget-row">
              <div className="label">
                Infraestructura
                <small>VPS contratado por 1 año, más almacenamiento y dominio</small>
              </div>
              <b>1.300</b>
            </div>
            <div className="budget-row">
              <div className="label">Auditoría de seguridad</div>
              <b>4.000</b>
            </div>
            <div className="budget-row">
              <div className="label">Onboarding de creadores y contenido</div>
              <b>2.000</b>
            </div>
            <div className="budget-row">
              <div className="label">Contingencia</div>
              <b>1.700</b>
            </div>
            <div className="budget-row total">
              <div className="label">Total del año 1</div>
              <b>USD 30.000</b>
            </div>
            <div className="budget-note">
              Cifras estimadas para doce meses de trabajo. La infraestructura cubre
              un VPS por un año completo: a partir del segundo año, la renovación
              se financia con nuevos aportes. El monto total puede cubrirse con
              donaciones, con financiamiento institucional o con una combinación de
              ambos. Se rinde por hitos: plataforma estable, backups, analíticas y
              app móvil.
            </div>
          </div>

          <div className="estimate">
            <div>
              <div className="when">Año 2 · Fases 15 — 20</div>
              <b>Plan estimado, sin monto definido</b>
              <p>
                Video, publicación móvil y panel de creador. Se ajustará con los
                resultados del año 1 y los aportes recibidos.
              </p>
            </div>
            <div>
              <div className="when">Año 3 · Fases 21 — 26</div>
              <b>Plan estimado, sin monto definido</b>
              <p>
                API, distribución federada, TV y sostenibilidad. Solo se define
                cuando el año anterior esté en marcha.
              </p>
            </div>
          </div>

          <div className="donate">
            <div>
              <h3>Apoyar el proyecto hoy</h3>
              <p>
                Cada aporte, del tamaño que sea, se convierte en infraestructura,
                horas de desarrollo y acompañamiento a nuevos creadores. La
                dirección es pública y los movimientos se reportan.
              </p>
              <div className="hero-cta" style={{ marginTop: 20 }}>
                <a className="btn btn-gold" href={PROJECT_DONATION_URI}>
                  Donar en ZEC
                </a>
                <a className="btn btn-ghost" href="#roadmap">
                  Ver qué financia
                </a>
              </div>
            </div>
            <div className="w-[184px] rounded-[14px] border border-border bg-bg/70 p-3 backdrop-blur">
              <img
                src={qr}
                alt="Código QR con la dirección Zcash del proyecto"
                width={132}
                height={132}
                className="mx-auto block size-[132px] rounded-md bg-white p-[5px]"
              />
              <span className="mt-2.5 block text-center font-mono text-[8px] uppercase tracking-[0.16em] text-subtle">
                Wallet del proyecto
              </span>
              <CopyAddress address={PROJECT_ZCASH_ADDRESS} />
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="final">
        <div className="wrap">
          <h2>Un ecosistema se cuenta por sus voces.</h2>
          <p>
            PodZcash ya funciona: hay canales, audio publicado y donaciones que
            llegan directo a la wallet del creador. Lo que sigue es más grande
            —una app móvil, video y una plataforma que se sostenga sola— y lleva
            tiempo. Este es el plan, fase por fase, abierto a quien quiera
            impulsarlo.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-gold" href="/">
              Ver la aplicación
            </Link>
            <a className="btn btn-ghost" href="#financiamiento">
              Apoyar el proyecto
            </a>
          </div>
          <div className="status">
            <span className="dot" />
            Beta cerrada · podzcash.online
          </div>
        </div>
      </section>
    </div>
  );
}
