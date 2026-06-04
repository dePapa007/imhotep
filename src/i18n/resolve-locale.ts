import "server-only";

import { cookies } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/i18n/locales";

export const LOCALE_COOKIE = "locale";

export async function getLocaleCookie(): Promise<Locale | null> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return null;
}

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Anonymous pages: cookie only, else Dutch default. */
export async function resolveLocale(
  userLocale?: Locale | null,
): Promise<Locale> {
  const cookie = await getLocaleCookie();
  if (cookie) return cookie;
  if (userLocale) return userLocale;
  return defaultLocale;
}
