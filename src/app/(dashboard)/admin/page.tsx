import type { Metadata } from "next";
import Link from "next/link";

import { AdminMetricsCards } from "@/components/admin/admin-metrics-cards";
import { ReportRangeTabs } from "@/components/admin/report-range-tabs";
import { PageHeading } from "@/components/layout/page-heading";
import { buttonClasses } from "@/components/ui/button";
import { createTranslator } from "@/i18n/get-messages";
import { reportRangeLabel } from "@/i18n/format";
import { getReportRangeBounds, parseReportRange } from "@/lib/report-range";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth/dal";
import { getDashboardMetrics } from "@/server/reports/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  return { title: t("admin.dashboardTitle") };
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const user = await requireRole("ADMIN");
  const t = createTranslator(user.preferredLocale);
  const params = await searchParams;
  const range = parseReportRange(params.range, "month");
  const bounds = getReportRangeBounds(range);
  const period = reportRangeLabel(range, user.preferredLocale);

  const [users, categories, metrics] = await Promise.all([
    prisma.user.count({ where: { role: "USER", active: true } }),
    prisma.category.count({ where: { active: true } }),
    getDashboardMetrics(bounds),
  ]);

  return (
    <div>
      <PageHeading
        title={t("admin.dashboardTitle")}
        description={t("admin.dashboardDescription", { period })}
      />

      <ReportRangeTabs
        basePath="/admin"
        currentRange={range}
        locale={user.preferredLocale}
      />

      <div className="mt-4">
        <AdminMetricsCards
          metrics={metrics}
          locale={user.preferredLocale}
        />
      </div>

      <p className="text-muted-foreground mt-3 text-xs">
        {t("admin.activeMembers", {
          users,
          categories,
        })}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/admin/reports" className={buttonClasses()}>
          {t("admin.reportsLink")}
        </Link>
        <Link href="/admin/users" className={buttonClasses({ variant: "outline" })}>
          {t("admin.manageUsers")}
        </Link>
        <Link
          href="/admin/trainers"
          className={buttonClasses({ variant: "outline" })}
        >
          {t("admin.manageTrainers")}
        </Link>
        <Link
          href="/admin/categories"
          className={buttonClasses({ variant: "outline" })}
        >
          {t("admin.manageCategories")}
        </Link>
        <Link
          href="/admin/trainings"
          className={buttonClasses({ variant: "outline" })}
        >
          {t("admin.trainingCalendar")}
        </Link>
      </div>
    </div>
  );
}
