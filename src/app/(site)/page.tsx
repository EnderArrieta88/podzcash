/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { homeContent } from "@/lib/i18n/home";
import { getLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { episodePath } from "@/lib/routes";
import { formatDuration } from "@/lib/format";
import "./home.css";

const wave = [38, 62, 48, 80, 56, 92, 64, 44, 74, 52, 86, 40, 68, 50, 78, 58, 34, 70];

const featureIcons = [
  <svg
    key="mic"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <path d="M12 18v4" />
  </svg>,
  <svg
    key="upload"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 3v12" />
    <path d="m17 8-5-5-5 5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </svg>,
  <svg
    key="shield"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
];

const sceneMedia = [
  { src: "/landing/px9897984.jpg", className: "scene tall" },
  { src: "/landing/px2041381.jpg", className: "scene wide" },
  { src: "/landing/px16726135.jpg", className: "scene wide" },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = homeContent[locale];

  return {
    title: { absolute: content.meta.title },
    description: content.meta.description,
  };
}

export default async function Home() {
  const locale = await getLocale();
  const content = homeContent[locale];

  const latest = await prisma.episode.findFirst({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      title: true,
      slug: true,
      durationSec: true,
      coverKey: true,
      channel: {
        select: { handle: true, displayName: true, avatarKey: true },
      },
    },
  });

  const heroImage = latest
    ? latest.channel.avatarKey
      ? storage.url(latest.channel.avatarKey)
      : latest.coverKey
        ? storage.url(latest.coverKey)
        : null
    : null;

  const heroAlt = latest
    ? latest.channel.avatarKey
      ? content.hero.channelAlt(latest.channel.displayName)
      : content.hero.coverAlt(latest.title)
    : "";

  return (
    <div className="pz-home" lang={locale}>
      {/* HERO */}
      <section className="hero">
        <div className="glow" />
        <div className="hero-grid">
          <div>
            <div className="eyebrow">{content.hero.eyebrow}</div>
            <h1>
              {content.hero.titleBefore} <em>{content.hero.titleEmphasis}</em>
            </h1>
            <p className="lead">{content.hero.lead}</p>
            <div className="cta-row">
              <Link className="btn btn-gold" href="/explorar">
                {content.hero.explore}
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
              <Link className="btn btn-ghost" href="/lista-de-espera">
                {content.hero.publish}
              </Link>
            </div>
            <div className="trust">
              <span>
                <b>{content.hero.trustBold}</b>
                {content.hero.trustRest}
              </span>
            </div>
          </div>

          <div className="hero-photo">
            {latest ? (
              <Link
                className="frame"
                href={episodePath(latest.channel.handle, latest.slug)}
              >
                <span className="photo-chip">
                  <span className="dot latest" />
                  {content.hero.latest}
                </span>
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={heroAlt}
                    fetchPriority="high"
                  />
                ) : null}
                <div className="photo-caption">
                  <div className="name">{latest.title}</div>
                  <div className="meta">
                    {latest.channel.displayName} ·{" "}
                    {formatDuration(latest.durationSec)}
                  </div>
                  <div className="wave" aria-hidden="true">
                    {wave.map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="frame">
                <span className="photo-chip">
                  <span className="dot latest" />
                  {content.hero.latest}
                </span>
                <div className="photo-caption">
                  <div className="name">{content.hero.emptyTitle}</div>
                  <div className="meta">{content.hero.emptyMeta}</div>
                </div>
              </div>
            )}
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
            <span>{content.strip.audioFirst}</span>
          </div>
          <div className="strip-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            <span>{content.strip.zecDirect}</span>
          </div>
          <div className="strip-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12h8" />
            </svg>
            <span>{content.strip.noCustody}</span>
          </div>
          <div className="strip-item" style={{ marginLeft: "auto" }}>
            <span>
              <strong>{content.strip.beta}</strong>
              {content.strip.betaRest}
            </span>
          </div>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section className="pz-block" id="como-funciona">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.how.eyebrow}</div>
            <h2>{content.how.title}</h2>
            <p>{content.how.intro}</p>
          </div>
          <div className="features">
            {content.how.steps.map((step, index) => (
              <div className="feature" key={step.title}>
                <div className="ico">{featureIcons[index]}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="pz-block" id="porque" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.why.eyebrow}</div>
            <h2>{content.why.title}</h2>
            <p>{content.why.intro}</p>
          </div>

          <div className="why-grid">
            <div className="why-col">
              <h3>{content.why.creatorLabel}</h3>
              <ol>
                {content.why.creator.map((item, index) => (
                  <li key={item.title}>
                    <span className="n">0{index + 1}</span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="why-col accent">
              <h3>{content.why.ecosystemLabel}</h3>
              <ol>
                {content.why.ecosystem.map((item, index) => (
                  <li key={item.title}>
                    <span className="n">0{index + 1}</span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="why-band">
            {content.why.band.map((item) => (
              <span key={item}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROYECTO */}
      <section className="pz-block" id="proyecto" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="project">
            <div>
              <div className="eyebrow">{content.project.eyebrow}</div>
              <h2>{content.project.title}</h2>
              <p>{content.project.body}</p>
              <div className="cta-row">
                <Link className="btn btn-gold" href="/proyecto">
                  {content.project.cta}
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
              {content.project.stats.map((stat) => (
                <div className="project-stat" key={stat.label}>
                  <span>{stat.label}</span>
                  <b>{stat.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ESCENAS */}
      <section className="pz-block" id="creadores" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.scenes.eyebrow}</div>
            <h2>{content.scenes.title}</h2>
            <p>{content.scenes.intro}</p>
          </div>
          <div className="scenes">
            {content.scenes.items.map((item, index) => (
              <div className={sceneMedia[index].className} key={item.title}>
                <img
                  src={sceneMedia[index].src}
                  alt={item.alt}
                  loading="lazy"
                />
                <div className="cap">
                  <b>{item.title}</b>
                  <span>{item.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTO */}
      <section className="pz-block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="product">
            <div>
              <div className="eyebrow">{content.product.eyebrow}</div>
              <h2>{content.product.title}</h2>
              <p>{content.product.body}</p>
              <div className="checks">
                {content.product.checks.map((check) => (
                  <div className="check" key={check}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="browser">
              <div className="browser-bar">
                <i />
                <i />
                <i />
                <span className="url">{content.product.browserUrl}</span>
              </div>
              <img
                src="/landing/app.jpg"
                alt={content.product.alt}
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
                {content.donate.eyebrow}
              </div>
              <h2>{content.donate.title}</h2>
              <p>{content.donate.body}</p>
              <div className="cta-row">
                <Link className="btn btn-gold" href="/explorar">
                  {content.donate.primary}
                </Link>
                <Link className="btn btn-ghost" href="/proyecto">
                  {content.donate.secondary}
                </Link>
              </div>
            </div>
            <div className="donate-photo">
              <img
                src="/landing/px8412316.jpg"
                alt={content.donate.photoAlt}
                loading="lazy"
              />
              <div className="qr-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                {content.donate.note}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="final">
        <div className="wrap">
          <h2>{content.final.title}</h2>
          <p>{content.final.body}</p>
          <div className="cta-row">
            <Link className="btn btn-gold" href="/lista-de-espera">
              {content.final.primary}
            </Link>
            <Link className="btn btn-ghost" href="/explorar">
              {content.final.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
