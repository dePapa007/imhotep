import type { Locale } from "@prisma/client";

import { formatDateTime } from "@/i18n/format";

export function formatSessionDateTime(date: Date, locale: Locale) {
  return formatDateTime(date, locale);
}
