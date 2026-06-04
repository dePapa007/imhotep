import type { Metadata } from "next";

import { TrainerScheduleFilters } from "@/components/trainer/trainer-schedule-filters";
import { TrainerSessionsList } from "@/components/trainer/trainer-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { requireRole } from "@/server/auth/dal";
import {
  listAssignedSessions,
  SCHEDULE_FILTERS,
  type ScheduleFilter,
} from "@/server/trainer/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("trainer.scheduleTitle") };
}

export default async function TrainerSchedulePage({ searchParams }: PageProps) {
  const user = await requireRole("TRAINER");
  const t = createTranslator(user.preferredLocale);
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
        title={t("trainer.mySchedule")}
        description={t("trainer.scheduleDescription")}
      />
      <div className="flex flex-col gap-4">
        <TrainerScheduleFilters
          currentFilter={filter}
          locale={user.preferredLocale}
        />
        <TrainerSessionsList
          sessions={sessions}
          filter={filter}
          locale={user.preferredLocale}
        />
      </div>
    </div>
  );
}
