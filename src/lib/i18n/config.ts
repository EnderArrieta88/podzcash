export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const localeCookie = "podzcash_locale";

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value) && (locales as readonly string[]).includes(value as string);
}
