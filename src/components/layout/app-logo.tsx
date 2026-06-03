import Link from "next/link";

import { APP_LOGO_SRC, APP_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 max-w-[6.5rem]",
  md: "h-10 max-w-[8rem]",
  lg: "h-14 max-w-[11rem]",
} as const;

export function AppLogo({
  size = "sm",
  className,
  href,
  priority = false,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
  href?: string;
  priority?: boolean;
}) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- brand SVG from /public
    <img
      src={APP_LOGO_SRC}
      alt={APP_NAME}
      width={120}
      height={100}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn("w-auto object-contain object-left", sizeClasses[size], className)}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {image}
      </Link>
    );
  }

  return image;
}
