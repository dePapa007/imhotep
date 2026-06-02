"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import type { ScheduleFilter } from "@/server/trainer/queries";

const filters: { value: ScheduleFilter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

export function TrainerScheduleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("filter") ?? "upcoming") as ScheduleFilter;

  function setFilter(filter: ScheduleFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "upcoming") params.delete("filter");
    else params.set("filter", filter);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="border-border bg-muted flex rounded-[var(--radius-base)] p-1">
      {filters.map(({ value, label }) => {
        const active =
          current === value ||
          (value === "upcoming" && !searchParams.get("filter"));
        return (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "flex-1 rounded-[calc(var(--radius-base)-2px)] py-2 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
