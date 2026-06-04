import type { Metadata } from "next";
import Link from "next/link";

import { AdminMetricsCards } from "@/components/admin/admin-metrics-cards";
import { ReportRangeTabs } from "@/components/admin/report-range-tabs";
import { PageHeading } from "@/components/layout/page-heading";
import { buttonClasses } from "@/components/ui/button";
import {
  getReportRangeBounds,
  parseReportRange,
  reportRangeLabel,
} from "@/lib/report-range";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth/dal";
import { getDashboardMetrics } from "@/server/reports/queries";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const range = parseReportRange(params.range, "month");
  const bounds = getReportRangeBounds(range);

  const [users, categories, metrics] = await Promise.all([
    prisma.user.count({ where: { role: "USER", active: true } }),
    prisma.category.count({ where: { active: true } }),
    getDashboardMetrics(bounds),
  ]);

  return (
    <div>
      <PageHeading
        title="Admin dashboard"
        description={`Academy overview · ${reportRangeLabel[range].toLowerCase()}.`}
      />

      <ReportRangeTabs basePath="/admin" currentRange={range} />

      <div className="mt-4">
        <AdminMetricsCards metrics={metrics} />
      </div>

      <p className="text-muted-foreground mt-3 text-xs">
        {users} active members · {categories} active categories
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/admin/reports" className={buttonClasses()}>
          Reports & exports
        </Link>
        <Link href="/admin/users" className={buttonClasses({ variant: "outline" })}>
          Manage users
        </Link>
        <Link
          href="/admin/trainers"
          className={buttonClasses({ variant: "outline" })}
        >
          Manage trainers
        </Link>
        <Link
          href="/admin/categories"
          className={buttonClasses({ variant: "outline" })}
        >
          Manage categories
        </Link>
        <Link
          href="/admin/trainings"
          className={buttonClasses({ variant: "outline" })}
        >
          Training calendar
        </Link>
      </div>
    </div>
  );
}
