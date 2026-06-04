import Link from "next/link";

import { cn } from "@/lib/utils";

export interface FilterTabOption {
  value: string;
  label: string;
}

export function FilterLinkTabs({
  basePath,
  paramName,
  options,
  currentValue,
  defaultValue,
  preservedParams = {},
  ariaLabel = "Filter",
}: {
  basePath: string;
  paramName: string;
  options: FilterTabOption[];
  currentValue: string;
  defaultValue: string;
  preservedParams?: Record<string, string | undefined>;
  ariaLabel?: string;
}) {
  function buildHref(value: string): string {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(preservedParams)) {
      if (val) params.set(key, val);
    }
    if (value !== defaultValue) params.set(paramName, value);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="border-border bg-muted flex rounded-[var(--radius-base)] p-1"
    >
      {options.map(({ value, label }) => {
        const active = currentValue === value;
        return (
          <Link
            key={value}
            href={buildHref(value)}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={cn(
              "flex-1 rounded-[calc(var(--radius-base)-2px)] py-2 text-center text-xs font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
