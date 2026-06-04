import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { DashboardMetrics } from "@/server/reports/queries";

export function AdminMetricsCards({
  metrics,
  locale,
}: {
  metrics: DashboardMetrics;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const cards = [
    { label: t("admin.metricsSessions"), value: metrics.sessionCount },
    { label: t("admin.metricsRegistrations"), value: metrics.registrationCount },
    {
      label: t("admin.metricsAttendanceRate"),
      value:
        metrics.attendanceRate !== null
          ? `${metrics.attendanceRate}%`
          : "—",
    },
    { label: t("admin.metricsActiveMembers"), value: metrics.activeParticipants },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">{stat.value}</CardTitle>
            <CardDescription>{stat.label}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
