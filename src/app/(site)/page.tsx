/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import "./home.css";

export const metadata: Metadata = {
  title: { absolute: "PodZcash — Podcasts y música del ecosistema Zcash" },
  description:
    "Publica tu audio, construye tu canal y recibe donaciones directas en ZEC. Sin intermediarios y sin custodia.",
};

const wave = [38, 62, 48, 80, 56, 92, 64, 44, 74, 52, 86, 40, 68, 50, 78, 58, 34, 70];

export default function Home() {
  return (
    <div className="pz-home">
      {/* HERO */}
      <section className="hero">
        <div className="glow" />
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Hecho para el ecosistema Zcash</div>
            <h1>
              Escucha a quien está construyendo <em>Zcash</em>
            </h1>
            <p className="lead">
              Podcasts y música de la comunidad, en un solo lugar. Publica tu
              audio, construye tu canal y recibe donaciones directas en ZEC. Sin
              intermediarios y sin custodia.
            </p>
            <div className="cta-row">
              <Link className="btn btn-gold" href="/explorar">
                Explorar canales
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
              <Link className="btn btn-ghost" href="/estudio">
                Publicar mi podcast
              </Link>
            </div>
            <div className="trust">
              <div className="avatars">
                <img src="/landing/px9897984.jpg" alt="" />
                <img src="/landing/px7600895.jpg" alt="" />
                <img src="/landing/px16726135.jpg" alt="" />
              </div>
              <span>
                <b>Comunidad Zcash</b> · beta por invitación
              </span>
            </div>
          </div>

          <div className="hero-photo">
            <div className="frame">
              <span className="photo-chip">
                <span className="dot" />
                Grabando ahora
              </span>
              <img
                src="/landing/px7600895.jpg"
                alt="Creadora grabando un podcast en un estudio con micrófono y auriculares"
                fetchPriority="high"
              />
              <div className="photo-caption">
                <div className="name">Custodia propia, ep. 12</div>
                <div className="meta">Adam Curry · 42:10</div>
                <div className="wave" aria-hidden="true">
                  {wave.map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FRANJA */}
      <div className="strip">
        <div className="strip-in">
          <div className="strip-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <path d="M12 18v4" />
            </svg>
            <span>Audio primero, sin distracciones</span>
          </div>
          <div className="strip-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            <span>ZEC directo a tu wallet</span>
          </div>
          <div className="strip-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12h8" />
            </svg>
            <span>Sin custodia, sin comisiones</span>
          </div>
          <div className="strip-item" style={{ marginLeft: "auto" }}>
            <span>
              <strong>Beta</strong> · acceso por invitación
            </span>
          </div>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="pz-block" id="como-funciona">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">Cómo funciona</div>
            <h2>Tres pasos, sin fricción</h2>
            <p>
              PodZcash está pensado para que el audio sea el protagonista. Sin
              formularios eternos ni algoritmos que deciden por ti.
            </p>
          </div>
          <div className="features">
            <div className="feature">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <path d="M12 18v4" />
                </svg>
              </div>
              <h3>Creas tu canal</h3>
              <p>
                Eliges tu nombre de usuario, subes tu foto y cuentas de qué
                hablas. En minutos tienes una página propia.
              </p>
            </div>
            <div className="feature">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12" />
                  <path d="m17 8-5-5-5 5" />
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                </svg>
              </div>
              <h3>Publicas tu audio</h3>
              <p>
                Arrastras el archivo, pones portada y descripción. Tu feed RSS se
                genera solo, listo para Apple y Spotify.
              </p>
            </div>
            <div className="feature">
              <div className="ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Recibes apoyo</h3>
              <p>
                Compartes tu dirección Zcash. Quien quiera apoyarte escanea un QR
                y el pago llega directo a tu wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="pz-block" id="porque" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">Por qué PodZcash</div>
            <h2>El audio de Zcash necesita una casa propia</h2>
            <p>
              Hoy la conversación del ecosistema está dispersa entre YouTube, X y
              Spotify. PodZcash la reúne, la hace fácil de encontrar y conecta a
              los oyentes con los creadores de forma directa.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-col">
              <h3>Para quien crea</h3>
              <ol>
                <li>
                  <span className="n">01</span>
                  <div>
                    <b>Tu canal, tu audiencia</b>
                    <p>
                      Una dirección propia y un catálogo que no depende del
                      algoritmo de otra red social. Tus oyentes te encuentran a
                      ti, no a un feed.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="n">02</span>
                  <div>
                    <b>Cobras directo, sin retención</b>
                    <p>
                      Las donaciones van de wallet a wallet. PodZcash nunca toca
                      los fondos ni cobra comisión: tú controlas las llaves y el
                      dinero.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="n">03</span>
                  <div>
                    <b>Distribución, no encierro</b>
                    <p>
                      Tu feed RSS te lleva a Apple Podcasts y Spotify, y el
                      reproductor embebible te lleva a tu propia web. El contenido
                      circula y no queda encerrado.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="why-col accent">
              <h3>Para el ecosistema</h3>
              <ol>
                <li>
                  <span className="n">01</span>
                  <div>
                    <b>Da casa a la conversación</b>
                    <p>
                      Entrevistas, podcasts y música sobre Zcash dejan de estar
                      dispersos y pasan a encontrarse en un mismo lugar.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="n">02</span>
                  <div>
                    <b>Uso real de ZEC</b>
                    <p>
                      Cada apoyo es una transacción cotidiana: wallets, QR y memos
                      en uso. No una promesa, sino un pago que ocurre.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="n">03</span>
                  <div>
                    <b>Más creadores, más difusión</b>
                    <p>
                      Cada canal es una puerta de entrada a Zcash para gente que no
                      lee documentación técnica: llega por una voz, se queda por la
                      idea.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="why-band">
            <span>
              <i />
              Sin custodia
            </span>
            <span>
              <i />
              Sin comisiones
            </span>
            <span>
              <i />
              Sin depender de una sola plataforma
            </span>
            <span>
              <i />
              Hecho por y para el ecosistema
            </span>
          </div>
        </div>
      </section>

      {/* PROYECTO */}
      <section className="pz-block" id="proyecto" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="project">
            <div>
              <div className="eyebrow">El proyecto</div>
              <h2>Qué sigue y cómo se financia</h2>
              <p>
                PodZcash nació como idea a finales de 2023 y empezó a construirse
                en febrero de 2025; hoy la beta corre en un hosting compartido. En
                la página del proyecto contamos qué está listo, las 26 fases del
                plan y qué financiamiento hace falta para el primer año.
              </p>
              <div className="cta-row">
                <Link className="btn btn-gold" href="/proyecto">
                  Leer sobre el proyecto
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="project-stats">
              <div className="project-stat">
                <span>Fases</span>
                <b>8 / 26</b>
              </div>
              <div className="project-stat">
                <span>Horizonte</span>
                <b>1 — 3 años</b>
              </div>
              <div className="project-stat">
                <span>Año 1</span>
                <b>USD 30.000</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESCENAS */}
      <section className="pz-block" id="creadores" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">Hecho para audio</div>
            <h2>Voces reales, en cualquier lugar</h2>
            <p>
              Desde un estudio casero hasta la calle. Si hay una historia, hay un
              canal.
            </p>
          </div>
          <div className="scenes">
            <div className="scene tall">
              <img
                src="/landing/px9897984.jpg"
                alt="Persona grabando un podcast en su estudio"
                loading="lazy"
              />
              <div className="cap">
                <b>Estudio casero</b>
                <span>Podcast independiente</span>
              </div>
            </div>
            <div className="scene wide">
              <img
                src="/landing/px2041381.jpg"
                alt="Dos personas grabando una conversación con un micrófono"
                loading="lazy"
              />
              <div className="cap">
                <b>Conversación</b>
                <span>Cadena Fría</span>
              </div>
            </div>
            <div className="scene wide">
              <img
                src="/landing/px16726135.jpg"
                alt="Persona escuchando con auriculares y teléfono en la calle"
                loading="lazy"
              />
              <div className="cap">
                <b>En la calle</b>
                <span>Nodo Sur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTO */}
      <section className="pz-block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="product">
            <div>
              <div className="eyebrow">Tu canal</div>
              <h2>Una página propia, no un perfil perdido</h2>
              <p>
                Tu catálogo, tu bio y tus enlaces en una dirección que puedes
                compartir. El reproductor sigue sonando mientras la gente navega.
              </p>
              <div className="checks">
                <div className="check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  <span>
                    Reproductor persistente con velocidad y “continuar
                    escuchando”.
                  </span>
                </div>
                <div className="check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  <span>Feed RSS con etiquetas de Podcasting 2.0.</span>
                </div>
                <div className="check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  <span>Donaciones con QR y enlace ZIP-321, sin custodia.</span>
                </div>
              </div>
            </div>
            <div className="browser">
              <div className="browser-bar">
                <i />
                <i />
                <i />
                <span className="url">podzcash.online/c/adam-curry</span>
              </div>
              <img
                src="/landing/app.jpg"
                alt="Captura real del canal de Adam Curry en PodZcash"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DONACIONES */}
      <section className="pz-block" id="donaciones" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="donate">
            <div className="donate-copy">
              <div className="eyebrow" style={{ color: "var(--pz-gold)" }}>
                Apoyo directo
              </div>
              <h2>El dinero va del oyente a la wallet. Sin escalas.</h2>
              <p>
                PodZcash nunca retiene fondos. Escaneas un QR o abres el enlace en
                tu wallet y el pago llega directo al creador. Ni comisiones ni
                cuentas intermedias.
              </p>
              <div className="cta-row">
                <Link className="btn btn-gold" href="/explorar">
                  Ver cómo apoyar
                </Link>
                <Link className="btn btn-ghost" href="/proyecto">
                  Conocer el proyecto
                </Link>
              </div>
            </div>
            <div className="donate-photo">
              <img
                src="/landing/px8412316.jpg"
                alt="Creadora sonriendo frente al micrófono"
                loading="lazy"
              />
              <div className="qr-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                QR y enlace en cada canal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="final">
        <div className="wrap">
          <h2>Tu próximo episodio merece un lugar propio.</h2>
          <p>
            PodZcash está en beta cerrada. Publica, comparte tu canal y recibe
            apoyo en ZEC desde el primer día.
          </p>
          <div className="cta-row">
            <Link className="btn btn-gold" href="/registro">
              Pedir invitación
            </Link>
            <Link className="btn btn-ghost" href="/explorar">
              Explorar canales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
