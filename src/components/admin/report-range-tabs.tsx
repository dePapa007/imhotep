import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import type { ReportRangeType } from "@/lib/report-range";

const ranges: { value: ReportRangeType; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "season", label: "Season" },
  { value: "all", label: "All" },
];

export function ReportRangeTabs({
  basePath,
  currentRange,
  defaultRange = "month",
}: {
  basePath: string;
  currentRange: ReportRangeType;
  defaultRange?: ReportRangeType;
}) {
  return (
    <FilterLinkTabs
      basePath={basePath}
      paramName="range"
      options={ranges}
      currentValue={currentRange}
      defaultValue={defaultRange}
      ariaLabel="Report period"
    />
  );
}
