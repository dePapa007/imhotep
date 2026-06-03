import { AppLogo } from "@/components/layout/app-logo";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 p-8"
    >
      <AppLogo size="md" />
      <span className="border-muted border-t-primary size-8 animate-spin rounded-full border-2" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
