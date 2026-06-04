"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

/** Longest prefix match so role home (/admin) is not active on every sub-route. */
function getActiveHref(pathname: string, items: NavItem[]): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.href.length)) {
      best = item;
    }
  }
  return best?.href ?? null;
}

export function BottomNav({
  items,
  ariaLabel,
}: {
  items: NavItem[];
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname, items);

  return (
    <nav
      aria-label={ariaLabel}
      className="border-border bg-card sticky bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
