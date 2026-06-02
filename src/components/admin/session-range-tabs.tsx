"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import type { RangeType } from "@/lib/date-groups";

const ranges: { value: RangeType; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export function SessionRangeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("range") ?? "week") as RangeType;

  function setRange(range: RangeType) {
    const params = new URLSearchParams(searchParams.toString());
    if (range === "week") params.delete("range");
    else params.set("range", range);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="border-border bg-muted flex rounded-[var(--radius-base)] p-1">
      {ranges.map(({ value, label }) => {
        const active = current === value || (value === "week" && !searchParams.get("range"));
        return (
          <button
            key={value}
            type="button"
            onClick={() => setRange(value)}
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
