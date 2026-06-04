"use client";

import * as React from "react";

import {
  createTranslator,
  flattenMessages,
  getMessages,
  type MessageParams,
  type Translator,
} from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";

const LocaleContext = React.createContext<{
  locale: Locale;
  t: Translator;
} | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({
      locale,
      t: createTranslator(locale),
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslations(): Translator {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within LocaleProvider");
  }
  return ctx.t;
}

export function useLocale(): Locale {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx.locale;
}

/** For login page without full provider tree — pass flat messages. */
export function LoginLocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}

export { flattenMessages, getMessages, type MessageParams };
