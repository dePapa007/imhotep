import type { Metadata } from "next";

import { TrainerScheduleFilters } from "@/components/trainer/trainer-schedule-filters";
import { TrainerSessionsList } from "@/components/trainer/trainer-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import { requireRole } from "@/server/auth/dal";
import {
  listAssignedSessions,
  SCHEDULE_FILTERS,
  type ScheduleFilter,
} from "@/server/trainer/queries";

export const metadata: Metadata = {
  title: "Schedule",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function TrainerSchedulePage({ searchParams }: PageProps) {
  const user = await requireRole("TRAINER");
  const params = await searchParams;

  const filter: ScheduleFilter =
    params.filter &&
    (SCHEDULE_FILTERS as readonly string[]).includes(params.filter)
      ? (params.filter as ScheduleFilter)
      : "upcoming";

  const sessions = await listAssignedSessions(user.id, filter);

  return (
    <div>
      <PageHeading
        title="My schedule"
        description="Trainings you are assigned to."
      />
      <div className="flex flex-col gap-4">
        <TrainerScheduleFilters currentFilter={filter} />
        <TrainerSessionsList sessions={sessions} filter={filter} />
      </div>
    </div>
  );
}
