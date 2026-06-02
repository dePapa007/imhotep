import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "muted" | "success" | "destructive";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
  success: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
