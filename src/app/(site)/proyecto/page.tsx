/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { CopyAddress } from "@/components/project/copy-address";
import { projectContent } from "@/lib/i18n/project";
import { getLocale } from "@/lib/i18n/locale";
import { PROJECT_DONATION_URI, PROJECT_ZCASH_ADDRESS } from "@/lib/project";
import "./proyecto.css";

const shotImages = [
  "/landing/px7600895.jpg",
  "/landing/px8412316.jpg",
  "/landing/px16726135.jpg",
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

function PhaseGrid({
  phases,
}: {
  phases: { n: string; title: string; body: string }[];
}) {
  return (
    <div className="phase-grid">
      {phases.map((phase) => (
        <div className="phase" key={phase.n}>
          <div className="n">{phase.n}</div>
          <b>{phase.title}</b>
          <p>{phase.body}</p>
        </div>
      ))}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = projectContent[locale];

  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default async function ProjectPage() {
  const locale = await getLocale();
  const content = projectContent[locale];

  const qr = await QRCode.toDataURL(PROJECT_DONATION_URI, {
    margin: 2,
    width: 260,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0d11", light: "#ffffff" },
  });

  return (
    <div className="pz-project" lang={locale}>
      {/* HERO */}
      <section className="hero">
        <div className="glow" />
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">{content.hero.eyebrow}</div>
              <h1>
                {content.hero.titleBefore} <em>{content.hero.titleEmphasis}</em>
                {content.hero.titleAfter}
              </h1>
              <p>{content.hero.lead1}</p>
              <p>{content.hero.lead2}</p>
              <div className="hero-meta">
                <span className="pill live">
                  <span className="dot" />
                  {content.hero.live}
                </span>
                <span className="pill">{content.hero.plan}</span>
                <span className="pill">{content.hero.updated}</span>
              </div>
              <div className="hero-cta">
                <Link className="btn btn-gold" href="/">
                  {content.hero.ctaApp}
                </Link>
                <a className="btn btn-ghost" href="#financiamiento">
                  {content.hero.ctaFunding}
                </a>
              </div>
            </div>

            <div className="hero-photo">
              <span className="tag">
                <span className="dot" />
                {content.hero.tag}
              </span>
              <img
                src="/landing/px9897984.jpg"
                alt={content.hero.photoAlt}
                fetchPriority="high"
              />
              <div className="cap">
                <b>{content.hero.photoCaption}</b>
                <span>{content.hero.photoMeta}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIFRAS */}
      <div className="stats">
        {content.stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <span>{stat.label}</span>
            <b>
              {stat.value}
              {stat.suffix ? <small> {stat.suffix}</small> : null}
            </b>
            <i>{stat.sub}</i>
          </div>
        ))}
      </div>

      {/* QUÉ ES */}
      <section className="block" id="que-es">
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.about.eyebrow}</div>
            <h2>{content.about.title}</h2>
            <p>{content.about.intro1}</p>
            <p>{content.about.intro2}</p>
          </div>

          <div className="origin">
            <div className="eyebrow">{content.about.origin.eyebrow}</div>
            <h3>{content.about.origin.title}</h3>
            <p>{content.about.origin.body}</p>
            <div className="origin-grid">
              {content.about.origin.items.map((item) => (
                <div className="origin-item" key={item.when}>
                  <div className="when">{item.when}</div>
                  <b>{item.title}</b>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pillars">
            {content.about.pillars.map((pillar, index) => (
              <div className="pillar" key={pillar.title}>
                <div className="ico">
                  {index === 0 && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <path d="M12 18v4" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 11a9 9 0 0 1 9 9" />
                      <path d="M4 4a16 16 0 0 1 16 16" />
                      <circle cx="5" cy="19" r="1" />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3v18" />
                      <path d="M3 12h18" />
                    </svg>
                  )}
                </div>
                <b>{pillar.title}</b>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>

          <div className="why">
            <h3>{content.about.why.title}</h3>
            <p>{content.about.why.body}</p>

            <div className="reasons">
              {content.about.why.reasons.map((reason, index) => (
                <div className="reason" key={reason.title}>
                  <div className="n">0{index + 1}</div>
                  <b>{reason.title}</b>
                  <p>{reason.body}</p>
                </div>
              ))}
            </div>

            <div className="compare">
              <div className="compare-row">
                {content.about.compare.headers.map((header) => (
                  <div className="head" key={header}>
                    {header}
                  </div>
                ))}
              </div>
              {content.about.compare.rows.map(([label, other, ours]) => (
                <div className="compare-row" key={label}>
                  <div>{label}</div>
                  <div className="no">{other}</div>
                  <div className="yes">{ours}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ESTADO */}
      <section className="block" id="estado" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.state.eyebrow}</div>
            <h2>{content.state.title}</h2>
            <p>{content.state.intro}</p>
          </div>

          <div className="state-grid">
            {content.state.panels.map((panel) => (
              <div className="panel" key={panel.title}>
                <h3>{panel.title}</h3>
                <ul className="list">
                  {panel.items.map((item) => (
                    <li key={item.label}>
                      <Check />
                      <span className="txt">
                        <b>{item.label}</b> — {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="shots">
            {content.state.shots.map((shot, index) => (
              <div className="shot" key={shot.title}>
                <img src={shotImages[index]} alt={shot.alt} loading="lazy" />
                <div className="cap">
                  <b>{shot.title}</b>
                  <span>{shot.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN */}
      <section className="block" id="roadmap" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.plan.eyebrow}</div>
            <h2>{content.plan.title}</h2>
            <p>{content.plan.intro}</p>
          </div>

          <div className="done-card">
            <div className="head">
              <span className="badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                {content.plan.done.badge}
              </span>
              <h3>{content.plan.done.title}</h3>
            </div>
            <p>{content.plan.done.body}</p>
            <div className="chips">
              {content.plan.done.chips.map((chip) => (
                <span className="chip" key={chip.n}>
                  <b>{chip.n}</b> {chip.label}
                </span>
              ))}
            </div>
          </div>

          {content.plan.years.map((year) => (
            <div className="year" key={year.name}>
              <div className="year-head">
                <h3>{year.name}</h3>
                <span className="range">{year.range}</span>
                <span className="note">{year.note}</span>
              </div>
              <PhaseGrid phases={year.phases} />
            </div>
          ))}

          <div className="horizon">
            {content.plan.horizon.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 ? <i /> : null}
                <span>
                  <b>{item.label}</b> {item.text}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCIAMIENTO */}
      <section className="block" id="financiamiento" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow">{content.funding.eyebrow}</div>
            <h2>{content.funding.title}</h2>
            <p>{content.funding.intro1}</p>
            <p>{content.funding.intro2}</p>
          </div>

          <div className="ways">
            {content.funding.ways.map((way, index) => (
              <div className={index === 0 ? "way accent" : "way"} key={way.title}>
                <h3>{way.title}</h3>
                <p>{way.body}</p>
                <ul>
                  {way.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hitos-head">
            <h3>{content.funding.hitos.title}</h3>
            <p>{content.funding.hitos.body}</p>
          </div>

          <div className="milestones">
            {content.funding.milestones.map((milestone) => (
              <div className="milestone" key={milestone.when}>
                <div className="milestone-head">
                  <div>
                    <span className="when">{milestone.when}</span>
                    <h4>{milestone.title}</h4>
                  </div>
                  <span className="amount">{milestone.amount}</span>
                </div>
                <ul>
                  {milestone.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="verify">{milestone.verify}</p>
              </div>
            ))}

            <div className="milestone-total">
              <span>{content.funding.totalLabel}</span>
              <b>{content.funding.composition.total}</b>
            </div>
          </div>

          <div className="budget">
            <div className="budget-head">
              <h3>{content.funding.composition.title}</h3>
              <span>{content.funding.composition.span}</span>
            </div>
            {content.funding.composition.rows.map((row) => (
              <div className="budget-row" key={row.label}>
                <div className="label">
                  {row.label}
                  {row.note ? <small>{row.note}</small> : null}
                </div>
                <b>{row.value}</b>
              </div>
            ))}
            <div className="budget-row total">
              <div className="label">{content.funding.composition.totalLabel}</div>
              <b>{content.funding.composition.total}</b>
            </div>
            <div className="budget-note">{content.funding.composition.note}</div>
          </div>

          <div className="estimate">
            {content.funding.estimates.map((estimate) => (
              <div key={estimate.when}>
                <div className="when">{estimate.when}</div>
                <b>{estimate.title}</b>
                <p>{estimate.body}</p>
              </div>
            ))}
          </div>

          <div className="donate">
            <div>
              <h3>{content.funding.donate.title}</h3>
              <p>{content.funding.donate.body}</p>
              <div className="hero-cta" style={{ marginTop: 20 }}>
                <a className="btn btn-gold" href={PROJECT_DONATION_URI}>
                  {content.funding.donate.primary}
                </a>
                <a className="btn btn-ghost" href="#roadmap">
                  {content.funding.donate.secondary}
                </a>
              </div>
            </div>
            <div className="w-[184px] rounded-[14px] border border-border bg-bg/70 p-3 backdrop-blur">
              <img
                src={qr}
                alt={content.funding.donate.wallet}
                width={132}
                height={132}
                className="mx-auto block size-[132px] rounded-md bg-white p-[5px]"
              />
              <span className="mt-2.5 block text-center font-mono text-[8px] uppercase tracking-[0.16em] text-subtle">
                {content.funding.donate.wallet}
              </span>
              <CopyAddress
                address={PROJECT_ZCASH_ADDRESS}
                copyLabel={content.funding.donate.copyLabel}
                copiedLabel={content.funding.donate.copiedLabel}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="final">
        <div className="wrap">
          <h2>{content.final.title}</h2>
          <p>{content.final.body}</p>
          <div className="hero-cta">
            <Link className="btn btn-gold" href="/">
              {content.final.app}
            </Link>
            <a className="btn btn-ghost" href="#financiamiento">
              {content.final.support}
            </a>
          </div>
          <div className="status">
            <span className="dot" />
            {content.final.status}
          </div>
        </div>
      </section>
    </div>
  );
}
