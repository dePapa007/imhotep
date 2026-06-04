import Link from "next/link";

export function SkipLink({ label }: { label: string }) {
  return (
    <Link
      href="#main-content"
      className="bg-primary text-primary-foreground focus:not-sr-only sr-only fixed top-2 left-2 z-50 rounded-[var(--radius-base)] px-4 py-2 text-sm font-medium focus:px-4 focus:py-2"
    >
      {label}
    </Link>
  );
}
