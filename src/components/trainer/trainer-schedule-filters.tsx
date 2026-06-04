import { FilterLinkTabs } from "@/components/ui/filter-link-tabs";
import type { ScheduleFilter } from "@/server/trainer/queries";

const filters: { value: ScheduleFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

export function TrainerScheduleFilters({
  currentFilter,
}: {
  currentFilter: ScheduleFilter;
}) {
  return (
    <FilterLinkTabs
      basePath="/trainer/schedule"
      paramName="filter"
      options={filters}
      currentValue={currentFilter}
      defaultValue="upcoming"
      ariaLabel="Schedule filter"
    />
  );
}
