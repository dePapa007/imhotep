import type { Metadata } from "next";
import { AdminMetricsCards } from "@/components/admin/admin-metrics-cards";
import { ReportExportLinks } from "@/components/admin/report-export-links";
import { ReportRangeTabs } from "@/components/admin/report-range-tabs";
import { ReportsOverview } from "@/components/admin/reports-overview";
import { PageHeading } from "@/components/layout/page-heading";
import {
  getReportRangeBounds,
  parseReportRange,
  reportRangeLabel,
} from "@/lib/report-range";
import { requireRole } from "@/server/auth/dal";
import {
  getDashboardMetrics,
  listCategoryActivity,
  listRegistrationsPerTraining,
  listTrainerWorkload,
  listUserParticipation,
} from "@/server/reports/queries";

export const metadata: Metadata = {
  title: "Reports",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const range = parseReportRange(params.range, "month");
  const bounds = getReportRangeBounds(range);

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
        title="Reports & insights"
        description={`Overview for ${reportRangeLabel[range].toLowerCase()}.`}
      />

      <ReportRangeTabs basePath="/admin/reports" currentRange={range} />

      <div className="mt-4">
        <AdminMetricsCards metrics={metrics} />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Export data</h2>
        <ReportExportLinks range={range} />
      </div>

      <div className="mt-8">
        <ReportsOverview
          trainings={trainings}
          categories={categories}
          trainers={trainers}
          participation={participation}
        />
      </div>
    </div>
  );
}
