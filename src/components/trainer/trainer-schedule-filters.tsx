import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { ScheduleFilter } from "@/server/trainer/queries";

export function TrainerScheduleFilters({
  currentFilter,
  locale,
}: {
  currentFilter: ScheduleFilter;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const filters: { value: ScheduleFilter; label: string }[] = [
    { value: "upcoming", label: t("common.upcoming") },
    { value: "past", label: t("common.past") },
    { value: "cancelled", label: t("common.cancelled") },
  ];

  return (
    <FilterLinkTabs
      basePath="/trainer/schedule"
      paramName="filter"
      options={filters}
      currentValue={currentFilter}
      defaultValue="upcoming"
      ariaLabel={t("common.filterSchedule")}
    />
  );
}
