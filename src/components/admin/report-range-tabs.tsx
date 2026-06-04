import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { ReportRangeType } from "@/lib/report-range";

export function ReportRangeTabs({
  basePath,
  currentRange,
  defaultRange = "month",
  locale,
}: {
  basePath: string;
  currentRange: ReportRangeType;
  defaultRange?: ReportRangeType;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const ranges: { value: ReportRangeType; label: string }[] = [
    { value: "week", label: t("common.week") },
    { value: "month", label: t("common.month") },
    { value: "season", label: t("common.season") },
    { value: "all", label: t("common.all") },
  ];

  return (
    <FilterLinkTabs
      basePath={basePath}
      paramName="range"
      options={ranges}
      currentValue={currentRange}
      defaultValue={defaultRange}
      ariaLabel={t("common.filterPeriod")}
    />
  );
}
