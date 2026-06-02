import type { Metadata } from "next";
import type { SessionStatus } from "@prisma/client";

import { SessionsList } from "@/components/admin/sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import {
  getRangeBounds,
  RANGE_VALUES,
  type RangeType,
} from "@/lib/date-groups";
import type { ListSessionsFilters } from "@/server/trainings/queries";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Training calendar",
};

export const dynamic = "force-dynamic";

const STATUS_VALUES: SessionStatus[] = ["SCHEDULED", "CANCELLED", "COMPLETED"];

interface PageProps {
  searchParams: Promise<{
    range?: string;
    category?: string;
    trainer?: string;
    status?: string;
  }>;
}

export default async function AdminTrainingsPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;

  const range: RangeType =
    params.range && (RANGE_VALUES as readonly string[]).includes(params.range)
      ? (params.range as RangeType)
      : "week";

  const bounds = getRangeBounds(range);

  const filters: ListSessionsFilters = {};
  if (bounds.from) filters.from = bounds.from;
  if (bounds.to) filters.to = bounds.to;
  if (params.category) filters.categoryId = params.category;
  if (params.trainer) filters.trainerId = params.trainer;
  if (params.status && STATUS_VALUES.includes(params.status as SessionStatus)) {
    filters.status = params.status as SessionStatus;
  }

  return (
    <div>
      <PageHeading
        title="Training calendar"
        description="View and manage all scheduled trainings."
      />
      <SessionsList filters={filters} />
    </div>
  );
}
