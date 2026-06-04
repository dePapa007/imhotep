import { ListSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <ListSkeleton count={3} />
    </div>
  );
}
