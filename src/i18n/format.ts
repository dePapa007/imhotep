import type { Locale } from "@/i18n/locales";
import { getMessages } from "@/i18n/get-messages";

const localeToBcp47: Record<Locale, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  en: "en-GB",
};

export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeToBcp47[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateShort(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeToBcp47[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeToBcp47[locale], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTimeMedium(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeToBcp47[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDayHeading(date: Date, locale: Locale, reference = new Date()): string {
  const messages = getMessages(locale);
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const today = startOfDay(reference);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = startOfDay(date);
  if (day.getTime() === today.getTime()) return messages.common.today;
  if (day.getTime() === tomorrow.getTime()) return messages.common.tomorrow;
  return formatDateShort(date, locale);
}

export function reportRangeLabel(
  range: "week" | "month" | "season" | "all",
  locale: Locale,
): string {
  const messages = getMessages(locale);
  switch (range) {
    case "week":
      return messages.admin.periodThisWeek;
    case "month":
      return messages.admin.periodThisMonth;
    case "season":
      return messages.admin.periodThisSeason;
    case "all":
      return messages.admin.periodAllTime;
  }
}
