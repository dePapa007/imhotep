export const LOCALES = ["nl", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const defaultLocale: Locale = "nl";

export const localeLabels: Record<Locale, string> = {
  nl: "Nederlands",
  fr: "Français",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
