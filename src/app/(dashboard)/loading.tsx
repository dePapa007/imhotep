import { ListSkeleton } from "@/components/ui/skeleton";
import { createTranslator } from "@/i18n/get-messages";
import { resolveLocale } from "@/i18n/resolve-locale";

export default async function DashboardLoading() {
  const locale = await resolveLocale();
  const t = createTranslator(locale);

  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">{t("common.loadingPage")}</span>
      <ListSkeleton count={3} />
    </div>
  );
}
