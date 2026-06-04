import { AppLogo } from "@/components/layout/app-logo";
import { createTranslator } from "@/i18n/get-messages";
import { resolveLocale } from "@/i18n/resolve-locale";

export default async function Loading() {
  const locale = await resolveLocale();
  const t = createTranslator(locale);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 p-8"
    >
      <AppLogo size="md" />
      <span className="border-muted border-t-primary size-8 animate-spin rounded-full border-2 motion-reduce:animate-none" />
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}
