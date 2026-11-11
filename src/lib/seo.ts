import "server-only";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { env } from "@/lib/env";

export const SITE_URL = (env.SITE_URL ?? "https://podzcash.online").replace(
  /\/+$/,
  "",
);

export const DEFAULT_OG_IMAGE = "/landing/app.jpg";

const OG_LOCALE: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function isoDuration(
  seconds: number | null | undefined,
): string | undefined {
  if (!seconds || seconds <= 0) return undefined;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.round(seconds % 60);

  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${
    rest ? `${rest}S` : ""
  }`;
}

type SocialInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  imageAlt?: string;
  locale: Locale;
  type?: "website" | "article";
};

export function socialMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  locale,
  type = "website",
}: SocialInput): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
  const images = [{ url: imageUrl, alt: imageAlt ?? title }];
  const text = description ?? undefined;

  return {
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description: text,
      siteName: "PodZcash",
      locale: OG_LOCALE[locale],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: text,
      images,
    },
  };
}

/**
 * Serializa JSON-LD de forma segura para incrustarlo en un <script>.
 * Evita que un título con "</script>" cierre la etiqueta.
 */
export function jsonLd(data: unknown): { __html: string } {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
