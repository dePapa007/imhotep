import Link from "next/link";

import { SessionFilters } from "@/components/admin/session-filters";
import { SessionRangeTabs } from "@/components/admin/session-range-tabs";
import { SessionsDayList } from "@/components/admin/sessions-day-list";
import { buttonClasses } from "@/components/ui/button";
import { listCategories } from "@/server/users/queries";
import {
  listActiveTrainers,
  listSessions,
  type ListSessionsFilters,
} from "@/server/trainings/queries";

export async function SessionsList({
  filters,
}: {
  filters: ListSessionsFilters;
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

      <SessionRangeTabs />
      <SessionFilters categories={categories} trainers={trainers} />
      <SessionsDayList sessions={sessions} />
    </div>
  );
}
