export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return "--:--";

  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  const paddedRest = String(rest).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedRest}`;
  }

  return `${minutes}:${paddedRest}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

import type { Locale } from "@/lib/i18n/config";

const dateFormatters: Record<Locale, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  en: new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
};

export function formatDate(date: Date, locale: Locale = "es"): string {
  return dateFormatters[locale].format(date);
}

export function relativeDate(date: Date, locale: Locale = "es"): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);

  if (locale === "en") {
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    return formatDate(date, locale);
  }

  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;

  return formatDate(date, locale);
}
