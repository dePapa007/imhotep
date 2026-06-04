import type { Metadata } from "next";

import { SessionRangeTabs } from "@/components/admin/session-range-tabs";
import { AvailableSessionsList } from "@/components/user/available-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getRangeBounds,
  RANGE_VALUES,
  type RangeType,
} from "@/lib/date-groups";
import { requireRole } from "@/server/auth/dal";
import { listAvailableSessionsForUser } from "@/server/registrations/queries";

export const metadata: Metadata = {
  title: "Browse trainings",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function UserBrowsePage({ searchParams }: PageProps) {
  const user = await requireRole("USER");
  const params = await searchParams;

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title="Browse trainings"
          description="Eligible trainings in your category."
        />
        <EmptyState
          title="No category assigned"
          description="Ask an administrator to assign you to a category first."
        />
      </div>
    );
  }

  const range: RangeType =
    params.range && (RANGE_VALUES as readonly string[]).includes(params.range)
      ? (params.range as RangeType)
      : "week";

  const bounds = getRangeBounds(range);
  const sessions = await listAvailableSessionsForUser(user.id, bounds);

  return (
    <div>
      <PageHeading
        title="Browse trainings"
        description="Upcoming trainings you can register for."
      />
      <div className="flex flex-col gap-4">
        <SessionRangeTabs basePath="/user/browse" currentRange={range} />
        <AvailableSessionsList sessions={sessions} />
      </div>
    </div>
  );
}
