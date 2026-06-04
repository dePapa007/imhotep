import type { Metadata } from "next";

import { SessionRangeTabs } from "@/components/admin/session-range-tabs";
import { AvailableSessionsList } from "@/components/user/available-sessions-list";
import { PageHeading } from "@/components/layout/page-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import {
  getRangeBounds,
  RANGE_VALUES,
  type RangeType,
} from "@/lib/date-groups";
import { requireRole } from "@/server/auth/dal";
import { listAvailableSessionsForUser } from "@/server/registrations/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  return { title: t("user.browsePageTitle") };
}

export default async function UserBrowsePage({ searchParams }: PageProps) {
  const user = await requireRole("USER");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;

  if (!user.categoryId) {
    return (
      <div>
        <PageHeading
          title={t("user.browsePageTitle")}
          description={t("user.browseNoCategoryDesc")}
        />
        <EmptyState
          title={t("user.noCategoryTitle")}
          description={t("user.noCategoryDesc")}
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
        title={t("user.browsePageTitle")}
        description={t("user.browseDescription")}
      />
      <div className="flex flex-col gap-4">
        <SessionRangeTabs
          basePath="/user/browse"
          currentRange={range}
          locale={user.preferredLocale}
        />
        <AvailableSessionsList
          sessions={sessions}
          locale={user.preferredLocale}
        />
      </div>
    </div>
  );
}
