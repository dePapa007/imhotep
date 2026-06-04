import Link from "next/link";

import { SessionFilters } from "@/components/admin/session-filters";
import { SessionRangeTabs } from "@/components/admin/session-range-tabs";
import { SessionsDayList } from "@/components/admin/sessions-day-list";
import { buttonClasses } from "@/components/ui/button";
import { listCategories } from "@/server/users/queries";
import type { RangeType } from "@/lib/date-groups";
import {
  listActiveTrainers,
  listSessions,
  type ListSessionsFilters,
} from "@/server/trainings/queries";

export async function SessionsList({
  filters,
  range,
  preservedParams = {},
}: {
  filters: ListSessionsFilters;
  range: RangeType;
  preservedParams?: Record<string, string | undefined>;
}) {
  const [sessions, categories, trainers] = await Promise.all([
    listSessions(filters),
    listCategories(),
    listActiveTrainers(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/trainings/new" className={buttonClasses()}>
        New training
      </Link>

      <SessionRangeTabs
        currentRange={range}
        preservedParams={preservedParams}
      />
      <SessionFilters categories={categories} trainers={trainers} />
      <SessionsDayList sessions={sessions} />
    </div>
  );
}
