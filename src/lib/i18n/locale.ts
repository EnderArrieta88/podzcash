import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookie, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(localeCookie)?.value;

  return isLocale(value) ? value : defaultLocale;
}
