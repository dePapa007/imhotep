import type { Metadata } from "next";
import { AdminMetricsCards } from "@/components/admin/admin-metrics-cards";
import { ReportExportLinks } from "@/components/admin/report-export-links";
import { ReportRangeTabs } from "@/components/admin/report-range-tabs";
import { ReportsOverview } from "@/components/admin/reports-overview";
import { PageHeading } from "@/components/layout/page-heading";
import { createTranslator } from "@/i18n/get-messages";
import { reportRangeLabel } from "@/i18n/format";
import { getReportRangeBounds, parseReportRange } from "@/lib/report-range";
import { requireRole } from "@/server/auth/dal";
import {
  getDashboardMetrics,
  listCategoryActivity,
  listRegistrationsPerTraining,
  listTrainerWorkload,
  listUserParticipation,
} from "@/server/reports/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.reportsTitle") };
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;
  const range = parseReportRange(params.range, "month");
  const bounds = getReportRangeBounds(range);
  const period = reportRangeLabel(range, user.preferredLocale);

  const [
    metrics,
    trainings,
    categories,
    trainers,
    participation,
  ] = await Promise.all([
    getDashboardMetrics(bounds),
    listRegistrationsPerTraining(bounds),
    listCategoryActivity(bounds),
    listTrainerWorkload(bounds),
    listUserParticipation(bounds),
  ]);

  return (
    <div>
      <PageHeading
        title={t("admin.reportsTitle")}
        description={t("admin.reportsDescription", { period })}
      />

      <ReportRangeTabs
        basePath="/admin/reports"
        currentRange={range}
        locale={user.preferredLocale}
      />

      <div className="mt-4">
        <AdminMetricsCards
          metrics={metrics}
          locale={user.preferredLocale}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">{t("admin.exportData")}</h2>
        <ReportExportLinks
          range={range}
          locale={user.preferredLocale}
        />
      </div>

      <div className="mt-8">
        <ReportsOverview
          trainings={trainings}
          categories={categories}
          trainers={trainers}
          participation={participation}
          locale={user.preferredLocale}
        />
      </div>
    </div>
  );
}
