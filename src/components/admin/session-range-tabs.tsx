import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import type { RangeType } from "@/lib/date-groups";

const ranges: { value: RangeType; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export function SessionRangeTabs({
  basePath = "/admin/trainings",
  currentRange,
  preservedParams = {},
}: {
  basePath?: string;
  currentRange: RangeType;
  preservedParams?: Record<string, string | undefined>;
}) {
  return (
    <FilterLinkTabs
      basePath={basePath}
      paramName="range"
      options={ranges}
      currentValue={currentRange}
      defaultValue="week"
      preservedParams={preservedParams}
      ariaLabel="Date range"
    />
  );
}
