import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-[var(--radius-base)]", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border-border bg-card rounded-[var(--radius-base)] border p-4 shadow-sm">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TabBarSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="border-border bg-muted flex gap-1 rounded-[var(--radius-base)] p-1">
      {Array.from({ length: tabs }, (_, i) => (
        <Skeleton key={i} className="h-9 flex-1" />
      ))}
    </div>
  );
}
