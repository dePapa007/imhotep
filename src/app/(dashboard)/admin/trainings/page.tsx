import type { Metadata } from "next";
import type { SessionStatus } from "@prisma/client";

import { SessionsList } from "@/components/admin/sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import {
  getRangeBounds,
  RANGE_VALUES,
  type RangeType,
} from "@/lib/date-groups";
import type { ListSessionsFilters } from "@/server/trainings/queries";
import { requireRole } from "@/server/auth/dal";

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

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.calendarTitle") };
}

export default async function AdminTrainingsPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
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
        title={t("admin.calendarTitle")}
        description={t("admin.calendarDescription")}
      />
      <SessionsList
        filters={filters}
        range={range}
        locale={user.preferredLocale}
        preservedParams={{
          category: params.category,
          trainer: params.trainer,
          status: params.status,
        }}
      />
    </div>
  );
}
