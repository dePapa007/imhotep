import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center",
        className,
      )}
    >
      <h1 className="text-xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
