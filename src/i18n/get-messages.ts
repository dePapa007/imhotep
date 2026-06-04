import { enMessages } from "@/i18n/messages/en";
import { frMessages } from "@/i18n/messages/fr";
import { nlMessages, type Messages } from "@/i18n/messages/nl";
import type { Locale } from "@/i18n/locales";

const catalogs: Record<Locale, Messages> = {
  nl: nlMessages,
  fr: frMessages,
  en: enMessages,
};

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}

export type MessageParams = Record<string, string | number>;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function createTranslator(locale: Locale) {
  const messages = getMessages(locale);
  return function t(path: string, params?: MessageParams): string {
    const value = getNestedValue(messages, path);
    if (!value) return path;
    return interpolate(value, params);
  };
}

export type Translator = ReturnType<typeof createTranslator>;

type MessageTree = { [key: string]: string | MessageTree };

/** Flat map for client provider (dot keys). */
export function flattenMessages(
  obj: MessageTree,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[path] = value;
    } else if (value && typeof value === "object") {
      Object.assign(result, flattenMessages(value, path));
    }
  }
  return result;
}
