import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { RangeType } from "@/lib/date-groups";

export function SessionRangeTabs({
  basePath = "/admin/trainings",
  currentRange,
  preservedParams = {},
  locale,
}: {
  basePath?: string;
  currentRange: RangeType;
  preservedParams?: Record<string, string | undefined>;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const ranges: { value: RangeType; label: string }[] = [
    { value: "day", label: t("common.day") },
    { value: "week", label: t("common.week") },
    { value: "month", label: t("common.month") },
    { value: "all", label: t("common.all") },
  ];

  return (
    <FilterLinkTabs
      basePath={basePath}
      paramName="range"
      options={ranges}
      currentValue={currentRange}
      defaultValue="week"
      preservedParams={preservedParams}
      ariaLabel={t("common.filterDateRange")}
    />
  );
}
