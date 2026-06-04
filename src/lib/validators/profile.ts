import { z } from "zod";

import { LOCALES } from "@/i18n/locales";

export const updateLocaleSchema = z.object({
  locale: z.enum(LOCALES),
});

export type UpdateLocaleInput = z.infer<typeof updateLocaleSchema>;
